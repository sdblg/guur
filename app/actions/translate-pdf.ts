"use server";

import { TranslationServiceClient } from "@google-cloud/translate/build/src/v3";
import * as deepl from "deepl-node";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { PDFParse } from "pdf-parse";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPE = "application/pdf";

export type TranslateResult =
  | { ok: true; filename: string; data: string } // base64
  | { ok: false; error: string };

export async function translatePdfToDocx(
  formData: FormData
): Promise<TranslateResult> {
  const file = formData.get("file") as File | null;
  if (!file) {
    return { ok: false, error: "Файл оруулаагүй байна." };
  }

  if (file.type !== ALLOWED_TYPE) {
    return { ok: false, error: "Зөвхөн PDF файл оруулна уу." };
  }

  if (file.size > MAX_PDF_SIZE) {
    return { ok: false, error: "Файлын хэмжээ 10 MB-аас хэтрэхгүй байна." };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let rawText: string;
  try {
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    rawText = textResult.text?.trim() ?? "";
    await parser.destroy();
  } catch (e) {
    console.error("PDF parse error:", e);
    return { ok: false, error: "PDF файлыг унших үед алдаа гарлаа." };
  }

  if (!rawText) {
    return { ok: false, error: "PDF-ээс текст олдсонгүй." };
  }

  const deeplKey = process.env.DEEPL_AUTH_KEY;
  if (!deeplKey) {
    return { ok: false, error: "DeepL тохиргоо дутуу байна (DEEPL_AUTH_KEY)." };
  }

  let enText: string;
  try {
    const translator = new deepl.Translator(deeplKey);
    const result = await translator.translateText(
      rawText,
      "ko" as deepl.SourceLanguageCode,
      "en-US" as deepl.TargetLanguageCode
    );
    enText = result.text;
  } catch (e) {
    console.error("DeepL error:", e);
    return { ok: false, error: "Солонгос → Англи орчуулга амжилтгүй (DeepL)." };
  }

  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT;
  if (!projectId) {
    return { ok: false, error: "Google Cloud тохиргоо дутуу байна (GOOGLE_CLOUD_PROJECT)." };
  }

  let mnText: string;
  try {
    const translate = new TranslationServiceClient();
    const location = "global";
    const [response] = await translate.translateText({
      parent: `projects/${projectId}/locations/${location}`,
      contents: [enText],
      mimeType: "text/plain",
      sourceLanguageCode: "en",
      targetLanguageCode: "mn",
    });
    const translation = response.translations?.[0];
    if (!translation?.translatedText) {
      throw new Error("No translation returned");
    }
    mnText = translation.translatedText;
  } catch (e) {
    console.error("Google Translate error:", e);
    return { ok: false, error: "Англи → Монгол орчуулга амжилтгүй (Google Translate)." };
  }

  const paragraphs = mnText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => new Paragraph({ children: [new TextRun(line)] }));

  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({ children: [new TextRun(mnText)] }));
  }

  const doc = new Document({
    creator: "Guur",
    title: "Translated Document",
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const docBuffer = await Packer.toBuffer(doc);
  const base64 = docBuffer.toString("base64");
  const baseName = file.name.replace(/\.pdf$/i, "") || "document";
  const filename = `${baseName}-mn.docx`;

  return { ok: true, filename, data: base64 };
}

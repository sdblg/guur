"use server";

import path from "node:path";
import { TranslationServiceClient } from "@google-cloud/translate/build/src/v3";
import * as deepl from "deepl-node";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { PDFParse } from "pdf-parse";
import { segmentByBibleRefs } from "@/lib/bible-refs";
import { getVerseText } from "@/lib/mongolian-bible";

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
    const workerPath = path.join(
      process.cwd(),
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
    );
    PDFParse.setWorker(workerPath);
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

  // Христийн сургаалын орчуулагч: Библийн эшлэлийг өөрөө орчуулахгүй, Монгол Ариун Библи (2013)-аас үг үсэггүй хуулна.
  const segments = segmentByBibleRefs(rawText);
  const DELIM = "\n\n<<<GUUR_SEG>>>\n\n";
  const textOnly = segments
    .filter((s): s is { type: "text"; content: string } => s.type === "text")
    .map((s) => s.content);
  const verseRefs = segments
    .filter((s): s is { type: "verse"; ref: import("@/lib/bible-refs").BibleRef } => s.type === "verse")
    .map((s) => s.ref);

  const toTranslate = textOnly.join(DELIM);
  const isEmpty = !toTranslate || (textOnly.length === 1 && !textOnly[0].trim());

  const deeplKey = process.env.DEEPL_AUTH_KEY;
  if (!deeplKey) {
    return { ok: false, error: "DeepL тохиргоо дутуу байна (DEEPL_AUTH_KEY)." };
  }

  let enText: string;
  try {
    const translator = new deepl.Translator(deeplKey);
    const result = isEmpty
      ? { text: "" }
      : await translator.translateText(
          toTranslate,
          "ko" as deepl.SourceLanguageCode,
          "en-US" as deepl.TargetLanguageCode
        );
    enText = result.text;
  } catch (e) {
    console.error("DeepL error:", e);
    return { ok: false, error: "Солонгос → Англи орчуулга амжилтгүй (DeepL)." };
  }

  let projectId =
    (process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT)?.trim() ?? "";
  projectId = projectId.toLowerCase().replace(/[^a-z0-9.-]/g, "");
  if (!projectId) {
    return {
      ok: false,
      error:
        "Google Cloud тохиргоо дутуу байна (GOOGLE_CLOUD_PROJECT). Төслийн ID нь жижиг үсэг, цифр, зураас байна (жишээ: my-project-123).",
    };
  }

  let translatedTextParts: string[];
  try {
    if (isEmpty) {
      translatedTextParts = textOnly;
    } else {
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
      translatedTextParts = translation.translatedText.split(DELIM);
    }
  } catch (e) {
    console.error("Google Translate error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    const code = (e as { code?: number })?.code;
    if (/default credentials|GOOGLE_APPLICATION_CREDENTIALS|authentication/i.test(msg)) {
      return {
        ok: false,
        error:
          "Google Cloud нэвтрэл олдсонгүй. .env дотор GOOGLE_APPLICATION_CREDENTIALS=service-account.json гэж тохируулна уу, эсвэл терминалд: gcloud auth application-default login",
      };
    }
    if (/Invalid.*parent|Invalid resource name project id|project id/i.test(msg)) {
      return {
        ok: false,
        error:
          "GOOGLE_CLOUD_PROJECT буруу байна. Төслийн ID-г ашиглана уу (жижиг үсэг, цифр, зураас л зөвшөөрөгдөнө). Console → Home дээрээс «Project ID»-г харна уу.",
      };
    }
    if (code === 7 || /PERMISSION_DENIED/i.test(msg)) {
      return {
        ok: false,
        error:
          "Эрх байхгүй (PERMISSION_DENIED). Cloud Translation API идэвхжүүлж, service account-д «Cloud Translation API User» эрх өгнө үү. Заавар: data/README.md",
      };
    }
    return { ok: false, error: "Англи → Монгол орчуулга амжилтгүй (Google Translate)." };
  }

  const verseTexts = await Promise.all(
    verseRefs.map((ref) => getVerseText(ref))
  );

  let textPartIndex = 0;
  let versePartIndex = 0;
  const finalParts: string[] = [];
  for (const seg of segments) {
    if (seg.type === "text") {
      finalParts.push(translatedTextParts[textPartIndex] ?? seg.content);
      textPartIndex++;
    } else {
      const official = verseTexts[versePartIndex];
      finalParts.push(official ?? seg.ref.sourceText);
      versePartIndex++;
    }
  }
  const mnText = finalParts.join("");

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

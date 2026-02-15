/**
 * Монгол Ариун Библи — эшлэл авах.
 * Эхлээд API.Bible-аас 2004 оны хувилбарыг татаж ашиглана (API_BIBLE_KEY тохируулсан бол).
 * Үгүй бол data/mongolian-bible-2013.json (локал дээж) ашиглана.
 */

import type { BibleRef } from "./bible-refs";
import {
  fetchVerse,
  getMongolian2004BibleId,
} from "./bible-api";

export type MongolianBibleData = Record<
  string,
  Record<string, Record<string, string>>
>;
// e.g. { "GEN": { "1": { "1": "Нэгдүгээр эхлэлд...", "2": "..." } }, "JHN": { "3": { "16": "..." } } }

let cached: MongolianBibleData | null = null;

async function loadLocalBibleData(): Promise<MongolianBibleData> {
  if (cached) return cached;
  try {
    const mod = await import("@/data/mongolian-bible-2013.json");
    const data = mod.default as MongolianBibleData;
    cached = data;
    return data;
  } catch {
    cached = {};
    return {};
  }
}

/**
 * API.Bible-аас Монгол Ариун Библи 2004 (АБ2004) эшлэл татаж авна.
 */
async function getVerseTextFromApi(ref: BibleRef): Promise<string | null> {
  const apiKey = process.env.API_BIBLE_KEY;
  if (!apiKey) return null;

  const bibleId = await getMongolian2004BibleId(apiKey);
  if (!bibleId) return null;

  const end = ref.verseEnd ?? ref.verseStart;
  const parts: string[] = [];
  for (let v = ref.verseStart; v <= end; v++) {
    const verseId = `${ref.bookId}.${ref.chapter}.${v}`;
    const text = await fetchVerse(bibleId, verseId, apiKey);
    if (text) parts.push(text);
  }
  return parts.length > 0 ? parts.join(" ") : null;
}

/**
 * Нэг эшлэлийн текстийг авна: эхлээд API (2004), дараа нь локал JSON (2013).
 * Хэдэн дугаарыг (3:16-18) нэг текст болгон нэгтгэнэ.
 */
export async function getVerseText(ref: BibleRef): Promise<string | null> {
  const fromApi = await getVerseTextFromApi(ref);
  if (fromApi) return fromApi;

  const data = await loadLocalBibleData();
  const book = data[ref.bookId];
  if (!book) return null;
  const chapter = book[String(ref.chapter)];
  if (!chapter) return null;

  const verses: string[] = [];
  const end = ref.verseEnd ?? ref.verseStart;
  for (let v = ref.verseStart; v <= end; v++) {
    const t = chapter[String(v)];
    if (t) verses.push(t);
  }
  return verses.length > 0 ? verses.join(" ") : null;
}

/**
 * Сегментүүд дотор verse төрлийн сегмент бүрийг Монгол Библийн текстээр орлуулна.
 */
export async function fillVerseSegments(
  segments: ({ type: "text"; content: string } | { type: "verse"; ref: BibleRef })[]
): Promise<string[]> {
  const result: string[] = [];
  for (const seg of segments) {
    if (seg.type === "text") {
      result.push(seg.content);
    } else {
      const text = await getVerseText(seg.ref);
      result.push(text ?? seg.ref.sourceText);
    }
  }
  return result;
}

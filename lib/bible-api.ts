/**
 * API.Bible — Монгол Ариун Библи 2004 (АБ2004) эшлэл татаж авах.
 * https://scripture.api.bible/
 */

const API_BASE = "https://api.scripture.api.bible/v1";

export type BibleInfo = {
  id: string;
  name: string;
  language: { id: string; name: string };
};

let cachedMongolian2004Id: string | null = null;

/**
 * Монгол хэл (khk) болон 2004 гэсэн нэртэй библийн ID-г олно.
 */
export async function getMongolian2004BibleId(
  apiKey: string
): Promise<string | null> {
  if (cachedMongolian2004Id) return cachedMongolian2004Id;

  const res = await fetch(
    `${API_BASE}/bibles?language=khk`,
    { headers: { "api-key": apiKey } }
  );
  if (!res.ok) return null;

  const json = (await res.json()) as { data?: BibleInfo[] };
  const bibles = json.data ?? [];
  const match = bibles.find(
    (b) =>
      /2004/.test(b.name) ||
      /АБ2004|Ариун Библи.*2004/i.test(b.name)
  );
  if (match) {
    cachedMongolian2004Id = match.id;
    return match.id;
  }
  if (bibles.length > 0) {
    cachedMongolian2004Id = bibles[0].id;
    return bibles[0].id;
  }
  return null;
}

/**
 * Нэг эшлэлийн агуулгыг татаж авна (дугааргүй цэвэр текст).
 */
export async function fetchVerse(
  bibleId: string,
  verseId: string,
  apiKey: string
): Promise<string | null> {
  const url = `${API_BASE}/bibles/${bibleId}/verses/${verseId}?content-type=text&include-verse-numbers=false&include-chapter-numbers=false`;
  const res = await fetch(url, { headers: { "api-key": apiKey } });
  if (!res.ok) return null;

  const json = (await res.json()) as { data?: { content?: string } };
  const content = json.data?.content?.trim();
  return content ?? null;
}

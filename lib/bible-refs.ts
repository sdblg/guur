/**
 * Bible reference detection for Korean and English.
 * Maps to standard book IDs (e.g. GEN, JHN) for Mongolian Bible 2013 lookup.
 */

export type BibleRef = {
  start: number;
  end: number;
  bookId: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  sourceText: string;
};

// Korean book name (or common abbreviation) -> standard book ID (66 books)
const KO_BOOK_MAP: Record<string, string> = {
  창세기: "GEN",
  출애굽기: "EXO",
  레위기: "LEV",
  민수기: "NUM",
  신명기: "DEU",
  여호수아: "JOS",
  사사기: "JDG",
  룻기: "RUT",
  사무엘상: "1SA",
  사무엘하: "2SA",
  열왕기상: "1KI",
  열왕기하: "2KI",
  역대상: "1CH",
  역대하: "2CH",
  에스라: "EZR",
  느헤미야: "NEH",
  에스더: "EST",
  욥기: "JOB",
  시편: "PSA",
  잠언: "PRO",
  전도서: "ECC",
  아가: "SNG",
  이사야: "ISA",
  예레미야: "JER",
  예레미야애가: "LAM",
  에스겔: "EZK",
  다니엘: "DAN",
  호세아: "HOS",
  요엘: "JOL",
  아모스: "AMO",
  오바댜: "OBA",
  요나: "JON",
  미가: "MIC",
  나훔: "NAH",
  하박국: "HAB",
  스바냐: "ZEP",
  학개: "HAG",
  스가랴: "ZEC",
  말라기: "MAL",
  마태복음: "MAT",
  마가복음: "MRK",
  누가복음: "LUK",
  요한복음: "JHN",
  사도행전: "ACT",
  로마서: "ROM",
  고린도전서: "1CO",
  고린도후서: "2CO",
  갈라디아서: "GAL",
  에베소서: "EPH",
  빌립보서: "PHP",
  골로새서: "COL",
  데살로니가전서: "1TH",
  데살로니가후서: "2TH",
  디모데전서: "1TI",
  디모데후서: "2TI",
  디도서: "TIT",
  빌레몬서: "PHM",
  히브리서: "HEB",
  야고보서: "JAS",
  베드로전서: "1PE",
  베드로후서: "2PE",
  요한일서: "1JN",
  요한이서: "2JN",
  요한삼서: "3JN",
  유다서: "JUD",
  요한계시록: "REV",
};

// English book name / abbreviation -> book ID
const EN_BOOK_MAP: Record<string, string> = {
  genesis: "GEN",
  gen: "GEN",
  ge: "GEN",
  exodus: "EXO",
  exo: "EXO",
  ex: "EXO",
  leviticus: "LEV",
  lev: "LEV",
  le: "LEV",
  numbers: "NUM",
  num: "NUM",
  nu: "NUM",
  deuteronomy: "DEU",
  deut: "DEU",
  deu: "DEU",
  joshua: "JOS",
  jos: "JOS",
  judges: "JDG",
  jdg: "JDG",
  ruth: "RUT",
  rut: "RUT",
  "1 samuel": "1SA",
  "1samuel": "1SA",
  "1sa": "1SA",
  "2 samuel": "2SA",
  "2samuel": "2SA",
  "2sa": "2SA",
  "1 kings": "1KI",
  "1kings": "1KI",
  "1ki": "1KI",
  "2 kings": "2KI",
  "2kings": "2KI",
  "2ki": "2KI",
  "1 chronicles": "1CH",
  "1chronicles": "1CH",
  "1ch": "1CH",
  "2 chronicles": "2CH",
  "2chronicles": "2CH",
  "2ch": "2CH",
  ezra: "EZR",
  ezr: "EZR",
  nehemiah: "NEH",
  neh: "NEH",
  esther: "EST",
  est: "EST",
  job: "JOB",
  psalms: "PSA",
  psalm: "PSA",
  psa: "PSA",
  ps: "PSA",
  proverbs: "PRO",
  prov: "PRO",
  pro: "PRO",
  ecclesiastes: "ECC",
  ecc: "ECC",
  "song of solomon": "SNG",
  songofsolomon: "SNG",
  sng: "SNG",
  isaiah: "ISA",
  isa: "ISA",
  jeremiah: "JER",
  jer: "JER",
  lamentations: "LAM",
  lam: "LAM",
  ezekiel: "EZK",
  ezk: "EZK",
  daniel: "DAN",
  dan: "DAN",
  hosea: "HOS",
  hos: "HOS",
  joel: "JOL",
  jol: "JOL",
  amos: "AMO",
  amo: "AMO",
  obadiah: "OBA",
  oba: "OBA",
  jonah: "JON",
  jon: "JON",
  micah: "MIC",
  mic: "MIC",
  nahum: "NAH",
  nah: "NAH",
  habakkuk: "HAB",
  hab: "HAB",
  zephaniah: "ZEP",
  zep: "ZEP",
  haggai: "HAG",
  hag: "HAG",
  zechariah: "ZEC",
  zec: "ZEC",
  malachi: "MAL",
  mal: "MAL",
  matthew: "MAT",
  matt: "MAT",
  mt: "MAT",
  mark: "MRK",
  mrk: "MRK",
  mk: "MRK",
  luke: "LUK",
  luk: "LUK",
  lk: "LUK",
  john: "JHN",
  jhn: "JHN",
  joh: "JHN",
  jn: "JHN",
  acts: "ACT",
  act: "ACT",
  romans: "ROM",
  rom: "ROM",
  ro: "ROM",
  "1 corinthians": "1CO",
  "1corinthians": "1CO",
  "1co": "1CO",
  "2 corinthians": "2CO",
  "2corinthians": "2CO",
  "2co": "2CO",
  galatians: "GAL",
  gal: "GAL",
  ephesians: "EPH",
  eph: "EPH",
  philippians: "PHP",
  php: "PHP",
  colossians: "COL",
  col: "COL",
  "1 thessalonians": "1TH",
  "1thessalonians": "1TH",
  "1th": "1TH",
  "2 thessalonians": "2TH",
  "2thessalonians": "2TH",
  "2th": "2TH",
  "1 timothy": "1TI",
  "1timothy": "1TI",
  "1ti": "1TI",
  "2 timothy": "2TI",
  "2timothy": "2TI",
  "2ti": "2TI",
  titus: "TIT",
  tit: "TIT",
  philemon: "PHM",
  phm: "PHM",
  hebrews: "HEB",
  heb: "HEB",
  james: "JAS",
  jas: "JAS",
  "1 peter": "1PE",
  "1peter": "1PE",
  "1pe": "1PE",
  "2 peter": "2PE",
  "2peter": "2PE",
  "2pe": "2PE",
  "1 john": "1JN",
  "1john": "1JN",
  "1jn": "1JN",
  "2 john": "2JN",
  "2john": "2JN",
  "2jn": "2JN",
  "3 john": "3JN",
  "3john": "3JN",
  "3jn": "3JN",
  jude: "JUD",
  jud: "JUD",
  revelation: "REV",
  rev: "REV",
  re: "REV",
};

const ALL_BOOK_IDS = new Set(Object.values(KO_BOOK_MAP));

/** Chapter:verse or chapter:verseStart-verseEnd */
const VERSE_PART = String.raw`\s*(\d+)\s*:\s*(\d+)(?:\s*[-–—]\s*(\d+))?\s*`;

/** Build regex for Korean: "창세기 1:1" or "요한복음 3:16-17" */
function buildKoreanPattern(): RegExp {
  const names = Object.keys(KO_BOOK_MAP)
    .sort((a, b) => b.length - a.length) // longer first to match "고린도전서" before "고린도"
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  return new RegExp(`(${names})${VERSE_PART}`, "g");
}

/** English: "Genesis 1:1", "John 3:16-17", "1 Cor 13:1" */
function buildEnglishPattern(): RegExp {
  const names = Object.keys(EN_BOOK_MAP)
    .filter((k) => k.length > 1)
    .sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  return new RegExp(`(\\d?\\s*(?:${names}))${VERSE_PART}`, "gi");
}

const KO_REF_REGEX = buildKoreanPattern();
const EN_REF_REGEX = buildEnglishPattern();

function normalizeEnBook(match: string): string | null {
  const key = match.replace(/\s+/g, " ").trim().toLowerCase();
  return EN_BOOK_MAP[key] ?? EN_BOOK_MAP[key.replace(/^\d\s+/, "")] ?? null;
}

/**
 * Find all Bible references in text (Korean or English).
 * Returns sorted by start index, non-overlapping.
 */
export function findBibleReferences(text: string): BibleRef[] {
  const refs: BibleRef[] = [];

  // Korean
  KO_REF_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = KO_REF_REGEX.exec(text)) !== null) {
    const bookId = KO_BOOK_MAP[m[1]];
    if (!bookId || !ALL_BOOK_IDS.has(bookId)) continue;
    const chapter = parseInt(m[2], 10);
    const verseStart = parseInt(m[3], 10);
    const verseEnd = m[4] ? parseInt(m[4], 10) : undefined;
    refs.push({
      start: m.index,
      end: m.index + m[0].length,
      bookId,
      chapter,
      verseStart,
      verseEnd,
      sourceText: m[0],
    });
  }

  // English
  EN_REF_REGEX.lastIndex = 0;
  while ((m = EN_REF_REGEX.exec(text)) !== null) {
    const bookKey = m[1].replace(/\s+/g, " ").trim();
    const bookId = normalizeEnBook(bookKey);
    if (!bookId || !ALL_BOOK_IDS.has(bookId)) continue;
    const chapter = parseInt(m[2], 10);
    const verseStart = parseInt(m[3], 10);
    const verseEnd = m[4] ? parseInt(m[4], 10) : undefined;
    refs.push({
      start: m.index,
      end: m.index + m[0].length,
      bookId,
      chapter,
      verseStart,
      verseEnd,
      sourceText: m[0],
    });
  }

  // Sort by start; merge overlapping and prefer longer match
  refs.sort((a, b) => a.start - b.start);
  const merged: BibleRef[] = [];
  for (const r of refs) {
    if (merged.length > 0 && r.start < merged[merged.length - 1].end) continue;
    merged.push(r);
  }
  return merged;
}

/**
 * Split text into segments: alternating [plain text, verse ref, plain text, ...].
 * Verse segments are represented as BibleRef; plain segments as strings.
 */
export type Segment =
  | { type: "text"; content: string }
  | { type: "verse"; ref: BibleRef };

export function segmentByBibleRefs(text: string): Segment[] {
  const refs = findBibleReferences(text);
  if (refs.length === 0) {
    return [{ type: "text", content: text }];
  }
  const segments: Segment[] = [];
  let lastEnd = 0;
  for (const ref of refs) {
    if (ref.start > lastEnd) {
      segments.push({
        type: "text",
        content: text.slice(lastEnd, ref.start),
      });
    }
    segments.push({ type: "verse", ref });
    lastEnd = ref.end;
  }
  if (lastEnd < text.length) {
    segments.push({ type: "text", content: text.slice(lastEnd) });
  }
  return segments;
}

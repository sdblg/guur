# Монгол Ариун Библи — эшлэл

**Заавар (орчуулагчийн дүрэм):** Солонгос эх сурвалж дотор Библийн эшлэл байвал түүнийг өөрөөрөө бүү орчуул. Харин Монгол Ариун Библи-аас яг тэр эшлэлийг нь олж, үг үсэггүй хуулж тавь.

## 2004 оны хувилбар — API.Bible

Эхлээд **API.Bible**-аас Монгол Ариун Библи 2004 (АБ2004)-ыг татаж ашиглана. Тохиргоо: `.env` дотор `API_BIBLE_KEY=your-api-key`. API түлхүүр: [scripture.api.bible](https://scripture.api.bible/) (бүртгэл үүсгээд dashboard-аас авах).

## Формат

`mongolian-bible-2013.json` нь дараах бүтэцтэй:

- Номын код (SBL): `GEN`, `EXO`, `JHN`, `PSA`, г.м.
- Дотор нь бүлэг дугаар (string): `"1"`, `"2"`, ...
- Дотор нь дугаар (string): `"1"`, `"16"`, ...
- Утга: тухайн эшлэлийн Монгол Ариун Библи 2013 дахь текст.

Жишээ: `"JHN"]["3"]["16"]` → Иохан 3:16-ийн монгол текст.

Одоо зөвхөн цөөн эшлэл дээж байна. Бүтэн 2013 хувилбарыг энд нэмж болно (ном бүрээр, бүлэг, дугаар).

---

## Google Cloud орчуулга (EN → MN)

Англи → Монгол орчуулгад **Cloud Translation API** ашиглана. Нэвтрэл тохируулах:

1. **Cloud Translation API** идэвхжүүлэх: GCP Console → **APIs & Services** → **Enable APIs** → "Cloud Translation API" хайж **Enable**.
2. **Service account**-д эрх өгөх: **IAM & Admin** → **IAM** → service account-аа олоод **Edit** → **Add another role** → **Cloud Translation API User** нэмнэ. (Эсвэл Service accounts → тухайн account → **Permissions** дээр нэмнэ.)
3. **Service account JSON** ашиглах: GCP Console → IAM → Service accounts → Key нэмж JSON татаад `.env` дотор:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json
   GOOGLE_CLOUD_PROJECT=your-project-id
   ```
4. Эсвэл локал машин дээр: `gcloud auth application-default login` (нэг удаа).

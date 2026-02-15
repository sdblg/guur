import { UploadForm } from "./components/UploadForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="border-b border-sky-100/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight text-sky-700">
            Guur
          </h1>
          <span className="text-sm text-slate-500">
            PDF → Монгол хэл
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">
            Солонгос PDF-ээ монгол руу орчуулна уу
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            PDF файлаа оруулаад, DeepL болон Google Translate ашиглан монгол хэл дээрх Word файл авна уу.
          </p>
        </section>

        <section className="mt-12 flex justify-center">
          <UploadForm />
        </section>

        <section className="mt-16 rounded-2xl border border-sky-100 bg-white/60 p-6 sm:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-600">
            Яаж ажилладаг вэ?
          </h3>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-600">
            <li>PDF файлаа сонгоод &quot;Орчуулах&quot; дарна.</li>
            <li>Текстийг эхлээд солонгосоос англи руу (DeepL), дараа нь англиас монгол руу (Google Translate) орчуулна.</li>
            <li>Үр дүнг Word (.docx) файлаар татаж авна.</li>
          </ol>
        </section>
      </main>

      <footer className="mt-auto border-t border-sky-100/80 bg-white/60 px-4 py-6 text-center text-sm text-slate-500">
        Guur — итгэлтэй орчуулга
      </footer>
    </div>
  );
}

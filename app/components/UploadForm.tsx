"use client";

import { useState } from "react";
import { translatePdfToDocx } from "../actions/translate-pdf";

function downloadDocx(base64: string, filename: string) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ ok: true; filename: string; data: string } | { ok: false; error: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setResult(null);
    setPending(true);
    try {
      const res = await translatePdfToDocx(formData);
      setResult(res);
      if (res.ok) {
        downloadDocx(res.data, res.filename);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-sky-200 bg-white p-8 shadow-lg shadow-sky-100/50"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="pdf-file"
          className="text-sm font-medium text-slate-700"
        >
          PDF файл сонгох (Солонгос хэл)
        </label>
        <input
          id="pdf-file"
          name="file"
          type="file"
          accept="application/pdf"
          required
          disabled={pending}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-3 text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-sky-700 hover:file:bg-sky-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
        />
        {file && (
          <p className="text-xs text-slate-500">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white shadow-md transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-60 disabled:hover:bg-sky-500"
      >
        {pending ? "Орчуулж байна…" : "Орчуулах"}
      </button>

      {result && !result.ok && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {result.error}
        </div>
      )}

      {result?.ok && (
        <p className="text-center text-sm text-sky-700">
          Word файл татагдсан. Дахин орчуулах бол шинэ PDF оруулна уу.
        </p>
      )}
    </form>
  );
}

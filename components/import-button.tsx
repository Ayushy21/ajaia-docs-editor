"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "./toast";

export function ImportButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!/\.(txt|md)$/i.test(file.name)) {
      toast("Unsupported file type. Supported: .txt, .md");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast("File exceeds the 1 MB limit");
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Import failed");
      toast("Document imported", "success");
      router.push(`/documents/${json.document.id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown"
        className="hidden"
        onChange={onFile}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
      >
        {busy ? "Importing…" : "Import file"}
      </button>
    </>
  );
}

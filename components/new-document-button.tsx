"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "./toast";

export function NewDocumentButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const res = await fetch("/api/documents", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Could not create document");
      router.push(`/documents/${json.document.id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not create document");
      setBusy(false);
    }
  }

  return (
    <button
      onClick={create}
      disabled={busy}
      className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
    >
      {busy ? "Creating…" : "New document"}
    </button>
  );
}

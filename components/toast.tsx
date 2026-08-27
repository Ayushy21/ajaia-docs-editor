"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; message: string; kind: "error" | "success" };

let counter = 0;
const listeners = new Set<(t: Toast) => void>();

export function toast(message: string, kind: "error" | "success" = "error") {
  const t = { id: ++counter, message, kind };
  listeners.forEach((l) => l(t));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 4500);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`rounded-md px-4 py-2 text-sm text-white shadow-lg ${
            t.kind === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

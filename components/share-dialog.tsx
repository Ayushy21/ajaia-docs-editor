"use client";

import { useEffect, useState } from "react";
import { toast } from "./toast";

type ShareInfo = {
  owner: { id: string; name: string; email: string };
  sharedWith: { id: string; name: string; email: string }[];
  availableUsers: { id: string; name: string; email: string }[];
  isOwner: boolean;
};

export function ShareDialog({ documentId, onClose }: { documentId: string; onClose: () => void }) {
  const [info, setInfo] = useState<ShareInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/share`);
      if (!res.ok) throw new Error();
      setInfo(await res.json());
    } catch {
      toast("Could not load sharing info");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  async function grant(userId: string) {
    setBusyId(userId);
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Share failed");
      toast("Access granted", "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Share failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Share document</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        {loading || !info ? (
          <p className="mt-4 text-sm text-gray-500">Loading…</p>
        ) : (
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Owner</p>
              <p className="mt-1">{info.owner.name} · {info.owner.email}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Shared with</p>
              {info.sharedWith.length === 0 ? (
                <p className="mt-1 text-gray-500">Not shared with anyone yet.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {info.sharedWith.map((u) => (
                    <li key={u.id} className="flex justify-between">
                      <span>{u.name}</span>
                      <span className="text-gray-400">editor</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {info.isOwner ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Add people</p>
                {info.availableUsers.length === 0 ? (
                  <p className="mt-1 text-gray-500">Everyone already has access.</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {info.availableUsers.map((u) => (
                      <li key={u.id} className="flex items-center justify-between">
                        <span>{u.name} · {u.email}</span>
                        <button
                          onClick={() => grant(u.id)}
                          disabled={busyId === u.id}
                          className="rounded bg-gray-900 px-2 py-1 text-xs text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                          {busyId === u.id ? "Adding…" : "Grant access"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Only the owner can change sharing.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

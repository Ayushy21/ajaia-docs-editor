"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "./toast";

export type DemoUser = { id: string; name: string; email: string };

export function UserSwitcher({
  users,
  currentUserId,
}: {
  users: DemoUser[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function select(id: string) {
    if (id === currentUserId || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      toast("Could not switch user");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-gray-400">Acting as</span>
      <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => select(u.id)}
            disabled={busy || pending}
            aria-pressed={u.id === currentUserId}
            className={`px-3 py-1.5 text-sm transition-colors ${
              u.id === currentUserId
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            } disabled:opacity-60`}
          >
            {u.name}
          </button>
        ))}
      </div>
    </div>
  );
}

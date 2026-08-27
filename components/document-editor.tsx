"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent } from "@tiptap/react";
import { EditorToolbar } from "./editor-toolbar";
import { SaveStatus, type SaveState } from "./save-status";
import { ShareDialog } from "./share-dialog";
import { toast } from "./toast";
import { TITLE_MAX } from "@/lib/validation";

export function DocumentEditor({
  documentId,
  initialTitle,
  initialContent,
  canEdit,
  isOwner,
  ownerName,
}: {
  documentId: string;
  initialTitle: string;
  initialContent: JSONContent;
  canEdit: boolean;
  isOwner: boolean;
  ownerName: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [savedTitle, setSavedTitle] = useState(initialTitle);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [showShare, setShowShare] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContent = useRef<JSONContent | null>(null);
  const pendingTitle = useRef<string | null>(null);

  const editor = useEditor({
    editable: canEdit,
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: initialContent,
    editorProps: {
      attributes: { class: "editor-content px-6 py-5" },
    },
    onUpdate: ({ editor }) => {
      pendingContent.current = editor.getJSON();
      scheduleSave();
    },
  });

  const flush = useCallback(async () => {
    const content = pendingContent.current;
    const newTitle = pendingTitle.current;
    if (content == null && newTitle == null) return;

    setSaveState("saving");
    try {
      const body: Record<string, unknown> = {};
      if (content != null) body.content = content;
      if (newTitle != null) body.title = newTitle;

      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Save failed");

      pendingContent.current = null;
      pendingTitle.current = null;
      if (newTitle != null) setSavedTitle(newTitle);
      setSaveState("saved");
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
    } catch (err) {
      setSaveState("error");
      toast(err instanceof Error ? err.message : "Save failed");
      // Keep pending refs so the next edit / retry re-attempts. Do not clear content.
      timer.current = setTimeout(flush, 3000);
    }
  }, [documentId]);

  const scheduleSave = useCallback(() => {
    if (!canEdit) return;
    setSaveState("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 800);
  }, [canEdit, flush]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function commitTitle() {
    const trimmed = title.trim();
    if (!trimmed) {
      toast("Title cannot be empty");
      setTitle(savedTitle);
      return;
    }
    if (trimmed.length > TITLE_MAX) {
      toast(`Title must be ${TITLE_MAX} characters or fewer`);
      return;
    }
    if (trimmed === savedTitle) return;
    setTitle(trimmed);
    pendingTitle.current = trimmed;
    scheduleSave();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
          ← All documents
        </Link>
        <div className="flex items-center gap-3">
          <SaveStatus state={saveState} />
          {isOwner && (
            <button
              onClick={() => setShowShare(true)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
            >
              Share
            </button>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          You have read-only access to this document.
        </div>
      )}

      <input
        value={title}
        disabled={!canEdit}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitTitle}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        maxLength={TITLE_MAX + 20}
        aria-label="Document title"
        className="mb-3 w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-2xl font-bold outline-none focus:border-gray-300 disabled:opacity-70"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {canEdit && <EditorToolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>

      <p className="mt-2 text-xs text-gray-400">Owned by {ownerName}</p>

      {showShare && <ShareDialog documentId={documentId} onClose={() => setShowShare(false)} />}
    </div>
  );
}

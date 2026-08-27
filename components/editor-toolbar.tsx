"use client";

import type { Editor } from "@tiptap/react";

function Btn({
  onClick,
  active,
  disabled,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[2rem] rounded px-2 py-1 text-sm transition-colors disabled:opacity-40 ${
        active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor, disabled }: { editor: Editor | null; disabled?: boolean }) {
  if (!editor) return null;
  const d = disabled;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
      <Btn label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} disabled={d}>
        <strong>B</strong>
      </Btn>
      <Btn label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} disabled={d}>
        <em>I</em>
      </Btn>
      <Btn label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} disabled={d}>
        <span className="underline">U</span>
      </Btn>
      <span className="mx-1 h-5 w-px bg-gray-300" />
      <Btn label="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} disabled={d}>
        ¶
      </Btn>
      <Btn label="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} disabled={d}>
        H1
      </Btn>
      <Btn label="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} disabled={d}>
        H2
      </Btn>
      <span className="mx-1 h-5 w-px bg-gray-300" />
      <Btn label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} disabled={d}>
        • List
      </Btn>
      <Btn label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} disabled={d}>
        1. List
      </Btn>
      <span className="mx-1 h-5 w-px bg-gray-300" />
      <Btn label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={d || !editor.can().undo()}>
        ↶
      </Btn>
      <Btn label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={d || !editor.can().redo()}>
        ↷
      </Btn>
    </div>
  );
}

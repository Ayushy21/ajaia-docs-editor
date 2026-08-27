// Shared helpers for the TipTap/ProseMirror document representation.

export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

export type TipTapDoc = {
  type: "doc";
  content: TipTapNode[];
};

export function emptyDoc(): TipTapDoc {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

/**
 * Minimal structural validation of a TipTap document. We do not attempt to
 * validate every node type, only that the top-level shape is a ProseMirror doc.
 */
export function isValidTipTapDoc(value: unknown): value is TipTapDoc {
  if (!value || typeof value !== "object") return false;
  const doc = value as Record<string, unknown>;
  if (doc.type !== "doc") return false;
  if (!Array.isArray(doc.content)) return false;
  return doc.content.every(
    (node) => node && typeof node === "object" && typeof (node as TipTapNode).type === "string",
  );
}

export function parseContent(raw: string): TipTapDoc {
  try {
    const parsed = JSON.parse(raw);
    return isValidTipTapDoc(parsed) ? parsed : emptyDoc();
  } catch {
    return emptyDoc();
  }
}

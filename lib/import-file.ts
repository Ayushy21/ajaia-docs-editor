import { marked } from "marked";

type Token = any;
import { emptyDoc, type TipTapDoc, type TipTapNode } from "./tiptap";
import { MAX_IMPORT_BYTES, SUPPORTED_IMPORT_EXTENSIONS } from "./validation";

export type ImportErrorCode =
  | "UNSUPPORTED_EXTENSION"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE"
  | "READ_FAILURE";

export class ImportError extends Error {
  code: ImportErrorCode;
  constructor(code: ImportErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "ImportError";
  }
}

export function extensionOf(filename: string): string {
  const m = filename.toLowerCase().match(/\.[a-z0-9]+$/);
  return m ? m[0] : "";
}

export function titleFromFilename(filename: string): string {
  const base = filename.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, "").trim();
  const cleaned = base.replace(/[-_]+/g, " ").trim();
  return (cleaned || "Imported document").slice(0, 120);
}

function textNodes(raw: string, marks?: TipTapNode["marks"]): TipTapNode[] {
  const parts = raw.split("\n");
  const out: TipTapNode[] = [];
  parts.forEach((part, i) => {
    if (part) out.push({ type: "text", text: part, ...(marks ? { marks } : {}) });
    if (i < parts.length - 1) out.push({ type: "hardBreak" });
  });
  return out;
}

function inlineTokensToNodes(tokens: Token[] | undefined, fallback: string): TipTapNode[] {
  if (!tokens || tokens.length === 0) return textNodes(fallback);
  const nodes: TipTapNode[] = [];
  for (const t of tokens) {
    switch (t.type) {
      case "strong":
        nodes.push(...inlineTokensToNodes((t as any).tokens, (t as any).text).map(addMark("bold")));
        break;
      case "em":
        nodes.push(...inlineTokensToNodes((t as any).tokens, (t as any).text).map(addMark("italic")));
        break;
      case "codespan":
        nodes.push(...textNodes((t as any).text, [{ type: "code" }]));
        break;
      case "br":
        nodes.push({ type: "hardBreak" });
        break;
      case "text":
        nodes.push(...textNodes((t as any).text));
        break;
      default:
        nodes.push(...textNodes((t as any).raw ?? (t as any).text ?? ""));
    }
  }
  return nodes.filter((n) => n.type !== "text" || (n.text && n.text.length > 0));
}

const addMark = (mark: string) => (node: TipTapNode): TipTapNode =>
  node.type === "text"
    ? { ...node, marks: [...(node.marks ?? []), { type: mark }] }
    : node;

function listItems(token: any): TipTapNode[] {
  return (token.items ?? []).map((item: any) => ({
    type: "listItem",
    content: [
      {
        type: "paragraph",
        content: inlineTokensToNodes(item.tokens?.[0]?.tokens, item.text),
      },
    ],
  }));
}

function markdownToDoc(md: string): TipTapDoc {
  const tokens = marked.lexer(md);
  const content: TipTapNode[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "heading":
        content.push({
          type: "heading",
          attrs: { level: Math.min(token.depth, 3) },
          content: inlineTokensToNodes(token.tokens, token.text),
        });
        break;
      case "paragraph":
        content.push({ type: "paragraph", content: inlineTokensToNodes(token.tokens, token.text) });
        break;
      case "list":
        content.push({
          type: token.ordered ? "orderedList" : "bulletList",
          content: listItems(token),
        });
        break;
      case "blockquote":
        content.push({
          type: "blockquote",
          content: [{ type: "paragraph", content: textNodes(token.text) }],
        });
        break;
      case "code":
        content.push({
          type: "codeBlock",
          content: [{ type: "text", text: token.text }],
        });
        break;
      case "space":
        break;
      default:
        if ((token as any).text) {
          content.push({ type: "paragraph", content: textNodes((token as any).text) });
        }
    }
  }

  return content.length > 0 ? { type: "doc", content } : emptyDoc();
}

function plainTextToDoc(text: string): TipTapDoc {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const content: TipTapNode[] = blocks
    .map((b) => b.replace(/\n+$/, ""))
    .filter((b) => b.trim().length > 0)
    .map((b) => ({ type: "paragraph", content: textNodes(b) }));
  return content.length > 0 ? { type: "doc", content } : emptyDoc();
}

export type ImportInput = {
  filename: string;
  size: number;
  content: string;
};

export type ImportResult = {
  title: string;
  doc: TipTapDoc;
};

export function importFileToDoc({ filename, size, content }: ImportInput): ImportResult {
  const ext = extensionOf(filename);
  if (!SUPPORTED_IMPORT_EXTENSIONS.includes(ext as any)) {
    throw new ImportError(
      "UNSUPPORTED_EXTENSION",
      `Unsupported file type "${ext || "unknown"}". Supported: ${SUPPORTED_IMPORT_EXTENSIONS.join(", ")}`,
    );
  }
  if (size > MAX_IMPORT_BYTES) {
    throw new ImportError("FILE_TOO_LARGE", "File exceeds the 1 MB limit");
  }
  if (typeof content !== "string") {
    throw new ImportError("READ_FAILURE", "Could not read file contents");
  }
  if (content.trim().length === 0) {
    throw new ImportError("EMPTY_FILE", "File is empty");
  }

  const doc = ext === ".md" ? markdownToDoc(content) : plainTextToDoc(content);
  return { title: titleFromFilename(filename), doc };
}

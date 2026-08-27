import { z } from "zod";
import { isValidTipTapDoc } from "./tiptap";

export const TITLE_MAX = 120;

export const titleSchema = z
  .string()
  .transform((s) => s.trim())
  .pipe(z.string().min(1, "Title cannot be empty").max(TITLE_MAX, `Title must be <= ${TITLE_MAX} characters`));

export const contentSchema = z.unknown().refine(isValidTipTapDoc, "Malformed editor content");

export const updateDocumentSchema = z
  .object({
    title: titleSchema.optional(),
    content: contentSchema.optional(),
  })
  .refine((v) => v.title !== undefined || v.content !== undefined, "Nothing to update");

export const shareSchema = z.object({
  userId: z.string().min(1),
});

export const MAX_IMPORT_BYTES = 1024 * 1024; // 1 MB
export const SUPPORTED_IMPORT_EXTENSIONS = [".txt", ".md"] as const;

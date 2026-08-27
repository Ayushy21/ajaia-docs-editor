import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/demo-auth";
import { createDocument } from "@/lib/documents";
import { ImportError, importFileToDoc } from "@/lib/import-file";
import { MAX_IMPORT_BYTES } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await requireCurrentUser();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Malformed upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_IMPORT_BYTES) {
    return NextResponse.json({ error: "File exceeds the 1 MB limit" }, { status: 413 });
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return NextResponse.json({ error: "Could not read file contents" }, { status: 400 });
  }

  try {
    const { title, doc } = importFileToDoc({ filename: file.name, size: file.size, content: text });
    const created = await createDocument(user.id, { title, content: doc });
    return NextResponse.json({ document: created }, { status: 201 });
  } catch (err) {
    if (err instanceof ImportError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    }
    throw err;
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/demo-auth";
import { getDocumentAccess } from "@/lib/permissions";
import { updateDocumentSchema } from "@/lib/validation";
import { parseContent } from "@/lib/tiptap";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentUser();
  const access = await getDocumentAccess(params.id, user.id);
  if (!access.canAccess) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const doc = await prisma.document.findUniqueOrThrow({
    where: { id: params.id },
    include: { owner: true },
  });
  return NextResponse.json({
    document: { ...doc, content: parseContent(doc.content) },
    access,
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentUser();
  const access = await getDocumentAccess(params.id, user.id);
  if (!access.canAccess) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!access.canEdit) {
    return NextResponse.json({ error: "You do not have edit access" }, { status: 403 });
  }

  const parsed = updateDocumentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const data: { title?: string; content?: string } = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.content !== undefined) data.content = JSON.stringify(parsed.data.content);

  const doc = await prisma.document.update({ where: { id: params.id }, data });
  return NextResponse.json({ document: { ...doc, content: parseContent(doc.content) } });
}

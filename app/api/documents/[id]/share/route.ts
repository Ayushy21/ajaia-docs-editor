import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/demo-auth";
import { getDocumentAccess, isDocumentOwner } from "@/lib/permissions";
import { shareSchema } from "@/lib/validation";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentUser();
  const access = await getDocumentAccess(params.id, user.id);
  if (!access.canAccess) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = await prisma.document.findUniqueOrThrow({
    where: { id: params.id },
    include: { owner: true, shares: { include: { user: true } } },
  });
  const sharedUserIds = new Set([doc.ownerId, ...doc.shares.map((s) => s.userId)]);
  const availableUsers = await prisma.user.findMany({
    where: { id: { notIn: [...sharedUserIds] } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    owner: doc.owner,
    sharedWith: doc.shares.map((s) => ({ ...s.user, permission: s.permission })),
    availableUsers,
    isOwner: access.isOwner,
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentUser();

  if (!(await isDocumentOwner(params.id, user.id))) {
    // 404 if no access at all, 403 if accessor but not owner.
    const access = await getDocumentAccess(params.id, user.id);
    return NextResponse.json(
      { error: access.canAccess ? "Only the owner can share this document" : "Not found" },
      { status: access.canAccess ? 403 : 404 },
    );
  }

  const parsed = shareSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) {
    return NextResponse.json({ error: "Target user does not exist" }, { status: 404 });
  }
  if (target.id === user.id) {
    return NextResponse.json({ error: "You cannot share a document with yourself" }, { status: 400 });
  }

  const existing = await prisma.documentShare.findUnique({
    where: { documentId_userId: { documentId: params.id, userId: target.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already shared with this user" }, { status: 409 });
  }

  await prisma.documentShare.create({
    data: { documentId: params.id, userId: target.id, permission: "editor" },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

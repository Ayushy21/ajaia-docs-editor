import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/demo-auth";
import { createDocument, listDocumentsForUser } from "@/lib/documents";

export async function GET() {
  const user = await requireCurrentUser();
  const { owned, shared } = await listDocumentsForUser(user.id);
  return NextResponse.json({ owned, shared });
}

export async function POST() {
  const user = await requireCurrentUser();
  const doc = await createDocument(user.id);
  return NextResponse.json({ document: doc }, { status: 201 });
}

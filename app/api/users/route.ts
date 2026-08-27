import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/demo-auth";

export async function GET() {
  const [users, current] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getCurrentUser(),
  ]);
  return NextResponse.json({ users, currentUserId: current?.id ?? null });
}

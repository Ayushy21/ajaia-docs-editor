import { prisma } from "./db";
import { emptyDoc } from "./tiptap";

export async function listDocumentsForUser(userId: string) {
  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      include: { owner: true },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      include: { owner: true },
    }),
  ]);
  return { owned, shared };
}

export async function createDocument(userId: string, opts?: { title?: string; content?: unknown }) {
  return prisma.document.create({
    data: {
      title: opts?.title ?? "Untitled document",
      content: JSON.stringify(opts?.content ?? emptyDoc()),
      ownerId: userId,
    },
  });
}

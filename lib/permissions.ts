import { prisma } from "./db";

export type DocumentAccess = {
  canAccess: boolean;
  canEdit: boolean;
  isOwner: boolean;
};

// Minimal shape of the DB client the helpers need, so the logic can be unit
// tested with a fake client.
export type PermissionsDb = {
  document: {
    findUnique(args: {
      where: { id: string };
      select?: unknown;
    }): Promise<{ id: string; ownerId: string } | null>;
  };
  documentShare: {
    findUnique(args: {
      where: { documentId_userId: { documentId: string; userId: string } };
    }): Promise<{ permission: string } | null>;
  };
};

export async function getDocumentAccess(
  documentId: string,
  userId: string,
  db: PermissionsDb = prisma as unknown as PermissionsDb,
): Promise<DocumentAccess> {
  const deny: DocumentAccess = { canAccess: false, canEdit: false, isOwner: false };

  const doc = await db.document.findUnique({
    where: { id: documentId },
    select: { id: true, ownerId: true },
  });
  if (!doc) return deny;

  if (doc.ownerId === userId) {
    return { canAccess: true, canEdit: true, isOwner: true };
  }

  const share = await db.documentShare.findUnique({
    where: { documentId_userId: { documentId, userId } },
  });
  if (share) {
    return { canAccess: true, canEdit: share.permission === "editor", isOwner: false };
  }

  return deny;
}

export async function canAccessDocument(documentId: string, userId: string, db?: PermissionsDb) {
  return (await getDocumentAccess(documentId, userId, db)).canAccess;
}

export async function canEditDocument(documentId: string, userId: string, db?: PermissionsDb) {
  return (await getDocumentAccess(documentId, userId, db)).canEdit;
}

export async function isDocumentOwner(documentId: string, userId: string, db?: PermissionsDb) {
  return (await getDocumentAccess(documentId, userId, db)).isOwner;
}

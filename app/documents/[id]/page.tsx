import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/demo-auth";
import { getDocumentAccess } from "@/lib/permissions";
import { parseContent } from "@/lib/tiptap";
import { AppHeader } from "@/components/app-header";
import { DocumentEditor } from "@/components/document-editor";
import { Toaster } from "@/components/toast";

export const dynamic = "force-dynamic";

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  const currentUser = await getCurrentUser();
  if (!currentUser) notFound();

  const access = await getDocumentAccess(params.id, currentUser.id);
  if (!access.canAccess) notFound();

  const doc = await prisma.document.findUniqueOrThrow({
    where: { id: params.id },
    include: { owner: true },
  });

  return (
    <div className="min-h-screen">
      <AppHeader users={users} currentUserId={currentUser.id} showActions={false} />
      <Toaster />
      <DocumentEditor
        documentId={doc.id}
        initialTitle={doc.title}
        initialContent={parseContent(doc.content)}
        canEdit={access.canEdit}
        isOwner={access.isOwner}
        ownerName={doc.owner.name}
      />
    </div>
  );
}

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/demo-auth";
import { listDocumentsForUser } from "@/lib/documents";
import { AppHeader } from "@/components/app-header";
import { DocumentCard } from "@/components/document-card";
import { Toaster } from "@/components/toast";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <main className="mx-auto max-w-2xl p-10 text-center">
        <h1 className="text-xl font-semibold">No demo users found</h1>
        <p className="mt-2 text-gray-600">
          Run <code className="rounded bg-gray-100 px-1">npm run db:seed</code> to create the demo
          users.
        </p>
      </main>
    );
  }

  const { owned, shared } = await listDocumentsForUser(currentUser.id);

  return (
    <div className="min-h-screen">
      <AppHeader users={users} currentUserId={currentUser.id} />
      <Toaster />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Section
          title="Owned by me"
          empty={{
            heading: "No documents yet",
            body: "Create your first document to get started.",
          }}
          items={owned.map((d) => (
            <DocumentCard
              key={d.id}
              id={d.id}
              title={d.title}
              ownerName={d.owner.name}
              updatedAt={d.updatedAt}
            />
          ))}
        />

        <div className="h-10" />

        <Section
          title="Shared with me"
          empty={{
            heading: "Nothing shared yet",
            body: "Nothing has been shared with you yet.",
          }}
          items={shared.map((d) => (
            <DocumentCard
              key={d.id}
              id={d.id}
              title={d.title}
              ownerName={d.owner.name}
              updatedAt={d.updatedAt}
              shared
            />
          ))}
        />
      </main>
    </div>
  );
}

function Section({
  title,
  items,
  empty,
}: {
  title: string;
  items: React.ReactNode[];
  empty: { heading: string; body: string };
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-8 text-center">
          <p className="font-medium text-gray-700">{empty.heading}</p>
          <p className="mt-1 text-sm text-gray-500">{empty.body}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items}</div>
      )}
    </section>
  );
}

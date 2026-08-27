import Link from "next/link";
import { UserSwitcher, type DemoUser } from "./user-switcher";
import { NewDocumentButton } from "./new-document-button";
import { ImportButton } from "./import-button";

export function AppHeader({
  users,
  currentUserId,
  showActions = true,
}: {
  users: DemoUser[];
  currentUserId: string | null;
  showActions?: boolean;
}) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Draft<span className="text-gray-400">Space</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <UserSwitcher users={users} currentUserId={currentUserId} />
          {showActions && (
            <div className="flex items-center gap-2">
              <ImportButton />
              <NewDocumentButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

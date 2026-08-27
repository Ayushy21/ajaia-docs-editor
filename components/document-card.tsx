import Link from "next/link";

export function DocumentCard({
  id,
  title,
  ownerName,
  updatedAt,
  shared,
}: {
  id: string;
  title: string;
  ownerName: string;
  updatedAt: string | Date;
  shared?: boolean;
}) {
  return (
    <Link
      href={`/documents/${id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 line-clamp-2">{title}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            shared ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {shared ? "Shared" : "Owner"}
        </span>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {shared ? `Owned by ${ownerName} · ` : ""}
        Updated {new Date(updatedAt).toLocaleString()}
      </p>
    </Link>
  );
}

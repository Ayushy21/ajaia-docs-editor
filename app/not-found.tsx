import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-10 text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="mt-2 text-gray-600">
        This document does not exist, or you do not have access to it.
      </p>
      <Link href="/" className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">
        Back to dashboard
      </Link>
    </main>
  );
}

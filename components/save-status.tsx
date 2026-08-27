export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export function SaveStatus({ state }: { state: SaveState }) {
  const map: Record<SaveState, { label: string; className: string }> = {
    idle: { label: "All changes saved", className: "text-gray-400" },
    dirty: { label: "Unsaved changes", className: "text-amber-600" },
    saving: { label: "Saving…", className: "text-gray-500" },
    saved: { label: "Saved", className: "text-green-600" },
    error: { label: "Save failed — retrying", className: "text-red-600" },
  };
  const { label, className } = map[state];
  return (
    <span className={`text-xs font-medium ${className}`} aria-live="polite">
      {label}
    </span>
  );
}

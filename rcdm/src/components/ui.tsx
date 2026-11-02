export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
      <p className="font-semibold text-navy-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{body}</p>
    </div>
  );
}

export function SavedBanner({ show, error }: { show?: string; error?: string }) {
  if (error) {
    return (
      <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Something didn&apos;t save — check the fields and try again.
      </div>
    );
  }
  if (show) {
    return (
      <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        Saved.
      </div>
    );
  }
  return null;
}

export function StatusChip({ status }: { status: string }) {
  const active = status === "Active";
  const done = status === "Completed";
  return (
    <span
      className={
        active
          ? "chip bg-emerald-50 text-emerald-700"
          : done
            ? "chip bg-slate-100 text-slate-600"
            : "chip"
      }
    >
      {status}
    </span>
  );
}

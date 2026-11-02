import PublicShell from "@/components/PublicShell";
import { EmptyState, StatusChip } from "@/components/ui";
import { fmtDate, getOperations, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const [settings, operations] = await Promise.all([getSettings(), getOperations("public")]);
  return (
    <PublicShell settings={settings}>
      <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-navy-900">Operations</h1>
      <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">{settings.operationsText}</p>
      <div className="mt-7 space-y-4">
        {operations.length === 0 && (
          <EmptyState title="No public operations listed" body="Public operations coordinated by RCDM will be listed here." />
        )}
        {operations.map((op, i) => (
          <article key={op.id} className="card animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 80}ms` }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-navy-900">{op.name}</h2>
              <StatusChip status={op.status} />
            </div>
            {op.location && <p className="mt-1 text-sm text-slate-500">{op.location}</p>}
            {op.description && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{op.description}</p>}
            <p className="mt-3 text-xs text-slate-400">
              {fmtDate(op.startsAt)}{op.endsAt ? ` – ${fmtDate(op.endsAt)}` : ""}
            </p>
          </article>
        ))}
      </div>
    </PublicShell>
  );
}

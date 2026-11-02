import { EmptyState } from "@/components/ui";
import { getEmployees } from "@/lib/data";
import { ROLE_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const employees = await getEmployees();
  const visible = employees.filter((e) => e.status !== "Inactive");
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">Employee Directory</h1>
      <p className="mt-1 text-sm text-slate-500">{visible.length} employee{visible.length === 1 ? "" : "s"}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {visible.length === 0 && (
          <div className="sm:col-span-2">
            <EmptyState title="No employees yet" body="An administrator adds employees from Personnel & Accounts." />
          </div>
        )}
        {visible.map((e) => (
          <article key={e.id} className="card !py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-navy-900">{e.name}</p>
                <p className="text-sm text-slate-500">{[e.rank, e.position].filter(Boolean).join(" · ") || "—"}</p>
              </div>
              <span className="chip-gray">{ROLE_LABEL[e.role]}</span>
            </div>
            <div className="mt-3 space-y-0.5 text-sm text-slate-600">
              <p>{e.email}</p>
              {e.phone && <p>{e.phone}</p>}
              <p>Status: {e.status}</p>
            </div>
            {e.bio && <p className="mt-2 text-sm text-slate-500">{e.bio}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}

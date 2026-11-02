import { EmptyState } from "@/components/ui";
import { fmtDate, getAnnouncements } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements("internal");
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">Announcements</h1>
      <p className="mt-1 text-sm text-slate-500">Internal announcements for RCDM employees.</p>
      <div className="mt-6 space-y-4">
        {announcements.length === 0 && <EmptyState title="No announcements yet" body="Internal announcements from leadership will appear here." />}
        {announcements.map((a) => (
          <article key={a.id} className="card">
            <h2 className="font-bold text-navy-900">
              {a.pinned && <span className="chip mr-2">Pinned</span>}
              {a.title}
            </h2>
            <p className="mt-1 text-xs text-slate-400">{fmtDate(a.createdAt)}{a.author ? ` · ${a.author.name}` : ""}</p>
            {a.body && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{a.body}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}

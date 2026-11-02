import { EmptyState, SavedBanner } from "@/components/ui";
import { deleteAnnouncementAction, saveAnnouncementAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { fmtDate, getAnnouncements } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage({ searchParams }: { searchParams: { saved?: string; error?: string } }) {
  await requireRole("SUPERVISOR", "ADMIN");
  const announcements = await getAnnouncements();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">Manage Announcements</h1>
      <p className="mt-1 text-sm text-slate-500">Internal announcements show in the portal. Public ones also show on the homepage.</p>
      <SavedBanner show={searchParams.saved} error={searchParams.error} />

      <form action={saveAnnouncementAction} className="card mt-6">
        <h2 className="font-bold text-navy-900">Publish an announcement</h2>
        <div className="mt-4 grid gap-4">
          <div><label className="label">Title</label><input className="input" name="title" required /></div>
          <div><label className="label">Body</label><textarea className="input min-h-28" name="body" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Audience</label>
              <select className="input" name="audience" defaultValue="internal">
                <option value="internal">Internal (employees only)</option>
                <option value="public">Public (website + portal)</option>
              </select>
            </div>
            <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
              <input type="checkbox" name="pinned" className="h-4 w-4 rounded" /> Pin to top
            </label>
          </div>
        </div>
        <button className="btn-primary mt-5" type="submit">Publish</button>
      </form>

      <div className="mt-8 space-y-4">
        {announcements.length === 0 && <EmptyState title="No announcements yet" body="Published announcements will be listed here for editing." />}
        {announcements.map((a) => (
          <div key={a.id} className="card">
            <form action={saveAnnouncementAction}>
              <input type="hidden" name="id" value={a.id} />
              <div className="grid gap-3">
                <input className="input font-semibold" name="title" defaultValue={a.title} required />
                <textarea className="input min-h-24" name="body" defaultValue={a.body} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select className="input" name="audience" defaultValue={a.audience}>
                    <option value="internal">Internal</option>
                    <option value="public">Public</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" name="pinned" defaultChecked={a.pinned} className="h-4 w-4 rounded" /> Pinned
                  </label>
                </div>
                <p className="text-xs text-slate-400">{fmtDate(a.createdAt)}{a.author ? ` · ${a.author.name}` : ""}</p>
                <div><button className="btn-ghost !py-2" type="submit">Save changes</button></div>
              </div>
            </form>
            <form action={deleteAnnouncementAction} className="mt-2">
              <input type="hidden" name="id" value={a.id} />
              <button className="text-sm font-semibold text-red-600 hover:underline" type="submit">Delete announcement</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

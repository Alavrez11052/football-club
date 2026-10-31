import { PortalTitle } from "@/components/PortalShell";
import { db } from "@/lib/db";
import { deleteNews, saveNews } from "@/lib/actions/fixtures";

export const dynamic = "force-dynamic";
const CATEGORIES = ["Club News", "Founding Announcement", "Recruitment", "Staff Appointment", "Player Signing", "Match Report", "Club Update"];

export default async function PortalNewsPage() {
  const posts = await db.newsPost.findMany({ orderBy: { createdAt: "desc" } });
  const NewsForm = ({ p }: { p?: (typeof posts)[number] }) => (
    <form action={saveNews} className="space-y-3">
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><label className="label">Title</label><input className="input" name="title" defaultValue={p?.title ?? ""} required /></div>
        <div><label className="label">Category</label>
          <select className="input" name="category" defaultValue={p?.category ?? "Club News"}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </div>
      </div>
      <div><label className="label">Story</label><textarea className="input" name="body" rows={6} defaultValue={p?.body ?? ""} required /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={p?.published ?? true} /> Published (visible on the website)</label>
      <button className="btn-primary !px-4 !py-2 text-sm">{p ? "Save story" : "Publish story"}</button>
    </form>
  );
  return (
    <div className="space-y-6">
      <PortalTitle title="News & announcements" sub="Publish founding announcements, recruitment notices, signings and match reports. Drafts stay private until published." />
      <section className="card"><h2 className="mb-3 font-display font-bold">Write a story</h2><NewsForm /></section>
      {posts.length === 0 ? (
        <p className="card text-sm text-gray-500">No stories yet. A good first post: the club&apos;s founding announcement.</p>
      ) : (
        posts.map((p) => (
          <section key={p.id} className="card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display font-bold">{p.title} <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${p.published ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>{p.published ? "Published" : "Draft"}</span></p>
              <form action={deleteNews}><input type="hidden" name="id" value={p.id} /><button className="text-sm font-semibold text-red-600">Delete</button></form>
            </div>
            <p className="text-xs text-gray-500">{p.category} · {new Date(p.createdAt).toLocaleDateString()}</p>
            <details><summary className="cursor-pointer text-sm font-semibold text-gray-600">Edit</summary><div className="mt-3"><NewsForm p={p} /></div></details>
          </section>
        ))
      )}
    </div>
  );
}

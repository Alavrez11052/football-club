import { PortalTitle } from "@/components/PortalShell";
import { db } from "@/lib/db";
import { setInquiryHandled } from "@/lib/actions/people";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const inquiries = await db.inquiry.findMany({ orderBy: [{ handled: "asc" }, { createdAt: "desc" }] });
  return (
    <div className="space-y-4">
      <PortalTitle title="Inquiries" sub="General and sponsorship messages from the website contact page." />
      {inquiries.length === 0 ? (
        <p className="card text-sm text-gray-500">No inquiries yet. Messages sent through the contact page will appear here.</p>
      ) : (
        inquiries.map((i) => (
          <article key={i.id} className={`card space-y-2 ${i.handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display font-bold">{i.subject || "(No subject)"} <span className="ml-1 rounded-full bg-ink/5 px-2 py-0.5 text-xs font-bold text-ink/60">{i.type}</span></p>
              <form action={setInquiryHandled}>
                <input type="hidden" name="id" value={i.id} />
                <input type="hidden" name="handled" value={i.handled ? "false" : "true"} />
                <button className="btn-outline !px-3 !py-1 text-xs">{i.handled ? "Reopen" : "Mark handled"}</button>
              </form>
            </div>
            <p className="text-sm text-gray-500">From {i.name} · {i.email} · {new Date(i.createdAt).toLocaleDateString()}</p>
            <p className="whitespace-pre-line text-sm text-gray-700">{i.message}</p>
          </article>
        ))
      )}
    </div>
  );
}

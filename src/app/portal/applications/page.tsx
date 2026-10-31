import { PortalTitle } from "@/components/PortalShell";
import { db } from "@/lib/db";
import { reviewApplication } from "@/lib/actions/people";
import { ageFromDob } from "@/lib/club";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  INFO_REQUESTED: "bg-blue-100 text-blue-900",
  APPROVED: "bg-green-100 text-green-900",
  REJECTED: "bg-red-100 text-red-900",
};

export default async function ApplicationsPage() {
  const apps = await db.application.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] });
  const pending = apps.filter((a) => a.status === "PENDING" || a.status === "INFO_REQUESTED");
  const decided = apps.filter((a) => a.status === "APPROVED" || a.status === "REJECTED");

  const Card = ({ a }: { a: (typeof apps)[number] }) => {
    const age = ageFromDob(a.dateOfBirth);
    return (
      <article className="card space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-bold">{a.fullName}</h3>
            <p className="text-sm text-gray-500">
              {a.type === "PLAYER" ? `Player application${a.preferredPosition ? ` · ${a.preferredPosition}` : ""}` : `Coaching application${a.desiredRole ? ` · ${a.desiredRole}` : ""}`}
              {" · "}{new Date(a.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[a.status]}`}>{a.status.replace(/_/g, " ")}</span>
        </div>
        <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold text-gray-500">Email</dt><dd>{a.email}</dd></div>
          {a.phone ? <div><dt className="font-semibold text-gray-500">Phone</dt><dd>{a.phone}</dd></div> : null}
          {a.dateOfBirth ? <div><dt className="font-semibold text-gray-500">Date of birth</dt><dd>{new Date(a.dateOfBirth).toLocaleDateString()}{age !== null ? ` (age ${age})` : ""}</dd></div> : null}
          {a.previousClubs ? <div><dt className="font-semibold text-gray-500">Previous clubs</dt><dd>{a.previousClubs}</dd></div> : null}
          {a.experience ? <div className="sm:col-span-2"><dt className="font-semibold text-gray-500">Experience</dt><dd className="whitespace-pre-line">{a.experience}</dd></div> : null}
          {a.qualifications ? <div className="sm:col-span-2"><dt className="font-semibold text-gray-500">Qualifications</dt><dd className="whitespace-pre-line">{a.qualifications}</dd></div> : null}
          {a.additionalInfo ? <div className="sm:col-span-2"><dt className="font-semibold text-gray-500">Additional info</dt><dd className="whitespace-pre-line">{a.additionalInfo}</dd></div> : null}
          {age !== null && age < 18 ? (
            <div className="rounded-md bg-amber-50 p-2 sm:col-span-2">
              <dt className="font-semibold text-amber-900">Under 18 — safeguarding</dt>
              <dd className="text-amber-800">Guardian: {a.guardianName || "—"} ({a.guardianEmail || "—"}) · Consent given: {a.guardianConsent ? "Yes" : "No"}</dd>
            </div>
          ) : null}
          {a.reviewNote ? <div className="sm:col-span-2"><dt className="font-semibold text-gray-500">Review note</dt><dd>{a.reviewNote}</dd></div> : null}
        </dl>
        {(a.status === "PENDING" || a.status === "INFO_REQUESTED") && (
          <form action={reviewApplication} className="flex flex-wrap items-center gap-2 border-t pt-3">
            <input type="hidden" name="id" value={a.id} />
            <input className="input !w-64" name="reviewNote" placeholder="Internal note (optional)" />
            <button name="decision" value="approve" className="btn-primary !px-4 !py-2 text-sm">
              Approve{a.type === "PLAYER" ? " & add as player" : " & add as staff"}
            </button>
            <button name="decision" value="info" className="btn-outline !px-4 !py-2 text-sm">Request more info</button>
            <button name="decision" value="reject" className="rounded-md px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Reject</button>
          </form>
        )}
      </article>
    );
  };

  return (
    <div className="space-y-8">
      <PortalTitle title="Applications" sub="Review player and coaching applications. Nobody becomes a player or staff member until you approve them here." />
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">Awaiting review ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="card text-sm text-gray-500">No applications are waiting. New submissions from the website will appear here.</p>
        ) : pending.map((a) => <Card key={a.id} a={a} />)}
      </section>
      {decided.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">Decided ({decided.length})</h2>
          {decided.map((a) => <Card key={a.id} a={a} />)}
        </section>
      )}
    </div>
  );
}

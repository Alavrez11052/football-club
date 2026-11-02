import PublicShell from "@/components/PublicShell";
import { submitInquiryAction } from "@/lib/actions";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string };
}) {
  const settings = await getSettings();
  return (
    <PublicShell settings={settings}>
      <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-navy-900">Contact</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
        Questions about preparedness, operations, or volunteering — send us a message. For life-threatening emergencies, call 911.
      </p>

      <div className="mt-7 grid gap-5 lg:grid-cols-5">
        <div className="card lg:col-span-2">
          <h2 className="font-bold text-navy-900">Reach us</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {settings.address && (
              <div>
                <dt className="font-semibold text-slate-700">Location</dt>
                <dd className="text-slate-600">{settings.address}</dd>
              </div>
            )}
            {settings.contactEmail && (
              <div>
                <dt className="font-semibold text-slate-700">Email</dt>
                <dd className="text-slate-600">{settings.contactEmail}</dd>
              </div>
            )}
            {settings.contactPhone && (
              <div>
                <dt className="font-semibold text-slate-700">Phone</dt>
                <dd className="text-slate-600">{settings.contactPhone}</dd>
              </div>
            )}
            {!settings.contactEmail && !settings.contactPhone && (
              <p className="text-slate-500">Contact details will be added here.</p>
            )}
          </dl>
        </div>

        <form action={submitInquiryAction} className="card lg:col-span-3">
          <h2 className="font-bold text-navy-900">Send a message</h2>
          {searchParams.sent && (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Message sent — thank you.
            </p>
          )}
          {searchParams.error && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Please fill in every field with a valid email.
            </p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">Your name</label>
              <input className="input" id="name" name="name" required />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input className="input" id="email" name="email" type="email" required />
            </div>
          </div>
          <div className="mt-4">
            <label className="label" htmlFor="message">Message</label>
            <textarea className="input min-h-32" id="message" name="message" required />
          </div>
          <button className="btn-primary mt-5" type="submit">Send message</button>
        </form>
      </div>
    </PublicShell>
  );
}

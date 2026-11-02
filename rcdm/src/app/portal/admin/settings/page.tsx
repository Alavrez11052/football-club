import { SavedBanner } from "@/components/ui";
import { saveSettingsAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: { saved?: string; error?: string } }) {
  await requireRole("ADMIN");
  const s = await getSettings();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">Website Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Everything on the public site — name, tagline, mission, about text, and contact details — is edited here.</p>
      <SavedBanner show={searchParams.saved} error={searchParams.error} />

      <form action={saveSettingsAction} className="card mt-6">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Organization name</label><input className="input" name="orgName" defaultValue={s.orgName} required /></div>
            <div><label className="label">Short name</label><input className="input" name="shortName" defaultValue={s.shortName} required /></div>
          </div>
          <div><label className="label">Tagline</label><input className="input" name="tagline" defaultValue={s.tagline} /></div>
          <div><label className="label">Homepage intro (hero text)</label><textarea className="input min-h-24" name="heroText" defaultValue={s.heroText} /></div>
          <div><label className="label">Mission</label><textarea className="input min-h-24" name="mission" defaultValue={s.mission} /></div>
          <div><label className="label">About Us text</label><textarea className="input min-h-32" name="aboutText" defaultValue={s.aboutText} /></div>
          <div><label className="label">Operations page intro</label><textarea className="input min-h-24" name="operationsText" defaultValue={s.operationsText} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Contact email</label><input className="input" name="contactEmail" defaultValue={s.contactEmail} /></div>
            <div><label className="label">Contact phone</label><input className="input" name="contactPhone" defaultValue={s.contactPhone} /></div>
          </div>
          <div><label className="label">Address / location</label><input className="input" name="address" defaultValue={s.address} /></div>
          <div><label className="label">Footer note</label><input className="input" name="footerNote" defaultValue={s.footerNote} /></div>
        </div>
        <button className="btn-primary mt-6" type="submit">Save website settings</button>
      </form>
    </div>
  );
}

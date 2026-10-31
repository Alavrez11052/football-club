import { redirect } from "next/navigation";
import { PortalTitle } from "@/components/PortalShell";
import { Crest } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getClub, SETUP_STEPS, setupProgress } from "@/lib/club";
import { saveSetupStep } from "@/lib/actions/club";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const user = (await getCurrentUser())!;
  if (user.role !== "OWNER") redirect("/portal");
  const club = await getClub();
  const progress = setupProgress(club);
  const done = new Set(progress.done);

  const StepShell = ({ stepKey, title, children }: { stepKey: string; title: string; children: React.ReactNode }) => (
    <section className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {done.has(stepKey) ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">Done</span>
        ) : (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">Optional — skip anytime</span>
        )}
      </div>
      <form action={saveSetupStep} className="space-y-4">
        <input type="hidden" name="step" value={stepKey} />
        {children}
        <button type="submit" className="btn-primary">Save step</button>
      </form>
    </section>
  );

  return (
    <div className="space-y-6">
      <PortalTitle
        title="Club setup"
        sub={`Establish your club's identity. ${progress.done.length} of ${progress.total} steps saved — you can return to any step later.`}
      />
      <StepShell stepKey="name" title="1 · Club name">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Club name</label><input className="input" name="name" defaultValue={club.name} placeholder="e.g. Riverside Athletic FC" /></div>
          <div><label className="label">Abbreviation (up to 5)</label><input className="input" name="abbreviation" defaultValue={club.abbreviation} placeholder="e.g. RAFC" maxLength={5} /></div>
        </div>
      </StepShell>

      <StepShell stepKey="crest" title="2 · Club crest">
        <div className="flex items-center gap-5">
          <Crest club={club} size={72} />
          <div className="flex-1">
            <label className="label">Upload crest (PNG, JPG, WebP, SVG — max 5 MB)</label>
            <input className="input" type="file" name="crest" accept="image/*" />
            {club.crestUrl ? <label className="mt-2 flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" name="removeCrest" /> Remove current crest</label> : null}
          </div>
        </div>
      </StepShell>

      <StepShell stepKey="colors" title="3 · Club colors">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Primary color</label><input className="input h-11" type="color" name="primaryColor" defaultValue={club.primaryColor} /></div>
          <div><label className="label">Secondary color</label><input className="input h-11" type="color" name="secondaryColor" defaultValue={club.secondaryColor} /></div>
        </div>
      </StepShell>

      <StepShell stepKey="founding" title="4 · Founding date & location">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Founding date</label><input className="input" type="date" name="foundingDate" defaultValue={club.foundingDate ? new Date(club.foundingDate).toISOString().slice(0, 10) : ""} /></div>
          <div><label className="label">Location</label><input className="input" name="location" defaultValue={club.location} placeholder="Town / city" /></div>
        </div>
      </StepShell>

      <StepShell stepKey="description" title="5 · Description & mission">
        <div><label className="label">Club description</label><textarea className="input" name="description" rows={3} defaultValue={club.description} placeholder="A short introduction to the club, shown on the homepage and About page." /></div>
        <div><label className="label">Mission</label><textarea className="input" name="mission" rows={3} defaultValue={club.mission} placeholder="Why does this club exist?" /></div>
      </StepShell>

      <StepShell stepKey="contact" title="6 · Contact email">
        <div><label className="label">Public contact email</label><input className="input" type="email" name="contactEmail" defaultValue={club.contactEmail} placeholder="club@example.com" /></div>
      </StepShell>

      <StepShell stepKey="socials" title="7 · Social media">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">X (Twitter) URL</label><input className="input" name="socialX" defaultValue={club.socialX} /></div>
          <div><label className="label">Instagram URL</label><input className="input" name="socialInstagram" defaultValue={club.socialInstagram} /></div>
          <div><label className="label">Facebook URL</label><input className="input" name="socialFacebook" defaultValue={club.socialFacebook} /></div>
          <div><label className="label">YouTube URL</label><input className="input" name="socialYoutube" defaultValue={club.socialYoutube} /></div>
          <div><label className="label">TikTok URL</label><input className="input" name="socialTiktok" defaultValue={club.socialTiktok} /></div>
        </div>
        <p className="text-xs text-gray-500">Leave a field blank and that network simply won&apos;t appear on the website.</p>
      </StepShell>

      <p className="text-sm text-gray-500">
        Everything here can also be changed later under <strong>Website &amp; branding</strong>. Steps you skip stay editable — nothing is locked in.
      </p>
    </div>
  );
}

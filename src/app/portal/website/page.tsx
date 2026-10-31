import { redirect } from "next/navigation";
import { PortalTitle } from "@/components/PortalShell";
import { getCurrentUser } from "@/lib/auth";
import { getClub } from "@/lib/club";
import { db } from "@/lib/db";
import { addSponsor, deleteSponsor, saveClubSettings } from "@/lib/actions/club";

export const dynamic = "force-dynamic";
const FONTS = ["Inter", "Roboto", "Oswald", "Montserrat", "Playfair Display", "Georgia"];

export default async function WebsitePage() {
  const user = (await getCurrentUser())!;
  if (user.role !== "OWNER") redirect("/portal");
  const club = await getClub();
  const sponsors = await db.sponsor.findMany({ orderBy: { name: "asc" } });
  const dv = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

  return (
    <div className="space-y-8">
      <PortalTitle title="Website & branding" sub="Every part of the public website is controlled here — no code required. Changes are live immediately; use View website to preview." />
      <form action={saveClubSettings} className="card space-y-6">
        <section className="space-y-4">
          <h2 className="font-display font-bold">Identity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Club name</label><input className="input" name="name" defaultValue={club.name} /></div>
            <div><label className="label">Abbreviation</label><input className="input" name="abbreviation" defaultValue={club.abbreviation} maxLength={5} /></div>
            <div><label className="label">Crest (upload to replace)</label><input className="input" type="file" name="crest" accept="image/*" /></div>
            <div><label className="label">Homepage banner (upload to replace)</label><input className="input" type="file" name="banner" accept="image/*" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="removeCrest" /> Remove crest</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="removeBanner" /> Remove banner</label>
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="font-display font-bold">Branding</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label">Primary color</label><input className="input h-11" type="color" name="primaryColor" defaultValue={club.primaryColor} /></div>
            <div><label className="label">Secondary color</label><input className="input h-11" type="color" name="secondaryColor" defaultValue={club.secondaryColor} /></div>
            <div><label className="label">Font</label>
              <select className="input" name="font" defaultValue={club.font}>{FONTS.map((f) => <option key={f} value={f}>{f}</option>)}</select>
            </div>
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="font-display font-bold">Club story & homepage text</h2>
          <div><label className="label">Welcome message (homepage hero)</label><textarea className="input" name="welcomeMessage" rows={2} defaultValue={club.welcomeMessage} /></div>
          <div><label className="label">Description</label><textarea className="input" name="description" rows={3} defaultValue={club.description} /></div>
          <div><label className="label">Founding story (About page)</label><textarea className="input" name="foundingStory" rows={4} defaultValue={club.foundingStory} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Mission</label><textarea className="input" name="mission" rows={3} defaultValue={club.mission} /></div>
            <div><label className="label">Philosophy</label><textarea className="input" name="philosophy" rows={3} defaultValue={club.philosophy} /></div>
            <div><label className="label">Values</label><textarea className="input" name="values" rows={3} defaultValue={club.values} /></div>
            <div><label className="label">Future ambitions</label><textarea className="input" name="ambitions" rows={3} defaultValue={club.ambitions} /></div>
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="font-display font-bold">Details & contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Founding date</label><input className="input" type="date" name="foundingDate" defaultValue={dv(club.foundingDate)} /></div>
            <div><label className="label">Location</label><input className="input" name="location" defaultValue={club.location} /></div>
            <div><label className="label">Contact email</label><input className="input" type="email" name="contactEmail" defaultValue={club.contactEmail} /></div>
            <div><label className="label">Contact phone</label><input className="input" name="contactPhone" defaultValue={club.contactPhone} /></div>
            <div className="sm:col-span-2"><label className="label">Address</label><input className="input" name="address" defaultValue={club.address} /></div>
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="font-display font-bold">Social links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">X (Twitter)</label><input className="input" name="socialX" defaultValue={club.socialX} /></div>
            <div><label className="label">Instagram</label><input className="input" name="socialInstagram" defaultValue={club.socialInstagram} /></div>
            <div><label className="label">Facebook</label><input className="input" name="socialFacebook" defaultValue={club.socialFacebook} /></div>
            <div><label className="label">YouTube</label><input className="input" name="socialYoutube" defaultValue={club.socialYoutube} /></div>
            <div><label className="label">TikTok</label><input className="input" name="socialTiktok" defaultValue={club.socialTiktok} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showSponsors" defaultChecked={club.showSponsors} /> Show the sponsors section on the website (only appears once sponsors are added)</label>
        </section>
        <button type="submit" className="btn-primary">Save website settings</button>
      </form>

      <section className="card space-y-4">
        <h2 className="font-display font-bold">Sponsors</h2>
        {sponsors.length === 0 ? (
          <p className="text-sm text-gray-500">No sponsors yet. The sponsors section stays hidden on the website until at least one sponsor is added here.</p>
        ) : (
          <ul className="divide-y">
            {sponsors.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">{s.name} <span className="text-gray-400">· {s.tier}</span></span>
                <form action={deleteSponsor}><input type="hidden" name="id" value={s.id} /><button className="text-sm font-semibold text-red-600">Remove</button></form>
              </li>
            ))}
          </ul>
        )}
        <form action={addSponsor} className="grid gap-3 border-t pt-4 sm:grid-cols-4">
          <input className="input" name="name" placeholder="Sponsor name" required />
          <input className="input" name="website" placeholder="Website URL" />
          <input className="input" name="tier" placeholder="Tier (e.g. Main Partner)" />
          <input className="input" type="file" name="logo" accept="image/*" aria-label="Sponsor logo" />
          <button className="btn-outline sm:col-span-4">Add sponsor</button>
        </form>
      </section>
    </div>
  );
}

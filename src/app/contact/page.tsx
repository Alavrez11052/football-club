import PublicShell from "@/components/PublicShell";
import { PageHero } from "@/components/ui";
import { InquiryForm } from "@/components/forms";
import { getClub } from "@/lib/club";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const club = await getClub();
  return (
    <PublicShell club={club}>
      <PageHero title="Contact the club" sub="General inquiries and sponsorship — we read everything." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-3">
        <div className="space-y-3 text-gray-700">
          <h2 className="font-display text-xl font-bold text-gray-900">Club details</h2>
          {club.location ? <p><strong>Location:</strong> {club.location}</p> : null}
          {club.address ? <p><strong>Address:</strong> {club.address}</p> : null}
          {club.contactEmail ? <p><strong>Email:</strong> <a className="underline" href={`mailto:${club.contactEmail}`}>{club.contactEmail}</a></p> : null}
          {club.contactPhone ? <p><strong>Phone:</strong> {club.contactPhone}</p> : null}
          {!club.location && !club.contactEmail ? <p>Full contact details will be published here soon. In the meantime, use the form — it reaches the ownership team directly.</p> : null}
          <p className="pt-2 text-sm text-gray-500">Looking to play or coach? Please use the application forms on the Join the Club page instead.</p>
        </div>
        <div className="space-y-10 lg:col-span-2">
          <div>
            <h2 className="mb-3 font-display text-xl font-bold">General inquiries</h2>
            <InquiryForm type="GENERAL" />
          </div>
          <div>
            <h2 className="mb-3 font-display text-xl font-bold">Sponsorship inquiries</h2>
            <p className="mb-3 text-sm text-gray-600">Interested in supporting a founding football club from its very first season? Tell us about your organization.</p>
            <InquiryForm type="SPONSORSHIP" />
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

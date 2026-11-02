import PublicShell from "@/components/PublicShell";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <PublicShell settings={settings}>
      <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-navy-900">About Us</h1>
      <div className="card animate-fade-up anim-delay-1 mt-6">
        <p className="whitespace-pre-line leading-relaxed text-slate-600">{settings.aboutText}</p>
      </div>
      <div className="card animate-fade-up anim-delay-2 mt-5">
        <h2 className="text-lg font-bold text-navy-900">Our mission</h2>
        <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">{settings.mission}</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          { title: "Preparedness", body: "Planning, training, and public readiness before an emergency happens." },
          { title: "Response", body: "Coordinating personnel and resources quickly when incidents occur." },
          { title: "Recovery", body: "Helping the county get back on its feet after a disaster." },
        ].map((c, i) => (
          <div key={c.title} className={`card animate-fade-up anim-delay-${i + 3}`}>
            <h3 className="font-bold text-navy-900">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
          </div>
        ))}
      </div>
    </PublicShell>
  );
}

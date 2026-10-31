import PublicShell from "@/components/PublicShell";
import { EmptyState, NewsCard, PageHero } from "@/components/ui";
import { db } from "@/lib/db";
import { getClub } from "@/lib/club";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const club = await getClub();
  const posts = await db.newsPost.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
  return (
    <PublicShell club={club}>
      <PageHero title="News & announcements" sub="Founding announcements, recruitment notices and club updates." />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {posts.length === 0 ? (
          <EmptyState title="No announcements yet">
            The club has not published any announcements yet. Founding news, recruitment notices and club updates will appear here.
          </EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <NewsCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </PublicShell>
  );
}

import { notFound } from "next/navigation";
import PublicShell from "@/components/PublicShell";
import { PageHero } from "@/components/ui";
import { db } from "@/lib/db";
import { getClub } from "@/lib/club";

export const dynamic = "force-dynamic";

export default async function NewsArticlePage({ params }: { params: { id: string } }) {
  const club = await getClub();
  const post = await db.newsPost.findUnique({ where: { id: params.id } });
  if (!post || !post.published) notFound();
  return (
    <PublicShell club={club}>
      <PageHero title={post.title} sub={`${post.category} · ${new Date(post.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}`} />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="whitespace-pre-line text-lg leading-relaxed text-gray-800">{post.body}</p>
      </article>
    </PublicShell>
  );
}

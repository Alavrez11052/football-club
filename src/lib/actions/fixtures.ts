"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { audit } from "../audit";
import { requireRole } from "../auth";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function saveFixture(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  const status = str(formData, "status") || "SCHEDULED";
  const data: Record<string, unknown> = {
    opponent: str(formData, "opponent"),
    date: new Date(str(formData, "date")),
    venue: str(formData, "venue"),
    competition: str(formData, "competition"),
    teamId: str(formData, "teamId") || null,
    isHome: formData.get("isHome") === "on",
    status,
    homeScore: status === "COMPLETED" && str(formData, "homeScore") !== "" ? parseInt(str(formData, "homeScore"), 10) : null,
    awayScore: status === "COMPLETED" && str(formData, "awayScore") !== "" ? parseInt(str(formData, "awayScore"), 10) : null,
  };
  if (id) await db.fixture.update({ where: { id }, data });
  else await db.fixture.create({ data: data as never });
  await audit(me.id, "FIXTURE_SAVED", data.opponent as string);
  revalidatePath("/portal/fixtures");
  revalidatePath("/fixtures");
}

export async function deleteFixture(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  await db.fixture.delete({ where: { id } });
  await audit(me.id, "FIXTURE_DELETED", id);
  revalidatePath("/portal/fixtures");
  revalidatePath("/fixtures");
}

export async function saveNews(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  const data = {
    title: str(formData, "title"),
    body: str(formData, "body"),
    category: str(formData, "category") || "Club News",
    published: formData.get("published") === "on",
  };
  if (id) {
    await db.newsPost.update({ where: { id }, data });
    await audit(me.id, "NEWS_UPDATED", data.title);
  } else {
    await db.newsPost.create({ data: { ...data, authorId: me.id } });
    await audit(me.id, "NEWS_PUBLISHED", data.title);
  }
  revalidatePath("/portal/news");
  revalidatePath("/news");
  revalidatePath("/");
}

export async function deleteNews(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  await db.newsPost.delete({ where: { id } });
  await audit(me.id, "NEWS_DELETED", id);
  revalidatePath("/portal/news");
  revalidatePath("/news");
}

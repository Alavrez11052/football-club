"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { requireUser } from "../auth";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function setAvailability(formData: FormData) {
  const me = await requireUser();
  const player = await db.player.findUnique({ where: { userId: me.id } });
  if (!player) return;
  const fixtureId = str(formData, "fixtureId");
  const status = str(formData, "status") as "AVAILABLE" | "UNAVAILABLE" | "MAYBE";
  await db.availability.upsert({
    where: { playerId_fixtureId: { playerId: player.id, fixtureId } },
    update: { status },
    create: { playerId: player.id, fixtureId, status },
  });
  revalidatePath("/player");
}

export async function updateOwnProfile(formData: FormData) {
  const me = await requireUser();
  const player = await db.player.findUnique({ where: { userId: me.id } });
  if (!player) return;
  await db.player.update({
    where: { id: player.id },
    data: { biography: str(formData, "biography") },
  });
  revalidatePath("/player");
}

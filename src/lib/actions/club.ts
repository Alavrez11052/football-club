"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { audit } from "../audit";
import { requireRole } from "../auth";
import { getClub, SETUP_STEPS } from "../club";
import { saveUpload } from "../upload";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

async function markStep(stepKey: string) {
  const club = await getClub();
  let done: string[] = [];
  try { done = JSON.parse(club.setupStepsDone); } catch { done = []; }
  if (!done.includes(stepKey)) {
    done.push(stepKey);
    await db.club.update({ where: { id: "club" }, data: { setupStepsDone: JSON.stringify(done) } });
  }
}

/** Setup wizard: one step at a time. Owner only. Every step is skippable. */
export async function saveSetupStep(formData: FormData) {
  const me = await requireRole("OWNER");
  const step = str(formData, "step");
  const data: Record<string, unknown> = {};

  if (step === "name") {
    data.name = str(formData, "name");
    data.abbreviation = str(formData, "abbreviation").toUpperCase().slice(0, 5);
  } else if (step === "crest") {
    const file = formData.get("crest") as File | null;
    if (file && file.size > 0) data.crestUrl = await saveUpload(file);
    if (formData.get("removeCrest") === "on") data.crestUrl = null;
  } else if (step === "colors") {
    data.primaryColor = str(formData, "primaryColor") || "#0b3d2e";
    data.secondaryColor = str(formData, "secondaryColor") || "#c9a227";
  } else if (step === "founding") {
    const d = str(formData, "foundingDate");
    data.foundingDate = d ? new Date(d) : null;
    data.location = str(formData, "location");
  } else if (step === "description") {
    data.description = str(formData, "description");
    data.mission = str(formData, "mission");
  } else if (step === "contact") {
    data.contactEmail = str(formData, "contactEmail");
  } else if (step === "socials") {
    data.socialX = str(formData, "socialX");
    data.socialInstagram = str(formData, "socialInstagram");
    data.socialFacebook = str(formData, "socialFacebook");
    data.socialYoutube = str(formData, "socialYoutube");
    data.socialTiktok = str(formData, "socialTiktok");
  }

  if (Object.keys(data).length > 0) await db.club.update({ where: { id: "club" }, data });
  if (SETUP_STEPS.some((s) => s.key === step)) await markStep(step);
  await audit(me.id, "SETUP_STEP_SAVED", step);
  revalidatePath("/", "layout");
  revalidatePath("/portal/setup");
}

/** Full website customization save (Club identity + branding + page text). Owner only. */
export async function saveClubSettings(formData: FormData) {
  const me = await requireRole("OWNER");
  const founding = str(formData, "foundingDate");
  const banner = formData.get("banner") as File | null;
  const crest = formData.get("crest") as File | null;
  const data: Record<string, unknown> = {
    name: str(formData, "name"),
    abbreviation: str(formData, "abbreviation").toUpperCase().slice(0, 5),
    primaryColor: str(formData, "primaryColor") || "#0b3d2e",
    secondaryColor: str(formData, "secondaryColor") || "#c9a227",
    font: str(formData, "font") || "Inter",
    foundingDate: founding ? new Date(founding) : null,
    location: str(formData, "location"),
    description: str(formData, "description"),
    mission: str(formData, "mission"),
    philosophy: str(formData, "philosophy"),
    values: str(formData, "values"),
    ambitions: str(formData, "ambitions"),
    foundingStory: str(formData, "foundingStory"),
    welcomeMessage: str(formData, "welcomeMessage"),
    contactEmail: str(formData, "contactEmail"),
    contactPhone: str(formData, "contactPhone"),
    address: str(formData, "address"),
    socialX: str(formData, "socialX"),
    socialInstagram: str(formData, "socialInstagram"),
    socialFacebook: str(formData, "socialFacebook"),
    socialYoutube: str(formData, "socialYoutube"),
    socialTiktok: str(formData, "socialTiktok"),
    showSponsors: formData.get("showSponsors") === "on",
  };
  if (crest && crest.size > 0) data.crestUrl = await saveUpload(crest);
  if (formData.get("removeCrest") === "on") data.crestUrl = null;
  if (banner && banner.size > 0) data.bannerUrl = await saveUpload(banner);
  if (formData.get("removeBanner") === "on") data.bannerUrl = null;

  await db.club.update({ where: { id: "club" }, data });
  await audit(me.id, "CLUB_SETTINGS_UPDATED");
  revalidatePath("/", "layout");
  revalidatePath("/portal/website");
}

export async function saveContentBlock(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const key = str(formData, "key");
  await db.contentBlock.upsert({
    where: { key },
    update: { title: str(formData, "title"), body: str(formData, "body"), visible: formData.get("visible") === "on" },
    create: { key, title: str(formData, "title"), body: str(formData, "body"), visible: formData.get("visible") === "on" },
  });
  await audit(me.id, "CONTENT_UPDATED", key);
  revalidatePath("/", "layout");
  revalidatePath("/portal/website");
}

export async function addSponsor(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const logo = formData.get("logo") as File | null;
  const sponsor = await db.sponsor.create({
    data: {
      name: str(formData, "name"),
      website: str(formData, "website"),
      tier: str(formData, "tier") || "Partner",
      logoUrl: logo && logo.size > 0 ? await saveUpload(logo) : null,
    },
  });
  await audit(me.id, "SPONSOR_ADDED", sponsor.name);
  revalidatePath("/", "layout");
  revalidatePath("/portal/website");
}

export async function deleteSponsor(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  await db.sponsor.delete({ where: { id } });
  await audit(me.id, "SPONSOR_DELETED", id);
  revalidatePath("/", "layout");
  revalidatePath("/portal/website");
}

export async function setMilestone(formData: FormData) {
  const me = await requireRole("OWNER");
  const key = str(formData, "key");
  const completed = formData.get("completed") === "true";
  await db.milestone.update({
    where: { key },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
      confirmedById: completed ? me.id : null,
    },
  });
  await audit(me.id, completed ? "MILESTONE_CONFIRMED" : "MILESTONE_UNCONFIRMED", key);
  revalidatePath("/portal/development");
  revalidatePath("/about");
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// The club's development milestones. They start UNCOMPLETED — an owner must
// confirm each one in the portal. Nothing about the club is fabricated here:
// no players, no staff, no results, no sponsors.
const MILESTONES: { key: string; label: string; description: string }[] = [
  { key: "founded", label: "Club founded", description: "The club was officially founded." },
  { key: "ownership", label: "Initial ownership established", description: "The founding ownership team is in place." },
  { key: "first-coach", label: "First coach appointed", description: "The club appointed its first coach." },
  { key: "first-player", label: "First player registered", description: "The first player was added to the club roster." },
  { key: "first-team", label: "First team assembled", description: "A full team was assembled from registered players." },
  { key: "first-training", label: "First training session", description: "The club held its first training session." },
  { key: "first-friendly", label: "First friendly match", description: "The club played its first friendly match." },
  { key: "league-application", label: "First league application", description: "The club applied to join a league." },
  { key: "league-affiliation", label: "Official league affiliation", description: "The club was officially accepted into a league." },
];

async function main() {
  // Singleton club row (identity stays blank until the owner runs setup).
  await prisma.club.upsert({ where: { id: "club" }, update: {}, create: { id: "club" } });

  for (let i = 0; i < MILESTONES.length; i++) {
    const m = MILESTONES[i];
    await prisma.milestone.upsert({
      where: { key: m.key },
      update: { label: m.label, description: m.description, sortOrder: i },
      create: { ...m, sortOrder: i },
    });
  }

  // First owner account, created only when no users exist yet.
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    const email = process.env.OWNER_EMAIL;
    const password = process.env.OWNER_PASSWORD;
    const name = process.env.OWNER_NAME || "Club Owner";
    if (email && password) {
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.create({ data: { email, passwordHash, name, role: "OWNER" } });
      console.log(`Owner account created for ${email}`);
    } else {
      console.log("No users exist and OWNER_EMAIL/OWNER_PASSWORD are not set — the first person to open /setup can claim ownership.");
    }
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

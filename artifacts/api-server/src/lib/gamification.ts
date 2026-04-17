import { eq } from "drizzle-orm";
import { db, gamificationTable, XP_REWARDS, calcLevel } from "@workspace/db";

export async function getOrCreateGamification(userId: string) {
  const [existing] = await db.select().from(gamificationTable).where(eq(gamificationTable.userId, userId));
  if (existing) return existing;
  const [created] = await db.insert(gamificationTable).values({ userId }).returning();
  return created;
}

export async function awardXP(userId: string, amount: number) {
  const gam = await getOrCreateGamification(userId);
  const newXP = gam.xp + amount;
  const newLevel = calcLevel(newXP);
  const [updated] = await db
    .update(gamificationTable)
    .set({ xp: newXP, level: newLevel, updatedAt: new Date() })
    .where(eq(gamificationTable.userId, userId))
    .returning();
  return { updated, leveledUp: newLevel > gam.level, newLevel };
}

export async function incrementTotalTasksDone(userId: string) {
  const gam = await getOrCreateGamification(userId);
  await db
    .update(gamificationTable)
    .set({ totalTasksDone: gam.totalTasksDone + 1, updatedAt: new Date() })
    .where(eq(gamificationTable.userId, userId));
}

export function xpForTask(priority: string): number {
  switch (priority) {
    case "low": return XP_REWARDS.task_low;
    case "high": return XP_REWARDS.task_high;
    case "urgent": return XP_REWARDS.task_urgent;
    default: return XP_REWARDS.task_medium;
  }
}

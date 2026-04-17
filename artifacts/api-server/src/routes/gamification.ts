import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, gamificationTable, calcLevel, xpToNextLevel, xpProgress, XP_REWARDS } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";
import { getOrCreateGamification, awardXP } from "../lib/gamification";

const router: IRouter = Router();

router.get("/gamification/me", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const gam = await getOrCreateGamification(userId);

  const level = calcLevel(gam.xp);
  const toNext = xpToNextLevel(gam.xp);
  const progress = xpProgress(gam.xp);

  res.json({
    xp: gam.xp,
    level,
    totalTasksDone: gam.totalTasksDone,
    loginStreak: gam.loginStreak,
    longestLoginStreak: gam.longestLoginStreak,
    xpToNextLevel: toNext,
    levelProgress: progress,
    lastLoginDate: gam.lastLoginDate,
  });
});

router.post("/gamification/daily-login", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const gam = await getOrCreateGamification(userId);

  const today = new Date().toISOString().split("T")[0];
  if (gam.lastLoginDate === today) {
    res.json({ alreadyAwarded: true, xp: gam.xp, loginStreak: gam.loginStreak });
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const newStreak = gam.lastLoginDate === yesterdayStr ? gam.loginStreak + 1 : 1;
  const newLongest = Math.max(newStreak, gam.longestLoginStreak);
  const newXP = gam.xp + XP_REWARDS.daily_login;
  const newLevel = calcLevel(newXP);

  const [updated] = await db
    .update(gamificationTable)
    .set({
      xp: newXP,
      level: newLevel,
      loginStreak: newStreak,
      longestLoginStreak: newLongest,
      lastLoginDate: today,
      updatedAt: new Date(),
    })
    .where(eq(gamificationTable.userId, userId))
    .returning();

  res.json({
    alreadyAwarded: false,
    xpAwarded: XP_REWARDS.daily_login,
    xp: updated.xp,
    level: updated.level,
    loginStreak: updated.loginStreak,
    levelProgress: xpProgress(updated.xp),
    xpToNextLevel: xpToNextLevel(updated.xp),
  });
});

router.post("/gamification/award-xp", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const { amount, reason } = req.body as { amount: number; reason?: string };
  if (!amount || amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }
  const result = await awardXP(userId, amount);
  res.json({
    xp: result.updated.xp,
    level: result.updated.level,
    xpAwarded: amount,
    reason,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    levelProgress: xpProgress(result.updated.xp),
    xpToNextLevel: xpToNextLevel(result.updated.xp),
  });
});

export default router;

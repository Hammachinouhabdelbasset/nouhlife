import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, dailyPlansTable } from "@workspace/db";
import { CreateDailyPlanBody, ListDailyPlansQueryParams } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/daily-plans", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const query = ListDailyPlansQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { date } = query.data;
  const conditions = [eq(dailyPlansTable.userId, userId)];
  if (date) conditions.push(eq(dailyPlansTable.date, date));
  const plans = await db.select().from(dailyPlansTable).where(and(...conditions)).orderBy(dailyPlansTable.date);
  res.json(plans.map(formatPlan));
});

router.post("/daily-plans", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const parsed = CreateDailyPlanBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [existing] = await db.select().from(dailyPlansTable).where(and(eq(dailyPlansTable.userId, userId), eq(dailyPlansTable.date, parsed.data.date)));
  if (existing) {
    const [updated] = await db.update(dailyPlansTable).set({
      mits: parsed.data.mits ?? existing.mits, intention: parsed.data.intention ?? existing.intention,
      energyLevel: parsed.data.energyLevel ?? existing.energyLevel, reflection: parsed.data.reflection ?? existing.reflection,
      wins: parsed.data.wins ?? existing.wins, updatedAt: new Date(),
    }).where(and(eq(dailyPlansTable.userId, userId), eq(dailyPlansTable.date, parsed.data.date))).returning();
    res.status(201).json(formatPlan(updated));
    return;
  }
  const [plan] = await db.insert(dailyPlansTable).values({
    userId, date: parsed.data.date, mits: parsed.data.mits ?? [], intention: parsed.data.intention,
    energyLevel: parsed.data.energyLevel, reflection: parsed.data.reflection, wins: parsed.data.wins ?? [],
  }).returning();
  res.status(201).json(formatPlan(plan));
});

router.get("/daily-plans/:date", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const raw = Array.isArray(req.params.date) ? req.params.date[0] : req.params.date;
  const [plan] = await db.select().from(dailyPlansTable).where(and(eq(dailyPlansTable.userId, userId), eq(dailyPlansTable.date, raw)));
  if (!plan) { res.status(404).json({ error: "Daily plan not found" }); return; }
  res.json(formatPlan(plan));
});

function formatPlan(plan: typeof dailyPlansTable.$inferSelect) {
  return {
    id: plan.id, date: plan.date,
    mits: Array.isArray(plan.mits) ? plan.mits : [],
    intention: plan.intention, energyLevel: plan.energyLevel, reflection: plan.reflection,
    wins: Array.isArray(plan.wins) ? plan.wins : [],
    createdAt: plan.createdAt.toISOString(), updatedAt: plan.updatedAt.toISOString(),
  };
}

export default router;

import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, dailyPlansTable } from "@workspace/db";
import {
  CreateDailyPlanBody,
  ListDailyPlansQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/daily-plans", async (req, res): Promise<void> => {
  const query = ListDailyPlansQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { date } = query.data;
  const plans = date
    ? await db.select().from(dailyPlansTable).where(eq(dailyPlansTable.date, date))
    : await db.select().from(dailyPlansTable).orderBy(dailyPlansTable.date);

  res.json(plans.map(formatPlan));
});

router.post("/daily-plans", async (req, res): Promise<void> => {
  const parsed = CreateDailyPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Upsert by date
  const existing = await db.select().from(dailyPlansTable).where(eq(dailyPlansTable.date, parsed.data.date));
  if (existing[0]) {
    const [updated] = await db.update(dailyPlansTable)
      .set({
        mits: parsed.data.mits ?? existing[0].mits,
        intention: parsed.data.intention ?? existing[0].intention,
        energyLevel: parsed.data.energyLevel ?? existing[0].energyLevel,
        reflection: parsed.data.reflection ?? existing[0].reflection,
        wins: parsed.data.wins ?? existing[0].wins,
        updatedAt: new Date(),
      })
      .where(eq(dailyPlansTable.date, parsed.data.date))
      .returning();
    res.status(201).json(formatPlan(updated));
    return;
  }

  const [plan] = await db
    .insert(dailyPlansTable)
    .values({
      date: parsed.data.date,
      mits: parsed.data.mits ?? [],
      intention: parsed.data.intention,
      energyLevel: parsed.data.energyLevel,
      reflection: parsed.data.reflection,
      wins: parsed.data.wins ?? [],
    })
    .returning();
  res.status(201).json(formatPlan(plan));
});

router.get("/daily-plans/:date", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.date) ? req.params.date[0] : req.params.date;
  const [plan] = await db.select().from(dailyPlansTable).where(eq(dailyPlansTable.date, raw));
  if (!plan) {
    res.status(404).json({ error: "Daily plan not found" });
    return;
  }
  res.json(formatPlan(plan));
});

function formatPlan(plan: typeof dailyPlansTable.$inferSelect) {
  return {
    id: plan.id,
    date: plan.date,
    mits: Array.isArray(plan.mits) ? plan.mits : [],
    intention: plan.intention,
    energyLevel: plan.energyLevel,
    reflection: plan.reflection,
    wins: Array.isArray(plan.wins) ? plan.wins : [],
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

export default router;

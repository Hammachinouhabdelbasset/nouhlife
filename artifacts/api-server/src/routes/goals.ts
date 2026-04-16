import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, goalsTable } from "@workspace/db";
import {
  CreateGoalBody, UpdateGoalBody, UpdateGoalParams, DeleteGoalParams, ListGoalsQueryParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/goals", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const query = ListGoalsQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { timeframe, status } = query.data;
  const conditions = [eq(goalsTable.userId, userId)];
  if (timeframe) conditions.push(eq(goalsTable.timeframe, timeframe));
  if (status) conditions.push(eq(goalsTable.status, status));
  const goals = await db.select().from(goalsTable).where(and(...conditions)).orderBy(goalsTable.createdAt);
  res.json(goals.map(formatGoal));
});

router.post("/goals", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const parsed = CreateGoalBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [goal] = await db.insert(goalsTable).values({
    userId, title: parsed.data.title, description: parsed.data.description,
    timeframe: parsed.data.timeframe, status: "active", progress: 0, targetDate: parsed.data.targetDate, milestones: [],
  }).returning();
  res.status(201).json(formatGoal(goal));
});

router.get("/goals/overview", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const allGoals = await db.select().from(goalsTable).where(eq(goalsTable.userId, userId));
  const activeGoals = allGoals.filter((g) => g.status === "active");
  const completedGoals = allGoals.filter((g) => g.status === "completed");
  const avgProgress = activeGoals.length > 0 ? activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length : 0;
  const timeframes = ["weekly", "monthly", "quarterly", "yearly", "vision"];
  res.json({
    totalActive: activeGoals.length, totalCompleted: completedGoals.length, averageProgress: avgProgress,
    byTimeframe: timeframes.map((timeframe) => ({
      timeframe,
      active: allGoals.filter((g) => g.timeframe === timeframe && g.status === "active").length,
      completed: allGoals.filter((g) => g.timeframe === timeframe && g.status === "completed").length,
    })),
  });
});

router.put("/goals/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const params = UpdateGoalParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateGoalBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [goal] = await db.update(goalsTable).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(goalsTable.id, params.data.id), eq(goalsTable.userId, userId))).returning();
  if (!goal) { res.status(404).json({ error: "Goal not found" }); return; }
  res.json(formatGoal(goal));
});

router.delete("/goals/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const params = DeleteGoalParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(goalsTable).where(and(eq(goalsTable.id, params.data.id), eq(goalsTable.userId, userId)));
  res.sendStatus(204);
});

function formatGoal(goal: typeof goalsTable.$inferSelect) {
  const milestones = Array.isArray(goal.milestones) ? goal.milestones as Array<{ id: number; title: string; completed: boolean }> : [];
  return {
    id: goal.id, title: goal.title, description: goal.description, timeframe: goal.timeframe, status: goal.status,
    progress: goal.progress, targetDate: goal.targetDate, milestones,
    createdAt: goal.createdAt.toISOString(), updatedAt: goal.updatedAt.toISOString(),
  };
}

export default router;

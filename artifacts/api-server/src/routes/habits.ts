import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, habitsTable, habitLogsTable } from "@workspace/db";
import {
  CreateHabitBody,
  UpdateHabitBody,
  UpdateHabitParams,
  DeleteHabitParams,
  LogHabitParams,
  LogHabitBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/habits", async (_req, res): Promise<void> => {
  const habits = await db.select().from(habitsTable).orderBy(habitsTable.createdAt);
  const today = new Date().toISOString().split("T")[0];

  const todayLogs = await db.select().from(habitLogsTable).where(eq(habitLogsTable.date, today));
  const completedTodayIds = new Set(todayLogs.map((l) => l.habitId));

  res.json(habits.map((h) => ({
    ...formatHabit(h),
    completedToday: completedTodayIds.has(h.id),
  })));
});

router.post("/habits", async (req, res): Promise<void> => {
  const parsed = CreateHabitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [habit] = await db
    .insert(habitsTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
      frequency: parsed.data.frequency,
      targetCount: parsed.data.targetCount ?? 1,
      category: parsed.data.category ?? "personal",
      color: parsed.data.color ?? "#6366f1",
    })
    .returning();
  res.status(201).json({ ...formatHabit(habit), completedToday: false });
});

router.put("/habits/:id", async (req, res): Promise<void> => {
  const params = UpdateHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateHabitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [habit] = await db.update(habitsTable).set(parsed.data).where(eq(habitsTable.id, params.data.id)).returning();
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  const today = new Date().toISOString().split("T")[0];
  const [todayLog] = await db.select().from(habitLogsTable).where(and(eq(habitLogsTable.habitId, habit.id), eq(habitLogsTable.date, today)));
  res.json({ ...formatHabit(habit), completedToday: !!todayLog });
});

router.delete("/habits/:id", async (req, res): Promise<void> => {
  const params = DeleteHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(habitLogsTable).where(eq(habitLogsTable.habitId, params.data.id));
  await db.delete(habitsTable).where(eq(habitsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/habits/:id/log", async (req, res): Promise<void> => {
  const params = LogHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = LogHabitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(habitLogsTable).where(
    and(eq(habitLogsTable.habitId, params.data.id), eq(habitLogsTable.date, parsed.data.date))
  );
  if (existing) {
    res.status(201).json({
      id: existing.id,
      habitId: existing.habitId,
      date: existing.date,
      note: existing.note,
      createdAt: existing.createdAt.toISOString(),
    });
    return;
  }

  const [log] = await db
    .insert(habitLogsTable)
    .values({
      habitId: params.data.id,
      date: parsed.data.date,
      note: parsed.data.note,
    })
    .returning();

  // Update streak
  const habit = await db.select().from(habitsTable).where(eq(habitsTable.id, params.data.id));
  if (habit[0]) {
    const newStreak = habit[0].currentStreak + 1;
    const newLongest = Math.max(newStreak, habit[0].longestStreak);
    await db.update(habitsTable).set({ currentStreak: newStreak, longestStreak: newLongest }).where(eq(habitsTable.id, params.data.id));
  }

  res.status(201).json({
    id: log.id,
    habitId: log.habitId,
    date: log.date,
    note: log.note,
    createdAt: log.createdAt.toISOString(),
  });
});

router.get("/habits/streaks", async (_req, res): Promise<void> => {
  const habits = await db.select().from(habitsTable).orderBy(habitsTable.createdAt);
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = await db.select().from(habitLogsTable).where(eq(habitLogsTable.date, today));
  const completedTodayIds = new Set(todayLogs.map((l) => l.habitId));

  const completedTodayCount = completedTodayIds.size;
  const totalHabits = habits.length;
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
  const avgStreak = totalHabits > 0
    ? habits.reduce((sum, h) => sum + h.currentStreak, 0) / totalHabits
    : 0;

  const disciplineScore = totalHabits > 0
    ? Math.round((completedTodayCount / totalHabits) * 100)
    : 0;

  const consistencyScore = totalHabits > 0
    ? Math.min(100, Math.round(avgStreak * 10))
    : 0;

  res.json({
    disciplineScore,
    consistencyScore,
    totalHabits,
    completedTodayCount,
    longestStreak,
    habits: habits.map((h) => ({
      id: h.id,
      name: h.name,
      currentStreak: h.currentStreak,
      completedToday: completedTodayIds.has(h.id),
    })),
  });
});

function formatHabit(h: typeof habitsTable.$inferSelect) {
  return {
    id: h.id,
    name: h.name,
    description: h.description,
    frequency: h.frequency,
    targetCount: h.targetCount,
    currentStreak: h.currentStreak,
    longestStreak: h.longestStreak,
    category: h.category,
    color: h.color,
    createdAt: h.createdAt.toISOString(),
    completedToday: false,
  };
}

export default router;

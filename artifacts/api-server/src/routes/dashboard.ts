import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, notesTable, tasksTable, projectsTable, habitsTable, habitLogsTable, transactionsTable, contentTable, goalsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().substring(0, 7);

  const [notes, tasks, projects, habits, habitLogs, transactions, content, goals] = await Promise.all([
    db.select().from(notesTable),
    db.select().from(tasksTable),
    db.select().from(projectsTable),
    db.select().from(habitsTable),
    db.select().from(habitLogsTable).where(eq(habitLogsTable.date, today)),
    db.select().from(transactionsTable),
    db.select().from(contentTable),
    db.select().from(goalsTable),
  ]);

  const tasksDueToday = tasks.filter((t) => t.dueDate === today && t.status !== "done").length;
  const tasksCompleted = tasks.filter((t) => t.status === "done").length;
  const habitsCompletedToday = habitLogs.length;
  const disciplineScore = habits.length > 0 ? Math.round((habitsCompletedToday / habits.length) * 100) : 0;
  const maxStreak = habits.reduce((m, h) => Math.max(m, h.currentStreak), 0);
  const projectsActive = projects.filter((p) => p.status === "active").length;

  const monthlyIncome = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(currentMonth))
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
    .reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netWorth = totalIncome - totalExpenses;

  const contentPublishedThisMonth = content.filter(
    (c) => c.status === "published" && c.publishDate?.startsWith(currentMonth)
  ).length;

  res.json({
    tasksTotal: tasks.length,
    tasksDueToday,
    tasksCompleted,
    habitsStreak: maxStreak,
    disciplineScore,
    notesTotal: notes.length,
    projectsActive,
    netWorth,
    monthlyIncome,
    monthlyExpenses,
    contentPublishedThisMonth,
    goalsActive: goals.filter((g) => g.status === "active").length,
    goalsCompleted: goals.filter((g) => g.status === "completed").length,
  });
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const limit = 20;
  const [tasks, notes, habitLogs, content, goals] = await Promise.all([
    db.select().from(tasksTable).orderBy(tasksTable.updatedAt).limit(5),
    db.select().from(notesTable).orderBy(notesTable.updatedAt).limit(5),
    db.select().from(habitLogsTable).orderBy(habitLogsTable.createdAt).limit(5),
    db.select().from(contentTable).orderBy(contentTable.updatedAt).limit(5),
    db.select().from(goalsTable).orderBy(goalsTable.updatedAt).limit(5),
  ]);

  const activities = [
    ...tasks.filter((t) => t.status === "done").map((t) => ({
      id: t.id,
      type: "task_completed" as const,
      title: `Completed: ${t.title}`,
      description: t.description ?? undefined,
      timestamp: t.updatedAt.toISOString(),
      module: "tasks",
    })),
    ...notes.map((n) => ({
      id: n.id + 1000,
      type: "note_created" as const,
      title: `Note: ${n.title}`,
      description: n.category,
      timestamp: n.updatedAt.toISOString(),
      module: "knowledge",
    })),
    ...habitLogs.map((l) => ({
      id: l.id + 2000,
      type: "habit_logged" as const,
      title: `Habit logged`,
      description: l.note ?? undefined,
      timestamp: l.createdAt.toISOString(),
      module: "habits",
    })),
    ...content.filter((c) => c.status === "published").map((c) => ({
      id: c.id + 3000,
      type: "content_published" as const,
      title: `Published: ${c.title}`,
      description: c.platform,
      timestamp: c.updatedAt.toISOString(),
      module: "content",
    })),
    ...goals.filter((g) => g.status === "completed").map((g) => ({
      id: g.id + 4000,
      type: "goal_achieved" as const,
      title: `Goal achieved: ${g.title}`,
      description: g.timeframe,
      timestamp: g.updatedAt.toISOString(),
      module: "goals",
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  res.json(activities);
});

export default router;

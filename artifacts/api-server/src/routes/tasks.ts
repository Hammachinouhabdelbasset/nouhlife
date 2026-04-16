import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, tasksTable } from "@workspace/db";
import {
  CreateTaskBody,
  UpdateTaskBody,
  GetTaskParams,
  UpdateTaskParams,
  DeleteTaskParams,
  ListTasksQueryParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/tasks", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const query = ListTasksQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { status, priority, projectId } = query.data;
  const conditions = [eq(tasksTable.userId, userId)];
  if (status) conditions.push(eq(tasksTable.status, status));
  if (priority) conditions.push(eq(tasksTable.priority, priority));
  if (projectId) conditions.push(eq(tasksTable.projectId, projectId));
  const tasks = await db.select().from(tasksTable).where(and(...conditions)).orderBy(tasksTable.createdAt);
  res.json(tasks.map(formatTask));
});

router.post("/tasks", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [task] = await db.insert(tasksTable).values({
    userId, title: parsed.data.title, description: parsed.data.description,
    status: parsed.data.status ?? "todo", priority: parsed.data.priority ?? "medium",
    projectId: parsed.data.projectId, dueDate: parsed.data.dueDate, tags: parsed.data.tags ?? [],
  }).returning();
  res.status(201).json(formatTask(task));
});

router.get("/tasks/summary", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const allTasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));
  const today = new Date().toISOString().split("T")[0];
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  let overdueCount = 0, dueTodayCount = 0, completedCount = 0;
  for (const task of allTasks) {
    byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
    byPriority[task.priority] = (byPriority[task.priority] ?? 0) + 1;
    if (task.status === "done") completedCount++;
    if (task.dueDate && task.status !== "done" && task.status !== "cancelled") {
      if (task.dueDate < today) overdueCount++;
      if (task.dueDate === today) dueTodayCount++;
    }
  }
  const total = allTasks.length;
  res.json({
    total, byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    byPriority: Object.entries(byPriority).map(([priority, count]) => ({ priority, count })),
    overdueCount, dueTodayCount, completionRate: total > 0 ? completedCount / total : 0,
  });
});

router.get("/tasks/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const params = GetTaskParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [task] = await db.select().from(tasksTable).where(and(eq(tasksTable.id, params.data.id), eq(tasksTable.userId, userId)));
  if (!task) { res.status(404).json({ error: "Task not found" }); return; }
  res.json(formatTask(task));
});

router.put("/tasks/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.status === "done" && !updateData.completedAt) updateData.completedAt = new Date();
  const [task] = await db.update(tasksTable).set(updateData).where(and(eq(tasksTable.id, params.data.id), eq(tasksTable.userId, userId))).returning();
  if (!task) { res.status(404).json({ error: "Task not found" }); return; }
  res.json(formatTask(task));
});

router.delete("/tasks/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(tasksTable).where(and(eq(tasksTable.id, params.data.id), eq(tasksTable.userId, userId)));
  res.sendStatus(204);
});

function formatTask(task: typeof tasksTable.$inferSelect) {
  return {
    id: task.id, title: task.title, description: task.description,
    status: task.status, priority: task.priority, projectId: task.projectId,
    dueDate: task.dueDate, completedAt: task.completedAt?.toISOString(),
    tags: task.tags, createdAt: task.createdAt.toISOString(), updatedAt: task.updatedAt.toISOString(),
  };
}

export default router;

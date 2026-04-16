import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, contentTable } from "@workspace/db";
import {
  CreateContentBody, UpdateContentBody, GetContentParams, UpdateContentParams, DeleteContentParams, ListContentQueryParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

const PIPELINE_STAGES = [
  { status: "raw_idea", label: "Raw Idea" }, { status: "researching", label: "Researching" },
  { status: "scripting", label: "Scripting" }, { status: "filming", label: "Filming" },
  { status: "editing", label: "Editing" }, { status: "ready", label: "Ready" },
  { status: "published", label: "Published" }, { status: "repurpose", label: "Repurpose" }, { status: "archive", label: "Archive" },
];

router.get("/content", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const query = ListContentQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { status, platform } = query.data;
  const conditions = [eq(contentTable.userId, userId)];
  if (status) conditions.push(eq(contentTable.status, status));
  if (platform) conditions.push(eq(contentTable.platform, platform));
  const items = await db.select().from(contentTable).where(and(...conditions)).orderBy(contentTable.createdAt);
  res.json(items.map(formatContent));
});

router.post("/content", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const parsed = CreateContentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(contentTable).values({
    userId, title: parsed.data.title, hook: parsed.data.hook, script: parsed.data.script,
    status: parsed.data.status ?? "raw_idea", platform: parsed.data.platform, targetAudience: parsed.data.targetAudience,
    painPoint: parsed.data.painPoint, cta: parsed.data.cta, dueDate: parsed.data.dueDate, publishDate: parsed.data.publishDate, tags: parsed.data.tags ?? [],
  }).returning();
  res.status(201).json(formatContent(item));
});

router.get("/content/pipeline", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const allItems = await db.select().from(contentTable).where(eq(contentTable.userId, userId));
  const statusCounts: Record<string, number> = {};
  for (const item of allItems) statusCounts[item.status] = (statusCounts[item.status] ?? 0) + 1;
  const currentMonth = new Date().toISOString().substring(0, 7);
  res.json({
    stages: PIPELINE_STAGES.map((s) => ({ ...s, count: statusCounts[s.status] ?? 0 })),
    totalActive: allItems.filter((i) => i.status !== "archive").length,
    publishedThisMonth: allItems.filter((i) => i.status === "published" && i.publishDate?.startsWith(currentMonth)).length,
  });
});

router.get("/content/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const params = GetContentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [item] = await db.select().from(contentTable).where(and(eq(contentTable.id, params.data.id), eq(contentTable.userId, userId)));
  if (!item) { res.status(404).json({ error: "Content not found" }); return; }
  res.json(formatContent(item));
});

router.put("/content/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const params = UpdateContentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateContentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.update(contentTable).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(contentTable.id, params.data.id), eq(contentTable.userId, userId))).returning();
  if (!item) { res.status(404).json({ error: "Content not found" }); return; }
  res.json(formatContent(item));
});

router.delete("/content/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const params = DeleteContentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(contentTable).where(and(eq(contentTable.id, params.data.id), eq(contentTable.userId, userId)));
  res.sendStatus(204);
});

function formatContent(item: typeof contentTable.$inferSelect) {
  return {
    id: item.id, title: item.title, hook: item.hook, script: item.script, status: item.status, platform: item.platform,
    targetAudience: item.targetAudience, painPoint: item.painPoint, cta: item.cta, dueDate: item.dueDate, publishDate: item.publishDate,
    tags: item.tags, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(),
  };
}

export default router;

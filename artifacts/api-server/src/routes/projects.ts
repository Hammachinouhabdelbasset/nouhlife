import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import {
  CreateProjectBody, UpdateProjectBody, GetProjectParams, UpdateProjectParams, DeleteProjectParams, ListProjectsQueryParams,
} from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/projects", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const query = ListProjectsQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  const { status, type } = query.data;
  const conditions = [eq(projectsTable.userId, userId)];
  if (status) conditions.push(eq(projectsTable.status, status));
  if (type) conditions.push(eq(projectsTable.type, type));
  const projects = await db.select().from(projectsTable).where(and(...conditions)).orderBy(projectsTable.createdAt);
  res.json(projects.map(formatProject));
});

router.post("/projects", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [project] = await db.insert(projectsTable).values({
    userId, title: parsed.data.title, description: parsed.data.description,
    type: parsed.data.type, status: parsed.data.status ?? "active", progress: 0,
    stack: parsed.data.stack, githubUrl: parsed.data.githubUrl, deadline: parsed.data.deadline, tags: parsed.data.tags ?? [],
  }).returning();
  res.status(201).json(formatProject(project));
});

router.get("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [project] = await db.select().from(projectsTable).where(and(eq(projectsTable.id, params.data.id), eq(projectsTable.userId, userId)));
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  res.json(formatProject(project));
});

router.put("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [project] = await db.update(projectsTable).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(projectsTable.id, params.data.id), eq(projectsTable.userId, userId))).returning();
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  res.json(formatProject(project));
});

router.delete("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = req as AuthenticatedRequest;
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(projectsTable).where(and(eq(projectsTable.id, params.data.id), eq(projectsTable.userId, userId)));
  res.sendStatus(204);
});

function formatProject(project: typeof projectsTable.$inferSelect) {
  return {
    id: project.id, title: project.title, description: project.description, type: project.type,
    status: project.status, progress: project.progress, stack: project.stack, githubUrl: project.githubUrl,
    deadline: project.deadline, tags: project.tags, createdAt: project.createdAt.toISOString(), updatedAt: project.updatedAt.toISOString(),
  };
}

export default router;

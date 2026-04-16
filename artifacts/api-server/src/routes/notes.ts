import { Router, type IRouter } from "express";
import { eq, ilike, or, sql } from "drizzle-orm";
import { db, notesTable } from "@workspace/db";
import {
  CreateNoteBody,
  UpdateNoteBody,
  GetNoteParams,
  UpdateNoteParams,
  DeleteNoteParams,
  ListNotesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notes", async (req, res): Promise<void> => {
  const query = ListNotesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { category, tag, search, pinned } = query.data;

  let baseQuery = db.select().from(notesTable).$dynamic();

  const conditions = [];

  if (category) {
    conditions.push(eq(notesTable.category, category));
  }
  if (pinned !== undefined) {
    conditions.push(eq(notesTable.pinned, pinned));
  }
  if (search) {
    conditions.push(
      or(
        ilike(notesTable.title, `%${search}%`),
        ilike(notesTable.content, `%${search}%`),
      ),
    );
  }

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    baseQuery = baseQuery.where(and(...conditions));
  }

  let notes = await baseQuery.orderBy(notesTable.updatedAt);

  if (tag) {
    notes = notes.filter((n) => n.tags.includes(tag));
  }

  res.json(notes.map(formatNote));
});

router.post("/notes", async (req, res): Promise<void> => {
  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [note] = await db
    .insert(notesTable)
    .values({
      title: parsed.data.title,
      content: parsed.data.content ?? "",
      category: parsed.data.category,
      subcategory: parsed.data.subcategory,
      tags: parsed.data.tags ?? [],
      pinned: parsed.data.pinned ?? false,
      favorite: parsed.data.favorite ?? false,
    })
    .returning();
  res.status(201).json(formatNote(note));
});

router.get("/notes/stats", async (_req, res): Promise<void> => {
  const allNotes = await db.select().from(notesTable);
  const byCategory: Record<string, number> = {};
  for (const note of allNotes) {
    byCategory[note.category] = (byCategory[note.category] ?? 0) + 1;
  }
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  res.json({
    total: allNotes.length,
    byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
    recentlyUpdated: allNotes.filter((n) => new Date(n.updatedAt) > weekAgo).length,
    pinned: allNotes.filter((n) => n.pinned).length,
  });
});

router.get("/notes/:id", async (req, res): Promise<void> => {
  const params = GetNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [note] = await db.select().from(notesTable).where(eq(notesTable.id, params.data.id));
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(formatNote(note));
});

router.put("/notes/:id", async (req, res): Promise<void> => {
  const params = UpdateNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [note] = await db
    .update(notesTable)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(notesTable.id, params.data.id))
    .returning();
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(formatNote(note));
});

router.delete("/notes/:id", async (req, res): Promise<void> => {
  const params = DeleteNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(notesTable).where(eq(notesTable.id, params.data.id));
  res.sendStatus(204);
});

function formatNote(note: typeof notesTable.$inferSelect) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    category: note.category,
    subcategory: note.subcategory,
    tags: note.tags,
    pinned: note.pinned,
    favorite: note.favorite,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export default router;

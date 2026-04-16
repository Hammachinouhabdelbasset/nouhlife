import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyPlansTable = pgTable("daily_plans", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  date: text("date").notNull(),
  mits: jsonb("mits").notNull().default([]),
  intention: text("intention"),
  energyLevel: integer("energy_level"),
  reflection: text("reflection"),
  wins: jsonb("wins").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDailyPlanSchema = createInsertSchema(dailyPlansTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDailyPlan = z.infer<typeof insertDailyPlanSchema>;
export type DailyPlan = typeof dailyPlansTable.$inferSelect;

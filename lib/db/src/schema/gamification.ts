import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const gamificationTable = pgTable("gamification", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  totalTasksDone: integer("total_tasks_done").notNull().default(0),
  loginStreak: integer("login_streak").notNull().default(0),
  longestLoginStreak: integer("longest_login_streak").notNull().default(0),
  lastLoginDate: text("last_login_date"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Gamification = typeof gamificationTable.$inferSelect;

export function calcLevel(xp: number): number {
  return Math.max(1, Math.floor(0.1 * Math.sqrt(xp)));
}

export function xpToNextLevel(xp: number): number {
  const level = calcLevel(xp);
  const nextLevelXp = Math.pow((level + 1) / 0.1, 2);
  return Math.ceil(nextLevelXp - xp);
}

export function xpForCurrentLevel(xp: number): number {
  const level = calcLevel(xp);
  return Math.pow(level / 0.1, 2);
}

export function xpProgress(xp: number): number {
  const level = calcLevel(xp);
  const currentLevelStart = Math.pow(level / 0.1, 2);
  const nextLevelStart = Math.pow((level + 1) / 0.1, 2);
  return (xp - currentLevelStart) / (nextLevelStart - currentLevelStart);
}

export const XP_REWARDS = {
  task_low: 10,
  task_medium: 15,
  task_high: 25,
  task_urgent: 35,
  habit: 5,
  daily_login: 20,
  weekly_review: 50,
} as const;

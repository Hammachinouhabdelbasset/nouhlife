# Nouh LifeOS

## Overview

A production-grade all-in-one personal operating system — productivity, second brain, content studio, engineering workspace, finance tracker, habit system, goal machine, gamification engine, and analytics dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite, TailwindCSS, shadcn/ui, Recharts, Wouter, date-fns
- **Backend**: Express 5, Drizzle ORM
- **Database**: PostgreSQL (Replit built-in)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Modules / Pages

- `/` — Landing page (unauthenticated) / Dashboard redirect (authenticated)
- `/dashboard` — CEO command center overview
- `/tasks` — Task management with priority/status filters (awards XP on completion)
- `/projects` — Project board (engineering/content/business/personal)
- `/calendar` — Weekly calendar view with tasks and habit tracking
- `/planner` — Daily planner: MITs, energy level, reflection
- `/knowledge` — Knowledge vault: markdown notes by category
- `/content` — Content Planning Studio: pipeline from idea to published
- `/finance` — Finance tracker: income/expenses/budgets with charts
- `/habits` — Habit tracker: streaks, discipline score (awards XP on logging)
- `/goals` — Goals & OKRs by timeframe
- `/analytics` — Analytics dashboard: recharts charts for tasks, habits, XP, goals, finance
- `/settings` — Settings: theme switcher (5 themes), plan info, profile

## Gamification System

- **XP Formula**: level = floor(0.1 * sqrt(totalXP))
- **XP Awards**:
  - Task completed (low): 10 XP
  - Task completed (medium): 15 XP
  - Task completed (high): 25 XP
  - Task completed (urgent): 35 XP
  - Habit logged: 5 XP
  - Daily login: 20 XP (idempotent, once per day)
  - Weekly review: 50 XP (planned)
- **Streak tracking**: login streak with longest streak tracking
- **XP Bar**: shown in sidebar with level badge, progress bar, fire icon for streaks
- **Level-up animation**: pops in sidebar when level increases

## Theme System (5 Themes)

Stored in `localStorage`, applied via `data-theme` attribute + CSS variables:
- `dark-ceo` (default) — Deep blue/black with electric blue accent
- `hacker-green` — Terminal green on dark green background
- `neon-cyberpunk` — Pink/purple neon on near-black
- `minimal-light` — Clean white with indigo accent
- `focus-mode` — Warm dark brown with amber accent

Theme switcher in sidebar bottom + Settings page.

## Database Tables

- `notes` — Knowledge vault entries
- `tasks` — Task management
- `projects` — Project tracking
- `habits` — Habit definitions
- `habit_logs` — Daily habit completions
- `transactions` — Financial records
- `budgets` — Budget categories
- `content` — Content pipeline items
- `goals` — Goal tracking
- `daily_plans` — Daily planning entries
- `gamification` — XP, level, streaks per user (single row per user)

## Authentication

- Powered by **Clerk** (auto-provisioned, keys in env vars)
- Flows: Email/password, Google OAuth, Sign up, Sign in, Sign out
- Landing page at `/` for unauthenticated users → redirects to `/dashboard` when signed in
- All API routes protected with `requireAuth` middleware (filters by `userId`)
- All DB tables have `userId` column for full multi-tenant data isolation
- To manage users, view sign-ups, ban users, or enable/disable OAuth providers → use the **Auth pane** in the workspace toolbar
- Sessions managed by Clerk via secure httpOnly cookies

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
  - After codegen, manually fix `lib/api-zod/src/index.ts` to only have `export * from "./generated/api";` (Orval adds extra exports that cause duplicates)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Important Notes

- After running codegen, `lib/api-zod/src/index.ts` gets regenerated with duplicate exports. Fix it to only contain: `export * from "./generated/api";`
- The `lib/api-spec/orval.config.ts` has `schemas` option removed from the zod output to avoid duplicate type generation
- Gamification lib is at `artifacts/api-server/src/lib/gamification.ts` — used by tasks, habits, and gamification routes
- Theme hook at `artifacts/lifeos/src/hooks/useTheme.ts` — reads/writes localStorage
- XP bar component at `artifacts/lifeos/src/components/gamification/XPBar.tsx`

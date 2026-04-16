# Nouh LifeOS

## Overview

A production-grade all-in-one personal operating system — productivity, second brain, content studio, engineering workspace, finance tracker, habit system, and goal machine.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite, TailwindCSS, shadcn/ui, Recharts, Framer Motion, Wouter
- **Backend**: Express 5, Drizzle ORM
- **Database**: PostgreSQL (Replit built-in)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Modules / Pages

- `/` — Dashboard: CEO command center overview
- `/tasks` — Task management with priority/status filters
- `/projects` — Project board (engineering/content/business/personal)
- `/planner` — Daily planner: MITs, energy level, reflection
- `/knowledge` — Knowledge vault: markdown notes by category
- `/content` — Content Planning Studio: pipeline from idea to published
- `/finance` — Finance tracker: income/expenses/budgets with charts
- `/habits` — Habit tracker: streaks, discipline score
- `/goals` — Goals & OKRs by timeframe

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

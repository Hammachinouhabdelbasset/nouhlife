import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, transactionsTable, budgetsTable } from "@workspace/db";
import {
  CreateTransactionBody,
  UpdateTransactionBody,
  UpdateTransactionParams,
  DeleteTransactionParams,
  ListTransactionsQueryParams,
  CreateBudgetBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/finance/transactions", async (req, res): Promise<void> => {
  const query = ListTransactionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { type, category, month } = query.data;
  const conditions = [];
  if (type) conditions.push(eq(transactionsTable.type, type));
  if (category) conditions.push(eq(transactionsTable.category, category));

  let txns = conditions.length > 0
    ? await db.select().from(transactionsTable).where(and(...conditions)).orderBy(transactionsTable.date)
    : await db.select().from(transactionsTable).orderBy(transactionsTable.date);

  if (month) {
    txns = txns.filter((t) => t.date.startsWith(month));
  }

  res.json(txns.map(formatTransaction));
});

router.post("/finance/transactions", async (req, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [txn] = await db.insert(transactionsTable).values(parsed.data).returning();
  res.status(201).json(formatTransaction(txn));
});

router.put("/finance/transactions/:id", async (req, res): Promise<void> => {
  const params = UpdateTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [txn] = await db.update(transactionsTable).set(parsed.data).where(eq(transactionsTable.id, params.data.id)).returning();
  if (!txn) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  res.json(formatTransaction(txn));
});

router.delete("/finance/transactions/:id", async (req, res): Promise<void> => {
  const params = DeleteTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(transactionsTable).where(eq(transactionsTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/finance/summary", async (_req, res): Promise<void> => {
  const allTxns = await db.select().from(transactionsTable).orderBy(transactionsTable.date);
  const budgets = await db.select().from(budgetsTable);

  const totalIncome = allTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = allTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netWorth = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;

  // Group by month
  const monthlyMap: Record<string, { income: number; expenses: number }> = {};
  for (const txn of allTxns) {
    const m = txn.date.substring(0, 7);
    if (!monthlyMap[m]) monthlyMap[m] = { income: 0, expenses: 0 };
    if (txn.type === "income") monthlyMap[m].income += txn.amount;
    else monthlyMap[m].expenses += txn.amount;
  }
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      savings: data.income - data.expenses,
    }));

  // Expenses by category
  const expCatMap: Record<string, number> = {};
  for (const txn of allTxns.filter((t) => t.type === "expense")) {
    expCatMap[txn.category] = (expCatMap[txn.category] ?? 0) + txn.amount;
  }
  const expensesByCategory = Object.entries(expCatMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
  }));

  res.json({ netWorth, totalIncome, totalExpenses, savingsRate, monthlyData, expensesByCategory });
});

router.get("/finance/budgets", async (_req, res): Promise<void> => {
  const budgets = await db.select().from(budgetsTable);
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthTxns = await db.select().from(transactionsTable);
  const monthlyTxns = monthTxns.filter((t) => t.date.startsWith(currentMonth) && t.type === "expense");

  res.json(budgets.map((b) => {
    const spent = monthlyTxns.filter((t) => t.category === b.category).reduce((s, t) => s + t.amount, 0);
    return {
      id: b.id,
      category: b.category,
      limit: b.limit,
      spent,
      remaining: Math.max(0, b.limit - spent),
      period: b.period,
    };
  }));
});

router.post("/finance/budgets", async (req, res): Promise<void> => {
  const parsed = CreateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [budget] = await db.insert(budgetsTable).values(parsed.data).returning();
  res.status(201).json({
    id: budget.id,
    category: budget.category,
    limit: budget.limit,
    spent: 0,
    remaining: budget.limit,
    period: budget.period,
  });
});

function formatTransaction(t: typeof transactionsTable.$inferSelect) {
  return {
    id: t.id,
    title: t.title,
    amount: t.amount,
    type: t.type,
    category: t.category,
    date: t.date,
    note: t.note,
    createdAt: t.createdAt.toISOString(),
  };
}

export default router;

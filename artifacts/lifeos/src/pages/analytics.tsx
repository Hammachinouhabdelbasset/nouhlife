import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, CheckCircle2, Flame, Zap, DollarSign, Target } from "lucide-react";
import { format, subDays } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(url: string, token: string) {
  const res = await fetch(`${BASE}/api${url}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-lg p-2 shadow-lg text-xs">
        {label && <p className="font-semibold mb-1">{label}</p>}
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>{entry.name}: <strong>{entry.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { getToken } = useAuth();

  const { data: taskSummary } = useQuery({
    queryKey: ["tasks", "summary"],
    queryFn: async () => { const token = await getToken(); return apiFetch("/tasks/summary", token!); },
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => { const token = await getToken(); return apiFetch("/tasks", token!); },
  });

  const { data: habitStreaks } = useQuery({
    queryKey: ["habits", "streaks"],
    queryFn: async () => { const token = await getToken(); return apiFetch("/habits/streaks", token!); },
  });

  const { data: gam } = useQuery({
    queryKey: ["gamification"],
    queryFn: async () => { const token = await getToken(); return apiFetch("/gamification/me", token!); },
  });

  const { data: financeData } = useQuery({
    queryKey: ["finance", "summary"],
    queryFn: async () => { const token = await getToken(); return apiFetch("/finance/summary", token!); },
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => { const token = await getToken(); return apiFetch("/goals", token!); },
  });

  const taskStatusData = taskSummary?.byStatus?.map((s: { status: string; count: number }) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1).replace("_", " "),
    value: s.count,
  })) ?? [];

  const taskPriorityData = taskSummary?.byPriority?.map((p: { priority: string; count: number }) => ({
    name: p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
    value: p.count,
  })) ?? [];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, "yyyy-MM-dd");
    const dayTasks = allTasks.filter((t: { dueDate?: string; completedAt?: string }) =>
      t.completedAt && t.completedAt.startsWith(key)
    );
    return { day: format(d, "EEE"), completed: dayTasks.length };
  });

  const habitData = habitStreaks?.habits?.slice(0, 8).map((h: { name: string; currentStreak: number }) => ({
    name: h.name.length > 12 ? h.name.slice(0, 12) + "…" : h.name,
    streak: h.currentStreak,
  })) ?? [];

  const goalsData = goals.map((g: { title: string; progress: number; targetValue?: number }) => ({
    name: g.title.length > 14 ? g.title.slice(0, 14) + "…" : g.title,
    progress: g.progress ?? 0,
  })).slice(0, 6);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6" /> Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your productivity & progress at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle2 className="w-4 h-4 text-green-400" /></div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Completion Rate</span>
            </div>
            <p className="text-3xl font-bold">{Math.round((taskSummary?.completionRate ?? 0) * 100)}%</p>
            <p className="text-xs text-muted-foreground mt-1">{taskSummary?.total ?? 0} total tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-500/10 rounded-lg"><Flame className="w-4 h-4 text-orange-400" /></div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Login Streak</span>
            </div>
            <p className="text-3xl font-bold">{gam?.loginStreak ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg"><Zap className="w-4 h-4 text-primary" /></div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total XP</span>
            </div>
            <p className="text-3xl font-bold">{(gam?.xp ?? 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Level {gam?.level ?? 1}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg"><Target className="w-4 h-4 text-purple-400" /></div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Habit Score</span>
            </div>
            <p className="text-3xl font-bold">{habitStreaks?.disciplineScore ?? 0}%</p>
            <p className="text-xs text-muted-foreground mt-1">{habitStreaks?.completedTodayCount ?? 0}/{habitStreaks?.totalHabits ?? 0} today</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task Completions this week */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tasks Completed (Last 7 Days)</CardTitle>
            <CardDescription>Daily completions this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="hsl(var(--chart-1))" fill="url(#colorComp)" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Status Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Task Status Breakdown</CardTitle>
            <CardDescription>Distribution of all tasks by status</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {taskStatusData.map((_: unknown, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Habit Streaks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Habit Streaks</CardTitle>
            <CardDescription>Current streak per habit</CardDescription>
          </CardHeader>
          <CardContent>
            {habitData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No habits tracked yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={habitData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="streak" name="Days" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Goals Progress</CardTitle>
            <CardDescription>% completion per goal</CardDescription>
          </CardHeader>
          <CardContent>
            {goalsData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No goals set yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={goalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="progress" name="Progress %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Finance + Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Finance Summary */}
        {financeData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Finance This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-green-400">{(financeData.totalIncome ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Income (DZD)</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-400">{(financeData.totalExpenses ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Expenses (DZD)</p>
                </div>
                <div>
                  <p className={`text-xl font-bold ${(financeData.balance ?? 0) >= 0 ? "text-primary" : "text-red-400"}`}>
                    {(financeData.balance ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Balance (DZD)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Priority Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Priority Distribution</CardTitle>
            <CardDescription>Tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={taskPriorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Tasks" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

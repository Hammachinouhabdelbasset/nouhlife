import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, isPast, parseISO } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(url: string, token: string) {
  const res = await fetch(`${BASE}/api${url}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/20 border-red-500/50 text-red-300",
  high: "bg-orange-500/20 border-orange-500/50 text-orange-300",
  medium: "bg-blue-500/20 border-blue-500/50 text-blue-300",
  low: "bg-muted border-border text-muted-foreground",
};

export default function Calendar() {
  const { getToken } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", "calendar"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/tasks", token!);
    },
  });

  const { data: habits = [] } = useQuery({
    queryKey: ["habits", "calendar"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/habits", token!);
    },
  });

  const tasksByDay = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      if (task.dueDate) {
        const key = task.dueDate;
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    }
    return map;
  }, [tasks]);

  const totalTasksThisWeek = days.reduce((acc, day) => {
    const key = format(day, "yyyy-MM-dd");
    return acc + (tasksByDay[key]?.length ?? 0);
  }, 0);

  const completedThisWeek = days.reduce((acc, day) => {
    const key = format(day, "yyyy-MM-dd");
    return acc + (tasksByDay[key]?.filter((t: { status: string }) => t.status === "done").length ?? 0);
  }, 0);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" /> Calendar
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Week of {format(weekStart, "MMMM d")} — {format(addDays(weekStart, 6), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >Week</button>
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >Month</button>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentWeek(new Date())}>Today</Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="py-3">
          <CardContent className="pt-0 text-center">
            <p className="text-2xl font-bold">{totalTasksThisWeek}</p>
            <p className="text-xs text-muted-foreground">Tasks This Week</p>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="pt-0 text-center">
            <p className="text-2xl font-bold text-green-400">{completedThisWeek}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="pt-0 text-center">
            <p className="text-2xl font-bold text-primary">{habits.filter((h: { completedToday: boolean }) => h.completedToday).length}/{habits.length}</p>
            <p className="text-xs text-muted-foreground">Habits Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Week Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDay[key] ?? [];
              const hasOverdue = dayTasks.some((t: { status: string; dueDate?: string }) => t.status !== "done" && isPast(parseISO(t.dueDate!)));

              return (
                <div
                  key={key}
                  className={`p-2 text-center border-r last:border-r-0 ${isToday(day) ? "bg-primary/10" : ""}`}
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{format(day, "EEE")}</p>
                  <p className={`text-lg font-bold mt-0.5 ${isToday(day) ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </p>
                  {dayTasks.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-1">
                      {hasOverdue && <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day columns with tasks */}
          <div className="grid grid-cols-7 min-h-[400px]">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDay[key] ?? [];

              return (
                <div
                  key={key}
                  className={`border-r last:border-r-0 p-2 space-y-1.5 ${isToday(day) ? "bg-primary/5" : ""}`}
                >
                  {/* Habits row for today */}
                  {isToday(day) && habits.length > 0 && (
                    <div className="mb-2 pb-2 border-b border-dashed">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Habits</p>
                      {habits.slice(0, 4).map((h: { id: string; name: string; completedToday: boolean; color?: string }) => (
                        <div key={h.id} className="flex items-center gap-1 mb-0.5">
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0`}
                            style={{ backgroundColor: h.completedToday ? (h.color ?? "#6366f1") : "#555" }}
                          />
                          <span className={`text-[10px] truncate ${h.completedToday ? "line-through text-muted-foreground" : ""}`}>{h.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tasks */}
                  {dayTasks.length === 0 && (
                    <div className="text-[10px] text-muted-foreground/40 text-center pt-4">—</div>
                  )}
                  {dayTasks.map((task: { id: string; title: string; status: string; priority: string; dueDate?: string }) => (
                    <div
                      key={task.id}
                      className={`text-[11px] px-1.5 py-1 rounded border ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium} ${task.status === "done" ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start gap-1">
                        {task.status === "done" ? (
                          <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-green-400" />
                        ) : isPast(parseISO(task.dueDate!)) ? (
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-red-400" />
                        ) : (
                          <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`leading-tight ${task.status === "done" ? "line-through" : ""}`}>{task.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* No due date tasks */}
      {tasks.filter((t: { dueDate?: string; status: string }) => !t.dueDate && t.status !== "done" && t.status !== "cancelled").length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Without Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tasks.filter((t: { dueDate?: string; status: string }) => !t.dueDate && t.status !== "done" && t.status !== "cancelled").slice(0, 12).map((task: { id: string; title: string; priority: string }) => (
                <Badge key={task.id} variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority] ?? ""}`}>
                  {task.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

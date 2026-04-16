import { useState } from "react";
import {
  useListGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useGetGoalsOverview,
  getListGoalsQueryKey,
  getGetGoalsOverviewQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Target, CheckCircle2, Clock, MoreVertical, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export default function Goals() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [timeframeFilter, setTimeframeFilter] = useState("all");

  const { data: goals, isLoading: loadingGoals } = useListGoals();
  const { data: overview, isLoading: loadingOverview } = useGetGoalsOverview();

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const handleDelete = (id: number) => {
    deleteGoal.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetGoalsOverviewQueryKey() });
      }
    });
  };

  const updateProgress = (id: number, progress: number) => {
    updateGoal.mutate({ id, data: { progress } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetGoalsOverviewQueryKey() });
      }
    });
  };

  const markCompleted = (id: number) => {
    updateGoal.mutate({ id, data: { status: "completed", progress: 100 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetGoalsOverviewQueryKey() });
      }
    });
  };

  if (loadingGoals || loadingOverview) {
    return <div className="p-8">Loading goals...</div>;
  }

  const filteredGoals = goals?.filter(g => timeframeFilter === "all" || g.timeframe === timeframeFilter);

  const timeframes = ["weekly", "monthly", "quarterly", "yearly", "vision"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals & Objectives</h1>
          <p className="text-muted-foreground">Design your future, execute today.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Set Goal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Goal</DialogTitle>
            </DialogHeader>
            <GoalForm onSubmit={(data) => {
              createGoal.mutate({ data }, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
                  queryClient.invalidateQueries({ queryKey: getGetGoalsOverviewQueryKey() });
                  setIsCreateOpen(false);
                }
              });
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {overview && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                <h3 className="text-3xl font-bold text-primary">{overview.totalActive}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <h3 className="text-3xl font-bold text-emerald-500">{overview.totalCompleted}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Progress</p>
                <h3 className="text-3xl font-bold">{overview.averageProgress.toFixed(0)}%</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant={timeframeFilter === "all" ? "default" : "outline"} onClick={() => setTimeframeFilter("all")} size="sm">All</Button>
        {timeframes.map(tf => (
          <Button key={tf} variant={timeframeFilter === tf ? "default" : "outline"} onClick={() => setTimeframeFilter(tf)} size="sm" className="capitalize">{tf}</Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGoals?.map((goal) => (
          <Card key={goal.id} className={`flex flex-col ${goal.status === "completed" ? "opacity-70" : ""}`}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2 uppercase tracking-wider text-[10px]">{goal.timeframe}</Badge>
                  <CardTitle className="text-xl leading-tight">{goal.title}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2 -mt-2"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {goal.status !== "completed" && (
                      <DropdownMenuItem onClick={() => markCompleted(goal.id)} className="text-emerald-500">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Completed
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDelete(goal.id)} className="text-destructive">
                      <Trash className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {goal.description && (
                <p className="text-sm text-muted-foreground mb-6 line-clamp-3">{goal.description}</p>
              )}
              <div className="space-y-2 mt-auto">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-bold">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className={`h-2 ${goal.status === "completed" ? "opacity-50" : ""}`} />
                {goal.status !== "completed" && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="h-6 text-xs flex-1" onClick={() => updateProgress(goal.id, Math.max(0, goal.progress - 10))}>-10%</Button>
                    <Button variant="outline" size="sm" className="h-6 text-xs flex-1" onClick={() => updateProgress(goal.id, Math.min(100, goal.progress + 10))}>+10%</Button>
                  </div>
                )}
              </div>
            </CardContent>
            {goal.targetDate && (
              <CardFooter className="pt-4 border-t text-xs text-muted-foreground bg-muted/20">
                Target: {format(new Date(goal.targetDate), "MMMM d, yyyy")}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function GoalForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeframe, setTimeframe] = useState("quarterly");
  const [targetDate, setTargetDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSubmit({
      title,
      description,
      timeframe,
      targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Goal</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Timeframe</label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue className="capitalize" />
            </SelectTrigger>
            <SelectContent>
              {["weekly", "monthly", "quarterly", "yearly", "vision"].map(tf => (
                <SelectItem key={tf} value={tf} className="capitalize">{tf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Date (optional)</label>
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
      </div>
      <Button type="submit" className="w-full">Set Goal</Button>
    </form>
  );
}

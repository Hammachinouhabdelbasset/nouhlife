import { useState } from "react";
import {
  useListHabits,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useLogHabit,
  useGetHabitStreaks,
  getListHabitsQueryKey,
  getGetHabitStreaksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Flame, Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function Habits() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: habits, isLoading: loadingHabits } = useListHabits();
  const { data: streaks, isLoading: loadingStreaks } = useGetHabitStreaks();

  const createHabit = useCreateHabit();
  const logHabit = useLogHabit();
  const deleteHabit = useDeleteHabit();

  const handleLog = (habitId: number) => {
    logHabit.mutate(
      { id: habitId, data: { date: new Date().toISOString() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetHabitStreaksQueryKey() });
        },
      }
    );
  };

  if (loadingHabits || loadingStreaks) {
    return <div className="p-8">Loading habits...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits & Discipline</h1>
          <p className="text-muted-foreground">Consistency is the ultimate competitive advantage.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Habit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Habit</DialogTitle>
            </DialogHeader>
            <HabitForm onSubmit={(data) => {
              createHabit.mutate({ data }, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
                  queryClient.invalidateQueries({ queryKey: getGetHabitStreaksQueryKey() });
                  setIsCreateOpen(false);
                }
              });
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {streaks && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Discipline Score</p>
                  <h3 className="text-3xl font-bold text-primary">{streaks.disciplineScore}%</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-muted rounded-full">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                  <h3 className="text-3xl font-bold">{streaks.completedTodayCount} / {streaks.totalHabits}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500/20 rounded-full">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Longest Streak</p>
                  <h3 className="text-3xl font-bold">{streaks.longestStreak} days</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits?.map((habit) => (
          <Card key={habit.id} className={`overflow-hidden transition-all ${habit.completedToday ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{habit.name}</h3>
                  <p className="text-sm text-muted-foreground">{habit.category}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center text-orange-500 font-bold">
                    <Flame className="h-4 w-4 mr-1" />
                    {habit.currentStreak}
                  </div>
                  <span className="text-xs text-muted-foreground">streak</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant={habit.completedToday ? "secondary" : "default"}
                onClick={() => !habit.completedToday && handleLog(habit.id)}
                disabled={habit.completedToday}
              >
                {habit.completedToday ? (
                  <><Check className="mr-2 h-4 w-4" /> Completed Today</>
                ) : (
                  "Log Progress"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function HabitForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("health");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({
      name,
      category,
      frequency: "daily",
      targetCount: 1
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Habit Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="productivity">Productivity</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Create Habit</Button>
    </form>
  );
}

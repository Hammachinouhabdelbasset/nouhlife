import { useState } from "react";
import {
  useListDailyPlans,
  useCreateDailyPlan,
  useGetDailyPlan,
  getListDailyPlansQueryKey,
  getGetDailyPlanQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, Battery, Target, Plus, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function Planner() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date>(new Date());
  
  const dateStr = format(date, "yyyy-MM-dd");
  const { data: plan, isLoading } = useGetDailyPlan(dateStr, {
    query: {
      enabled: !!dateStr,
      queryKey: getGetDailyPlanQueryKey(dateStr),
      retry: false // It will return 404 if not found
    }
  });

  const createPlan = useCreateDailyPlan();

  if (isLoading) {
    return <div className="p-8">Loading daily plan...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Planner</h1>
          <p className="text-muted-foreground">Focus on what matters today.</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {plan ? (
        <DailyPlanView plan={plan} dateStr={dateStr} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <CalendarIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No plan for {format(date, "MMMM d, yyyy")}</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start your day with intention. Define your most important tasks and set your focus.
            </p>
            <Button onClick={() => {
              createPlan.mutate({
                data: {
                  date: dateStr,
                  mits: [],
                  intention: "",
                  energyLevel: 5,
                  wins: [],
                  reflection: ""
                }
              }, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: getGetDailyPlanQueryKey(dateStr) });
                }
              });
            }}>
              Create Daily Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DailyPlanView({ plan, dateStr }: { plan: any, dateStr: string }) {
  const queryClient = useQueryClient();
  const createPlan = useCreateDailyPlan(); // The backend likely uses upsert logic or we should use update if it exists. Based on API, we have useCreateDailyPlan which probably handles updates/upserts or there is a specific update endpoint. Let's assume create works as an upsert or we just use it for initial creation.
  
  // Note: The API spec only lists useCreateDailyPlan and useGetDailyPlan. We'll use create as update/upsert.
  const handleSave = (data: any) => {
    createPlan.mutate({
      data: {
        date: dateStr,
        ...data
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDailyPlanQueryKey(dateStr) });
      }
    });
  };

  const [mits, setMits] = useState<string[]>(plan.mits || ["", "", ""]);
  const [intention, setIntention] = useState(plan.intention || "");
  const [energyLevel, setEnergyLevel] = useState(plan.energyLevel || 5);
  const [reflection, setReflection] = useState(plan.reflection || "");
  const [wins, setWins] = useState<string[]>(plan.wins || ["", "", ""]);

  const updateMit = (index: number, value: string) => {
    const newMits = [...mits];
    newMits[index] = value;
    setMits(newMits);
  };

  const updateWin = (index: number, value: string) => {
    const newWins = [...wins];
    newWins[index] = value;
    setWins(newWins);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Daily Intention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input 
              placeholder="What is your focus for today?" 
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              onBlur={() => handleSave({ mits, intention, energyLevel, wins, reflection })}
              className="text-lg font-medium"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Most Important Tasks (MITs)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {i + 1}
                </div>
                <Input 
                  placeholder={`Important task ${i + 1}`}
                  value={mits[i] || ""}
                  onChange={(e) => updateMit(i, e.target.value)}
                  onBlur={() => handleSave({ mits, intention, energyLevel, wins, reflection })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5 text-primary" />
              Energy Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center px-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setEnergyLevel(level);
                    handleSave({ mits, intention, energyLevel: level, wins, reflection });
                  }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all",
                    energyLevel === level 
                      ? "bg-primary text-primary-foreground font-bold scale-110 shadow-md" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              Wins & Reflection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Wins</label>
              {[0, 1, 2].map((i) => (
                <Input 
                  key={i}
                  placeholder={`Win ${i + 1}`}
                  value={wins[i] || ""}
                  onChange={(e) => updateWin(i, e.target.value)}
                  onBlur={() => handleSave({ mits, intention, energyLevel, wins, reflection })}
                  className="bg-primary/5 border-primary/20"
                />
              ))}
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">End of Day Reflection</label>
              <Textarea 
                placeholder="How did today go?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                onBlur={() => handleSave({ mits, intention, energyLevel, wins, reflection })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

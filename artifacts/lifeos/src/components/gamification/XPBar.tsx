import { useEffect, useState } from "react";
import { Zap, Flame, Star } from "lucide-react";
import { useGamification, useDailyLogin } from "@/hooks/useGamification";

interface XPBarProps {
  collapsed?: boolean;
}

export function XPBar({ collapsed }: XPBarProps) {
  const { data: gam, isLoading } = useGamification();
  const dailyLogin = useDailyLogin();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState<number | null>(null);

  useEffect(() => {
    dailyLogin.mutate(undefined, {
      onSuccess: (data) => {
        if (!data.alreadyAwarded && data.leveledUp) {
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 3000);
        }
      },
    });
  }, []);

  useEffect(() => {
    if (gam?.level && prevLevel !== null && gam.level > prevLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    if (gam?.level) setPrevLevel(gam.level);
  }, [gam?.level]);

  if (isLoading || !gam) {
    return (
      <div className="px-3 py-2">
        <div className="h-2 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const progressPct = Math.round((gam.levelProgress ?? 0) * 100);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 px-2 py-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold">
          {gam.level}
        </div>
        <div className="w-6 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary xp-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-1.5 relative">
      {showLevelUp && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full animate-level-up-pop z-50 whitespace-nowrap shadow-lg">
          🎉 Level Up! → {gam.level}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-primary/15 text-primary px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3" />
            <span className="text-xs font-bold">Lvl {gam.level}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-medium">{gam.xp.toLocaleString()} XP</span>
          </div>
        </div>
        {gam.loginStreak > 0 && (
          <div className="flex items-center gap-1 text-orange-400">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{gam.loginStreak}</span>
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full xp-bar-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{progressPct}%</span>
          <span>{gam.xpToNextLevel} XP to next level</span>
        </div>
      </div>
    </div>
  );
}

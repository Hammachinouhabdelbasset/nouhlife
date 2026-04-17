import { useTheme, THEMES } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Palette, User, Shield, Zap, Crown, Infinity, Star } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useUserPlan } from "@/hooks/useUserPlan";

const PLAN_COLORS: Record<string, string> = {
  BETA: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  ELITE: "text-purple-400 border-purple-400/50 bg-purple-400/10",
  PRO: "text-blue-400 border-blue-400/50 bg-blue-400/10",
  FREE: "text-muted-foreground border-border bg-muted/30",
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  BETA: <Crown className="w-4 h-4 text-yellow-400" />,
  ELITE: <Star className="w-4 h-4 text-purple-400" />,
  PRO: <Zap className="w-4 h-4 text-blue-400" />,
  FREE: <Shield className="w-4 h-4" />,
};

export default function Settings() {
  const { theme, setTheme, themes } = useTheme();
  const { data: gam } = useGamification();
  const { data: me, isLoading: meLoading } = useUserPlan();

  const plan = me?.plan ?? "FREE";
  const isAdmin = me?.isAdmin ?? false;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your LifeOS experience</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">GOD MODE</span>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <Card className={isAdmin ? "border-yellow-400/30 bg-yellow-400/5" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {me?.imageUrl && (
              <img
                src={me.imageUrl}
                alt="Avatar"
                className={`w-14 h-14 rounded-full border-2 ${isAdmin ? "border-yellow-400/60" : "border-primary/30"}`}
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{me?.name ?? "Loading..."}</p>
                {isAdmin && <Crown className="w-4 h-4 text-yellow-400" />}
              </div>
              <p className="text-sm text-muted-foreground">{me?.email ?? ""}</p>
              {isAdmin && (
                <p className="text-xs text-yellow-400 mt-0.5">Super Admin · Developer Account</p>
              )}
            </div>
          </div>

          {gam && (
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`gap-1 ${PLAN_COLORS[plan]}`}
              >
                {PLAN_ICONS[plan]}
                {plan} Plan
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" /> Level {gam.level}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                {gam.xp.toLocaleString()} XP total
              </Badge>
              <Badge variant="secondary" className="gap-1">
                🔥 {gam.loginStreak} day streak
              </Badge>
              <Badge variant="secondary" className="gap-1">
                ✅ {gam.totalTasksDone} tasks done
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Panel — only shown for admin */}
      {isAdmin && (
        <Card className="border-yellow-400/30 bg-gradient-to-br from-yellow-400/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400">BETA Access — All Features Unlocked</span>
            </CardTitle>
            <CardDescription>
              Developer account with full access to every feature, no limits, no expiry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(me?.features ?? {}).map(([key, enabled]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 text-xs"
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${enabled ? "bg-green-500/20" : "bg-red-500/20"}`}>
                    <Check className={`w-2.5 h-2.5 ${enabled ? "text-green-400" : "text-red-400"}`} />
                  </div>
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-muted/30">
                <Infinity className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                <p className="text-xs text-muted-foreground">Unlimited Tasks</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <Infinity className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                <p className="text-xs text-muted-foreground">Unlimited Habits</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <Crown className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="w-4 h-4" /> Theme
          </CardTitle>
          <CardDescription>Choose your visual style. Changes apply instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all hover:border-primary/60 ${
                  theme === t.id ? "border-primary" : "border-border"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 shadow-lg"
                  style={{ background: t.preview }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.id}</p>
                </div>
                {theme === t.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan Section — only shown for non-admin */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-4 h-4" /> Subscription Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div>
                <p className="font-semibold text-lg">Free Plan</p>
                <p className="text-sm text-muted-foreground">Basic access to LifeOS features</p>
              </div>
              <Badge>Current</Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">PRO</p>
                  <Badge variant="outline" className="text-primary border-primary">500 DZD/mo</Badge>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Unlimited tasks & habits</li>
                  <li>✓ Finance tracker</li>
                  <li>✓ Content studio</li>
                  <li>✓ Analytics</li>
                  <li>✓ All themes</li>
                </ul>
                <Button size="sm" className="w-full" variant="default">Upgrade to PRO</Button>
              </div>

              <div className="p-4 rounded-lg border-2 border-yellow-500/30 bg-yellow-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">ELITE</p>
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">900 DZD/mo</Badge>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Everything in PRO</li>
                  <li>✓ Engineering lab</li>
                  <li>✓ Priority support</li>
                  <li>✓ Advanced analytics</li>
                  <li>✓ Beta features</li>
                </ul>
                <Button size="sm" className="w-full" variant="outline">Upgrade to ELITE</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About LifeOS</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>Version 2.0.0 — Production SaaS Build</p>
          <p>Built for builders, engineers, creators, and entrepreneurs.</p>
          {isAdmin ? (
            <p className="text-yellow-400 text-xs mt-2">👑 Developer build — All features unlocked for <strong>nouhhammachi@gmail.com</strong></p>
          ) : (
            <p className="text-xs mt-2">🇩🇿 Made with dedication. Competitor benchmark: Notion + Todoist + Duolingo.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

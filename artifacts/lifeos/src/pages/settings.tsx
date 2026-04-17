import { useTheme, THEMES } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/react";
import { Check, Palette, User, Shield, Zap } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";

export default function Settings() {
  const { theme, setTheme, themes } = useTheme();
  const { user } = useUser();
  const { data: gam } = useGamification();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your LifeOS experience</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {user?.imageUrl && (
              <img src={user.imageUrl} alt="Avatar" className="w-14 h-14 rounded-full border-2 border-primary/30" />
            )}
            <div>
              <p className="font-semibold">{user?.fullName ?? user?.username ?? "Anonymous"}</p>
              <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          {gam && (
            <div className="flex gap-3 flex-wrap">
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

      {/* Plan Section */}
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

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About LifeOS</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>Version 2.0.0 — Production SaaS Build</p>
          <p>Built for builders, engineers, creators, and entrepreneurs.</p>
          <p className="text-xs mt-2">🇩🇿 Made with dedication. Competitor benchmark: Notion + Todoist + Duolingo.</p>
        </CardContent>
      </Card>
    </div>
  );
}

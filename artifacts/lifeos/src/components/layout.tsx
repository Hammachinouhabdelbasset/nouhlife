import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  CalendarDays,
  BookOpen,
  PenTool,
  Wallet,
  Activity,
  Target,
  Menu,
  LogOut,
  ChevronDown,
  BarChart3,
  CalendarRange,
  Settings,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { XPBar } from "@/components/gamification/XPBar";
import { useTheme, THEMES } from "@/hooks/useTheme";
import type { ThemeId } from "@/hooks/useTheme";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Calendar", href: "/calendar", icon: CalendarRange },
  { name: "Planner", href: "/planner", icon: CalendarDays },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
  { name: "Content", href: "/content", icon: PenTool },
  { name: "Finance", href: "/finance", icon: Wallet },
  { name: "Habits", href: "/habits", icon: Activity },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const bottomNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

const THEME_LABELS: Record<ThemeId, string> = {
  "dark-ceo": "Dark CEO",
  "hacker-green": "Hacker Green",
  "neon-cyberpunk": "Neon Cyberpunk",
  "minimal-light": "Minimal Light",
  "focus-mode": "Focus Mode",
};

function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors rounded-md hover:bg-sidebar-accent/50 w-full">
          <Palette className="w-3.5 h-3.5" />
          <span className="truncate">{THEME_LABELS[theme]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-44">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id as ThemeId)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.preview }} />
            <span className="text-xs">{t.label}</span>
            {theme === t.id && <span className="ml-auto text-primary text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserProfileButton() {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) return null;

  const initials = (user.fullName || user.username || user.emailAddresses[0]?.emailAddress || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayName = user.fullName || user.username || user.emailAddresses[0]?.emailAddress || "User";
  const email = user.primaryEmailAddress?.emailAddress || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-sidebar-accent/50 transition-colors text-left">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-sidebar-foreground truncate">{displayName}</div>
            <div className="text-xs text-sidebar-foreground/50 truncate">{email}</div>
          </div>
          <ChevronDown className="h-3 w-3 text-sidebar-foreground/40 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-52">
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium truncate">{displayName}</div>
          <div className="text-xs text-muted-foreground truncate">{email}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: "/" })}
          className="text-red-400 focus:text-red-400 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarNav({ setOpen }: { setOpen?: (v: boolean) => void }) {
  const [location] = useLocation();

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-5 pb-3">
        <h1 className="text-lg font-bold tracking-tight text-primary">Nouh LifeOS</h1>
        <p className="text-[10px] text-sidebar-foreground/40 mt-0.5">Your Second Brain</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
          return (
            <Link key={item.name} href={item.href} className="block">
              <span
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
                onClick={() => setOpen?.(false)}
              >
                <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Gamification XP Bar */}
      <div className="border-t border-sidebar-border">
        <XPBar />
      </div>

      {/* Theme switcher */}
      <div className="px-3 py-1 border-t border-sidebar-border">
        <ThemeSwitcher />
      </div>

      {/* Bottom nav */}
      <div className="px-3 py-1 border-t border-sidebar-border">
        {bottomNav.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href} className="block">
              <span
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
                onClick={() => setOpen?.(false)}
              >
                <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-sidebar-border">
        <UserProfileButton />
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div
      className={`flex h-screen w-full bg-background overflow-hidden ${theme !== "minimal-light" ? "dark" : ""}`}
      data-theme={theme}
    >
      <div className="hidden md:flex md:w-60 md:flex-col flex-shrink-0">
        <SidebarNav />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SidebarNav setOpen={setOpen} />
            </SheetContent>
          </Sheet>
          <h1 className="text-base font-semibold text-primary">Nouh LifeOS</h1>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

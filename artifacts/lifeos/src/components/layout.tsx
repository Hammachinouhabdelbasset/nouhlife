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
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Planner", href: "/planner", icon: CalendarDays },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
  { name: "Content", href: "/content", icon: PenTool },
  { name: "Finance", href: "/finance", icon: Wallet },
  { name: "Habits", href: "/habits", icon: Activity },
  { name: "Goals", href: "/goals", icon: Target },
];

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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-primary">Nouh LifeOS</h1>
      </div>
      <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
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
                onClick={() => setOpen(false)}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-sidebar-border mt-auto">
        <UserProfileButton />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden dark">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <SidebarContent />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold text-primary">Nouh LifeOS</h1>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

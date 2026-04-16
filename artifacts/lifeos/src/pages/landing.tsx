import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, CheckSquare, FolderKanban, BookOpen, PenTool,
  Wallet, Activity, Target, Zap, Shield, ArrowRight, Star, CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: LayoutDashboard, title: "CEO Dashboard", description: "Your command center. Discipline score, net worth, active projects — all at a glance.", color: "text-blue-400" },
  { icon: CheckSquare, title: "Task Engine", description: "Priority matrix with urgent/high/medium/low. Kill tasks, not time.", color: "text-green-400" },
  { icon: FolderKanban, title: "Project Board", description: "Engineering, content, business — track every initiative with progress and deadlines.", color: "text-purple-400" },
  { icon: CalendarDays, title: "Daily Planner", description: "Set your MITs, intention, and energy level every morning. Review wins at night.", color: "text-orange-400" },
  { icon: BookOpen, title: "Knowledge Vault", description: "Second brain for engineers. Notes, code snippets, ideas — all searchable.", color: "text-cyan-400" },
  { icon: PenTool, title: "Content Studio", description: "Pipeline from raw idea to published. Track hooks, scripts, and publish dates.", color: "text-pink-400" },
  { icon: Wallet, title: "Finance Tracker", description: "Income, expenses, budgets, and net worth. Know your numbers every day.", color: "text-yellow-400" },
  { icon: Activity, title: "Habit Tracker", description: "Daily streak tracking with discipline score. Build systems, not willpower.", color: "text-red-400" },
  { icon: Target, title: "Goals & OKRs", description: "Weekly, monthly, quarterly, yearly — structure your ambitions at every timeframe.", color: "text-indigo-400" },
];

const stats = [
  { value: "9", label: "Modules" },
  { value: "100%", label: "Data Yours" },
  { value: "0", label: "Distractions" },
  { value: "∞", label: "Potential" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground dark overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight text-primary">Nouh LifeOS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
              <Star className="w-3.5 h-3.5" />
              Built for engineers who build empires
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Your personal{" "}
              <span className="text-primary bg-clip-text">operating system</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              One workspace for your tasks, projects, habits, finances, content, and goals.
              Run your life like a startup — with full data ownership.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 text-base">
                  Start building your OS
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg" className="h-12 text-base px-8 border-border/60">
                  Sign in
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* App preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/40">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/60 bg-muted/20">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-4">
                  <div className="h-5 rounded-md bg-muted/40 max-w-xs mx-auto flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">lifeos.replit.app</span>
                  </div>
                </div>
              </div>
              <div className="flex h-64 md:h-96">
                <div className="w-48 border-r border-border/60 bg-card p-4 hidden md:block">
                  <div className="text-primary font-semibold text-sm mb-4">Nouh LifeOS</div>
                  {["Dashboard", "Tasks", "Projects", "Habits", "Finance"].map((item) => (
                    <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs mb-1 ${item === "Dashboard" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
                      <div className="w-3 h-3 rounded-sm bg-current opacity-60" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-6 bg-card">
                  <div className="text-lg font-bold mb-1">Command Center</div>
                  <div className="text-xs text-muted-foreground mb-4">Welcome back, CEO.</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Discipline Score", value: "87%" },
                      { label: "Tasks Today", value: "5" },
                      { label: "Net Worth", value: "$12,480" },
                      { label: "Active Projects", value: "4" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-muted/30 rounded-lg p-3 border border-border/40">
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                        <div className="text-base font-bold text-primary mt-1">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted/20 rounded-lg p-3 border border-border/40">
                    <div className="text-xs font-medium mb-2">Recent Activity</div>
                    {["Completed: Motor Controller PR merged", "Note: FreeRTOS task priorities", "Published: STM32 tutorial"].map((a) => (
                      <div key={a} className="text-xs text-muted-foreground py-1 border-b border-border/20 last:border-0">{a}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-border/40 bg-muted/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything in one place</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Nine deeply integrated modules. No context switching. No separate tools.
              Your entire life stack, unified.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group p-5 rounded-xl border border-border/60 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-200"
              >
                <div className={`mb-3 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security / Trust */}
      <section className="py-16 px-6 bg-muted/10 border-t border-border/40">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="font-semibold text-sm mb-1">Data isolation</div>
            <div className="text-xs text-muted-foreground">Every workspace is fully isolated. Your data belongs to you.</div>
          </div>
          <div>
            <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="font-semibold text-sm mb-1">Fast & responsive</div>
            <div className="text-xs text-muted-foreground">Built on a modern stack. Instant feedback, no lag.</div>
          </div>
          <div>
            <Star className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="font-semibold text-sm mb-1">Made for builders</div>
            <div className="text-xs text-muted-foreground">Designed by an engineer, for engineers and creators.</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to run your life like a CEO?</h2>
          <p className="text-muted-foreground mb-8">Start for free. No credit card required.</p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 h-12 text-base">
              Get started — it's free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-primary">Nouh LifeOS</span>
          </div>
          <div className="text-xs text-muted-foreground">Built to help engineers build empires.</div>
        </div>
      </footer>
    </div>
  );
}

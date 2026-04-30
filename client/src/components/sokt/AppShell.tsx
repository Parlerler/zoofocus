import { Link, useLocation } from "@tanstack/react-router";
import { MessageSquarePlus, MessageSquareDashed, Check } from "lucide-react";
import { ModelChip } from "./ModelChip";
import { SettingsDialog } from "./SettingsDialog";
import { SystemStats } from "./SystemStats";
import { Logo } from "./Logo";

const tabs = [
  { to: "/chat", label: "Chat" },
  { to: "/audio", label: "Audio" },
  { to: "/image", label: "Image" },
  { to: "/workflow", label: "Workflow" },
  { to: "/prompts", label: "Prompt Lab" },
] as const;

export function AppShell({
  children,
  modelActive = false,
  leftSlot,
  onNewChat,
  temporary = false,
  onToggleTemporary,
}: {
  children: React.ReactNode;
  modelActive?: boolean;
  leftSlot?: React.ReactNode;
  onNewChat?: () => void;
  temporary?: boolean;
  onToggleTemporary?: () => void;
}) {
  const { pathname } = useLocation();
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <header className="relative z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-6 h-14 border-b border-border/40">
        <div className="flex items-center gap-2 min-w-0">
          {leftSlot}
          <Logo className="mr-1" />
          <button
            onClick={onNewChat}
            aria-label="New chat"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border/50 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-border/50" />
          <ModelChip />
          {modelActive && <SystemStats active />}
        </div>

        <nav className="flex items-center gap-0.5 rounded-md border border-border/50 bg-card/30 p-0.5 mx-auto">
          {tabs.map((t) => {
            const active = pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`relative px-3 py-1 rounded-[5px] text-xs font-medium transition-colors cursor-pointer ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-[5px] bg-secondary animate-scale-in" />
                )}
                <span className="relative">{t.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onToggleTemporary}
            aria-label="Temporary chat"
            title="Temporary chat"
            aria-pressed={temporary}
            className={`relative h-8 w-8 inline-flex items-center justify-center rounded-md border bg-card/40 transition-colors cursor-pointer ${
              temporary
                ? "border-foreground text-foreground"
                : "border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <MessageSquareDashed className="h-4 w-4" />
            {temporary && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-foreground text-background flex items-center justify-center animate-scale-in">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
            )}
          </button>
          <SettingsDialog />
        </div>
      </header>

      <main key={pathname} className="relative z-10 flex-1 flex flex-col animate-float-up">
        {children}
      </main>
    </div>
  );
}

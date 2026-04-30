import { useState } from "react";
import { MessageSquare, Plus, Trash2, Search, History, PanelLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type Conv = { id: string; title: string; preview: string; updated: string };

const seed: Conv[] = [
  { id: "1", title: "Refactoring fastapi router", preview: "Let's split the inference endpoint…", updated: "2h" },
  { id: "2", title: "SD prompt for cyberpunk alley", preview: "Try `neon, rain, low-angle, 35mm`…", updated: "1d" },
  { id: "3", title: "Whisper vs faster-whisper", preview: "For RTX 30/40 series…", updated: "2d" },
  { id: "4", title: "Ollama keep_alive flag", preview: "Set OLLAMA_KEEP_ALIVE=24h…", updated: "5d" },
  { id: "5", title: "XTTS voice cloning script", preview: "6-second reference is enough…", updated: "1w" },
  { id: "6", title: "Quantization tradeoffs", preview: "Q4_K_M is the sweet spot…", updated: "2w" },
  { id: "7", title: "Embeddings for RAG", preview: "bge-small handles most cases…", updated: "3w" },
];

export function HistorySidebar({
  expanded,
  onToggle,
  onNew,
}: {
  expanded: boolean;
  onToggle: () => void;
  onNew?: () => void;
}) {
  const [q, setQ] = useState("");
  const list = seed.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <aside
      className={`shrink-0 border-r border-border/40 bg-card/20 flex flex-col transition-[width] duration-200 ${
        expanded ? "w-64" : "w-12"
      } overflow-hidden`}
    >
      {expanded ? (
        <div className="w-64 flex flex-col h-full">
          <div className="flex items-center justify-between p-2 border-b border-border/40">
            <button
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-primary cursor-pointer"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onNew}
              className="inline-flex items-center gap-1.5 text-xs h-7 px-2 rounded-md border border-border/50 bg-card/40 hover:border-primary/40 hover:text-primary cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> New chat
            </button>
          </div>
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search history"
                className="h-8 pl-7 bg-secondary/40 border-border/50 text-xs"
              />
            </div>
          </div>
          <div className="font-mono text-[10px] tracking-widest text-muted-foreground px-3 mt-1 mb-1">RECENT</div>
          <div className="flex-1 overflow-y-auto scrollbar-thin px-2 space-y-0.5">
            {list.map((c) => (
              <button
                key={c.id}
                className="w-full text-left rounded-md px-2 py-1.5 hover:bg-accent/60 group flex items-start gap-2 cursor-pointer"
              >
                <MessageSquare className="h-3 w-3 mt-1 text-primary/60 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs truncate">{c.title}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{c.preview}</div>
                </div>
                <span className="font-mono text-[9px] text-muted-foreground/70 shrink-0">{c.updated}</span>
              </button>
            ))}
          </div>
          <button className="m-2 inline-flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest text-muted-foreground hover:text-destructive py-1.5 rounded-md border border-border/40 cursor-pointer">
            <Trash2 className="h-3 w-3" /> CLEAR ALL
          </button>
        </div>
      ) : (
        <div className="w-12 flex flex-col items-center gap-1 py-2">
          <RailButton label="Expand sidebar" onClick={onToggle}>
            <PanelLeft className="h-4 w-4" />
          </RailButton>
          <RailButton label="New chat" onClick={onNew}>
            <Plus className="h-4 w-4" />
          </RailButton>
          <RailPopoverButton label="Search">
            <div className="p-2 w-64">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input placeholder="Search history" className="h-8 pl-7 bg-secondary/40 border-border/50 text-xs" />
              </div>
            </div>
          </RailPopoverButton>
          <RailPopoverButton label="Recent chats" icon="history">
            <div className="py-1 w-72">
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground px-3 py-1.5">RECENT</div>
              <div className="px-1 max-h-80 overflow-y-auto scrollbar-thin">
                {seed.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    className="w-full text-left rounded-md px-2 py-1.5 hover:bg-accent/60 flex items-start gap-2 cursor-pointer"
                  >
                    <MessageSquare className="h-3 w-3 mt-1 text-primary/60 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{c.title}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{c.preview}</div>
                    </div>
                    <span className="font-mono text-[9px] text-muted-foreground/70 shrink-0">{c.updated}</span>
                  </button>
                ))}
              </div>
            </div>
          </RailPopoverButton>
        </div>
      )}
    </aside>
  );
}

function RailButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-accent/40 cursor-pointer"
    >
      {children}
    </button>
  );
}

function RailPopoverButton({
  children,
  label,
  icon,
}: {
  children: React.ReactNode;
  label: string;
  icon?: "history";
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={label}
        title={label}
        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-accent/40 cursor-pointer"
      >
        {icon === "history" ? <History className="h-4 w-4" /> : <Search className="h-4 w-4" />}
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="p-0 bg-popover border-border/60">
        {children}
      </PopoverContent>
    </Popover>
  );
}

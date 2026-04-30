import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/sokt/AppShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Copy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/prompts")({
  component: PromptLab,
  head: () => ({ meta: [{ title: "Prompt Lab · SOKT" }] }),
});

type Snippet = { id: string; key: string; title: string; body: string };

const initial: Snippet[] = [
  { id: "1", key: "sys:coder", title: "Coder", body: "You are an expert software engineer. Write concise, idiomatic code with brief explanations." },
  { id: "2", key: "sys:cp", title: "Competitive programming", body: "You are a competitive programming coach. Explain algorithms, complexity, and edge cases." },
  { id: "3", key: "sys:designer", title: "Designer", body: "You are a senior product designer. Critique with focus on hierarchy, contrast, and intent." },
  { id: "4", key: "sys:study", title: "Study tutor", body: "You are a patient tutor. Explain step by step using analogies and quick checks for understanding." },
];

function PromptLab() {
  const [snips, setSnips] = useState<Snippet[]>(initial);
  const [activeId, setActiveId] = useState(initial[0].id);
  const active = snips.find((s) => s.id === activeId)!;

  const update = (patch: Partial<Snippet>) =>
    setSnips((arr) => arr.map((s) => (s.id === activeId ? { ...s, ...patch } : s)));

  const add = () => {
    const id = crypto.randomUUID();
    const s: Snippet = { id, key: "sys:new", title: "New snippet", body: "" };
    setSnips((arr) => [s, ...arr]);
    setActiveId(id);
  };

  const remove = (id: string) => {
    setSnips((arr) => arr.filter((s) => s.id !== id));
    if (id === activeId && snips[0]) setActiveId(snips.find((s) => s.id !== id)?.id ?? "");
  };

  return (
    <AppShell>
      <div className="flex-1 flex min-h-0">
        <aside className="w-64 shrink-0 border-r border-border/40 bg-card/20 flex flex-col">
          <div className="p-2 border-b border-border/40 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground px-1">SNIPPETS</span>
            <button
              onClick={add}
              className="inline-flex items-center gap-1 text-xs h-7 px-2 rounded-md border border-border/50 bg-card/40 hover:border-primary/40 hover:text-primary cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-1.5 space-y-0.5">
            {snips.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`w-full text-left rounded-md px-2 py-1.5 cursor-pointer transition-colors ${
                  s.id === activeId
                    ? "bg-secondary border border-primary/40 text-foreground"
                    : "border border-transparent hover:bg-secondary/50"
                }`}
              >
                <div className="font-mono text-[11px] text-primary">{s.key}</div>
                <div className="text-xs truncate">{s.title}</div>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">PROMPT LAB</div>
            <h1 className="text-2xl font-semibold mb-1">Build reusable system prompts</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Define a snippet like <span className="font-mono text-primary">sys:coder</span>, then drop it into any chat to load that persona.
            </p>

            {active && (
              <div className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-5">
                <div className="grid grid-cols-[1fr_2fr] gap-3">
                  <Field label="Trigger">
                    <Input
                      value={active.key}
                      onChange={(e) => update({ key: e.target.value })}
                      className="h-9 font-mono text-sm bg-secondary/40 border-border/50"
                    />
                  </Field>
                  <Field label="Title">
                    <Input
                      value={active.title}
                      onChange={(e) => update({ title: e.target.value })}
                      className="h-9 bg-secondary/40 border-border/50"
                    />
                  </Field>
                </div>
                <Field label="System prompt">
                  <Textarea
                    value={active.body}
                    onChange={(e) => update({ body: e.target.value })}
                    className="min-h-40 bg-secondary/40 border-border/50 font-mono text-sm"
                    placeholder="You are…"
                  />
                </Field>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Use it in chat by typing <span className="font-mono text-primary">{active.key}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => navigator.clipboard?.writeText(active.body)}
                      className="inline-flex items-center gap-1 text-xs h-8 px-2.5 rounded-md border border-border/50 bg-card/40 hover:border-primary/40 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                    <button
                      onClick={() => remove(active.id)}
                      className="inline-flex items-center gap-1 text-xs h-8 px-2.5 rounded-md border border-border/50 bg-card/40 hover:border-destructive/50 hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1.5">{label.toUpperCase()}</div>
      {children}
    </label>
  );
}

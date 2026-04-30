import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/sokt/AppShell";
import { Workflow, Sparkles } from "lucide-react";

export const Route = createFileRoute("/workflow")({
  component: WorkflowPage,
  head: () => ({ meta: [{ title: "Workflow · SOKT" }] }),
});

function WorkflowPage() {
  return (
    <AppShell>
      <div className="flex-1 flex items-center justify-center px-6 py-20 animate-float-up">
        <div className="max-w-md text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 mb-6 font-mono text-sm tracking-widest text-primary">
            <Sparkles className="h-4 w-4" /> COMING SOON
          </div>
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card/40 text-primary mb-6">
            <Workflow className="h-7 w-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">Build your own system</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pick a model for text, image, code, and questions — SOKT routes each request automatically.
            One assistant, your rules.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

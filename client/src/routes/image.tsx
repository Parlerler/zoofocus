import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/sokt/AppShell";
import { Sparkles, Image as ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/image")({
  component: ImagePage,
  head: () => ({ meta: [{ title: "Image · SOKT" }] }),
});

function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState("stabilityai/sdxl-turbo");

  const generate = () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setTimeout(() => setBusy(false), 1500);
  };

  return (
    <AppShell modelActive={busy}>
      <div className="flex-1 px-4 md:px-8 py-10 max-w-3xl w-full mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Image</h1>
        <p className="text-sm text-muted-foreground mb-6">Generate images with local diffusion models.</p>

        <label className="block mb-3">
          <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1.5">MODEL</div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full appearance-none rounded-md border border-border/60 bg-secondary/30 px-3 py-2 text-sm font-mono focus:border-primary/40 focus:outline-none"
          >
            <option>stabilityai/sdxl-turbo</option>
            <option>black-forest-labs/FLUX.1-schnell</option>
            <option>stabilityai/stable-diffusion-3.5</option>
          </select>
        </label>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe an image…"
          className="min-h-[100px] bg-secondary/30 border-border/50 mb-3"
        />

        <button
          onClick={generate}
          disabled={busy || !prompt.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mb-6"
        >
          <Sparkles className="h-4 w-4" /> {busy ? "Generating…" : "Generate"}
        </button>

        <div className="aspect-square rounded-2xl border border-dashed border-border/60 bg-card/30 flex items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2 text-xs">
            <ImageIcon className="h-6 w-6" />
            {busy ? "Rendering…" : "Output appears here"}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

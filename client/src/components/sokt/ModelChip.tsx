import { useState, useEffect } from "react";
import { ChevronDown, Library, Check, Download, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModel } from "../../hooks/ModelContext";

const installedSeed = [
  { name: "qwen2.5:7b", size: "4.4 GB" },
  { name: "llama3.1:8b", size: "4.7 GB" },
  { name: "phi3:mini", size: "2.3 GB" },
];

type AvailModel = {
  name: string;
  size: string;
  source: "ollama" | "huggingface";
  kind: "chat" | "code" | "image gen" | "audio";
};
const available: AvailModel[] = [
  { name: "mistral:7b", size: "4.1 GB", source: "ollama", kind: "chat" },
  { name: "qwen2.5-coder:7b", size: "4.4 GB", source: "ollama", kind: "code" },
  {
    name: "deepseek-coder:6.7b",
    size: "3.8 GB",
    source: "ollama",
    kind: "code",
  },
  { name: "llama3.1:70b", size: "40 GB", source: "ollama", kind: "chat" },
  {
    name: "stabilityai/sdxl-turbo",
    size: "6.9 GB",
    source: "huggingface",
    kind: "image gen",
  },
  {
    name: "black-forest-labs/FLUX.1-schnell",
    size: "23.8 GB",
    source: "huggingface",
    kind: "image gen",
  },
  {
    name: "openai/whisper-large-v3",
    size: "3.1 GB",
    source: "huggingface",
    kind: "audio",
  },
  {
    name: "coqui/XTTS-v2",
    size: "1.8 GB",
    source: "huggingface",
    kind: "audio",
  },
];

const KINDS = ["all", "chat", "code", "image gen", "audio"] as const;
const SOURCES = ["all", "ollama", "huggingface"] as const;

export function ModelChip() {
  const { activeModel: active, setActiveModel: setActive } = useModel();
  const [installed, setInstalled] = useState<any[]>([]);
  const unload = () => setActive("no model selected");
  useEffect(() => {
    // Fetch Installed Models
    fetch("http://localhost:8000/api/models/installed")
      .then((res) => res.json())
      .then((data) => {
        // data is a list of strings: ["mistral:7b"]
        // Map it to match the UI expectation
        const formattedInstalled = data.map((modelName: string) => ({
          name: modelName,
          size: "Unknown", // Your backend currently doesn't send size
        }));
        setInstalled(formattedInstalled);

        // Auto-select the first installed model if available
        if (formattedInstalled.length > 0)
          setActive(formattedInstalled[0].name);
      })
      .catch((err) => console.error("Failed to fetch installed models:", err));
  }, []);
  return (
    <div className="inline-flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger className="group inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2 py-0.5 font-mono text-[11px] hover:border-primary/40 transition-colors cursor-pointer">
          <span
            className={`h-1.5 w-1.5 rounded-full ${active ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`}
          />
          {active || "no model"}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-64 font-mono text-[11px]"
        >
          <DropdownMenuLabel className="text-[10px] tracking-widest text-muted-foreground">
            INSTALLED
          </DropdownMenuLabel>
          {installed.map((m) => {
            const running = m.name === active;
            return (
              <DropdownMenuItem
                key={m.name}
                onSelect={(e) => {
                  e.preventDefault();
                  setActive(m.name);
                }}
                className="flex justify-between gap-2 cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Check
                    className={`h-3 w-3 shrink-0 ${running ? "text-primary" : "text-transparent"}`}
                  />
                  <span className="truncate">{m.name}</span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="text-muted-foreground">{m.size}</span>
                  {running && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unload();
                      }}
                      aria-label="Unload model"
                      title="Unload"
                      className="text-muted-foreground hover:text-destructive cursor-pointer p-0.5 rounded"
                    >
                      <X className="h-2.5 w-2.5" strokeWidth={2.5} />
                    </button>
                  )}
                </span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <BrowseTrigger asMenuItem />
        </DropdownMenuContent>
      </DropdownMenu>
      <BrowseTrigger />
    </div>
  );
}

function BrowseTrigger({ asMenuItem = false }: { asMenuItem?: boolean }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("all");
  const [source, setSource] = useState<(typeof SOURCES)[number]>("all");
  const [availableList, setAvailableList] = useState<AvailModel[]>([]);
  const [downloads, setDownloads] = useState<Record<string, string>>({});

  const list = availableList.filter(
    (m) =>
      m.name.toLowerCase().includes(q.toLowerCase()) &&
      (kind === "all" || m.kind === kind) &&
      (source === "all" || m.source === source),
  );

  useEffect(() => {
    fetch("http://localhost:8000/api/models/available")
      .then((res) => res.json())
      .then((data) => {
        // data comes from AVAILABLE_MODELS in models.py
        const formattedAvailable = data.map((m: any) => ({
          name: m.id, // The ID ("mistral:7b") is what Ollama needs to pull
          size: m.size, // Size from your models.py
          source: "ollama", // Defaulting to ollama for backend models
          kind: "chat", // Defaulting to chat for now
        }));
        setAvailableList(formattedAvailable);
      })
      .catch((err) => console.error("Failed to fetch available models:", err));
  }, []);

  async function handlePull(modelName: string) {
    // 1. Set initial downloading state
    setDownloads((prev) => ({ ...prev, [modelName]: "Starting..." }));

    try {
      // 2. Call your backend endpoint
      const res = await fetch(
        `http://localhost:8000/api/models/download/${modelName}`,
        {
          method: "POST",
        },
      );

      if (!res.body) throw new Error("No response body");

      // 3. Set up the stream reader
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Download finished!
          setDownloads((prev) => ({ ...prev, [modelName]: "Done!" }));

          // Optional: Refresh your installed models list here
          setTimeout(() => {
            setDownloads((prev) => {
              const next = { ...prev };
              delete next[modelName];
              return next;
            });
          }, 3000); // Clear the "Done!" message after 3 seconds
          break;
        }

        // 4. Decode the chunk and extract the JSON
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            // Parse the JSON string yielded by your backend's stream_download function
            const data = JSON.parse(line.slice(6));

            // Ollama provides a 'status' string. If it provides completed/total bytes,
            // you could calculate a percentage here too.
            if (data.status) {
              setDownloads((prev) => ({ ...prev, [modelName]: data.status }));
            }
          } catch (e) {
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    } catch (err) {
      console.error("Download failed:", err);
      setDownloads((prev) => ({ ...prev, [modelName]: "Error" }));
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {asMenuItem ? (
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent rounded-sm cursor-pointer">
            <Library className="h-3.5 w-3.5" /> Browse models…
          </button>
        ) : (
          <button
            aria-label="Browse models"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border/50 bg-card/40 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
          >
            <Library className="h-3.5 w-3.5" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col p-0 gap-0 bg-popover">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2">
            <Library className="h-4 w-4 text-primary" /> Model Library
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="browse" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-5 mt-3 self-start bg-secondary/40">
            <TabsTrigger value="browse" className="cursor-pointer">
              Browse
            </TabsTrigger>
            <TabsTrigger value="learn" className="cursor-pointer">
              How to pick your model
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="browse"
            className="flex-1 flex flex-col min-h-0 mt-3 px-5 pb-5"
          >
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search Ollama & Hugging Face…"
                  className="pl-9 h-9 bg-secondary/40 border-border/60"
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-md border border-border/50 bg-card/30 px-3 py-2.5">
                <Filter
                  label="Type"
                  options={KINDS}
                  value={kind}
                  onChange={(v) => setKind(v as typeof kind)}
                />
                <Filter
                  label="Source"
                  options={SOURCES}
                  value={source}
                  onChange={(v) => setSource(v as typeof source)}
                />
                <span className="ml-auto font-mono text-[10px] tracking-widest text-muted-foreground">
                  {list.length} RESULTS
                </span>
              </div>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto scrollbar-thin grid sm:grid-cols-2 gap-2 pr-1">
              {list.map((m) => {
                const currentStatus = downloads[m.name];
                const isDownloading = !!currentStatus;

                return (
                  <div
                    key={m.name}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/50 bg-card/40 px-3 py-2.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-xs truncate">{m.name}</div>
                      <div className="font-mono text-[10px] tracking-widest text-muted-foreground mt-0.5">
                        {m.source.toUpperCase()} · {m.kind.toUpperCase()} ·{" "}
                        {m.size}
                      </div>
                    </div>

                    {/* Updated Button */}
                    <button
                      onClick={() => handlePull(m.name)}
                      disabled={isDownloading}
                      className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs shrink-0 transition-all ${
                        isDownloading
                          ? "bg-secondary text-secondary-foreground cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                      }`}
                    >
                      {!isDownloading && <Download className="h-3 w-3" />}
                      {/* Show the Ollama stream status if downloading, otherwise show "Pull" */}
                      <span className="truncate max-w-[120px]">
                        {isDownloading ? currentStatus : "Pull"}
                      </span>
                    </button>
                  </div>
                );
              })}
              {list.length === 0 && (
                <div className="col-span-full text-center text-xs text-muted-foreground py-12">
                  No models match.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="learn"
            className="flex-1 overflow-y-auto scrollbar-thin mt-3 px-5 pb-5"
          >
            <article className="md-content text-sm leading-relaxed">
              <HowToPick />
            </article>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Filter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] tracking-widest text-foreground">
        {label.toUpperCase()}
      </span>
      <div className="inline-flex rounded-md border border-border/60 bg-background p-0.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-2.5 py-1 rounded-[4px] text-[11px] font-mono transition-colors cursor-pointer ${
              value === o
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function C({ children }: { children: React.ReactNode }) {
  return <code>{children}</code>;
}

function HowToPick() {
  return (
    <>
      <h2>Start here</h2>
      <p>
        Pick a model based on <strong>what you have</strong> (RAM/VRAM) and{" "}
        <strong>what you want to do</strong>.
      </p>
      <table>
        <thead>
          <tr>
            <th>You have</th>
            <th>Try</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>8 GB VRAM</td>
            <td>
              <C>qwen2.5:7b</C> · <C>llama3.1:8b</C> (Q4)
            </td>
          </tr>
          <tr>
            <td>16 GB VRAM</td>
            <td>
              <C>qwen2.5:14b</C> · <C>mistral-nemo:12b</C>
            </td>
          </tr>
          <tr>
            <td>24 GB+ VRAM</td>
            <td>
              <C>qwen2.5:32b</C> · <C>llama3.1:70b</C> (heavily quantized)
            </td>
          </tr>
          <tr>
            <td>CPU only</td>
            <td>
              <C>phi3:mini</C> · <C>llama3.2:3b</C>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Reading a model name</h2>
      <p>
        <C>qwen2.5-coder:7b-instruct-q4_K_M</C>
      </p>
      <ul>
        <li>
          <strong>qwen2.5-coder</strong> — family / fine-tune
        </li>
        <li>
          <strong>7b</strong> — ~7 billion parameters (size)
        </li>
        <li>
          <strong>instruct</strong> — tuned to follow instructions (vs base
          completion)
        </li>
        <li>
          <strong>q4_K_M</strong> — quantization (see below)
        </li>
      </ul>

      <h2>Formats</h2>
      <ul>
        <li>
          <strong>GGUF</strong> — single-file, runs on CPU or GPU. What Ollama
          uses by default.
        </li>
        <li>
          <strong>Safetensors / PyTorch</strong> — original Hugging Face
          weights. Convert to GGUF for local CPU/GPU.
        </li>
        <li>
          <strong>GPTQ / AWQ</strong> — GPU-only quantized formats, very fast on
          NVIDIA.
        </li>
      </ul>

      <h2>Quantization cheat sheet</h2>
      <p>Smaller = less memory, slightly worse output.</p>
      <ul>
        <li>
          <C>q8_0</C> — near-original quality, ~1 byte/param
        </li>
        <li>
          <C>q5_K_M</C> — great balance
        </li>
        <li>
          <strong>
            <C>q4_K_M</C> — recommended default
          </strong>
        </li>
        <li>
          <C>q3_K_M</C> — only when you must squeeze it in
        </li>
      </ul>

      <h2>Picking by task</h2>
      <ul>
        <li>
          <strong>Chat / general</strong> — qwen2.5, llama3.1
        </li>
        <li>
          <strong>Code</strong> — qwen2.5-coder, deepseek-coder
        </li>
        <li>
          <strong>Vision</strong> — llava, qwen2-vl
        </li>
        <li>
          <strong>Image gen</strong> — sdxl-turbo (fast), flux.1 (best quality)
        </li>
        <li>
          <strong>Speech</strong> — whisper (STT), xtts-v2 (TTS + cloning)
        </li>
      </ul>
    </>
  );
}

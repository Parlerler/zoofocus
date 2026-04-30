import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ACCENTS = [
  { name: "White", l: 0.96, c: 0, h: 0 },
  { name: "Amber", l: 0.82, c: 0.13, h: 75 },
  { name: "Emerald", l: 0.78, c: 0.14, h: 155 },
  { name: "Sky", l: 0.78, c: 0.12, h: 230 },
  { name: "Violet", l: 0.72, c: 0.17, h: 295 },
  { name: "Rose", l: 0.74, c: 0.17, h: 15 },
] as const;

export function SettingsDialog() {
  const [name, setName] = useState("Zedan");
  const [folder, setFolder] = useState("~/sokt/models");
  const [endpoint, setEndpoint] = useState("http://127.0.0.1:11434");
  const [hfToken, setHfToken] = useState("");
  const [autoload, setAutoload] = useState(true);
  const [notif, setNotif] = useState(true);
  const [accentIdx, setAccentIdx] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const v = Number(window.localStorage.getItem("sokt:accentIdx"));
    return Number.isFinite(v) && v >= 0 && v < ACCENTS.length ? v : 0;
  });

  useEffect(() => {
    const a = ACCENTS[accentIdx];
    const root = document.documentElement;
    root.style.setProperty("--accent-l", String(a.l));
    root.style.setProperty("--accent-c", String(a.c));
    root.style.setProperty("--accent-h", String(a.h));
    try { window.localStorage.setItem("sokt:accentIdx", String(accentIdx)); } catch {}
  }, [accentIdx]);


  return (
    <Dialog>
      <DialogTrigger
        aria-label="Settings"
        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border/50 bg-card/40 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
      >
        <Settings className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-popover">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="mt-1">
          <TabsList className="bg-secondary/40">
            <TabsTrigger value="general" className="cursor-pointer">General</TabsTrigger>
            <TabsTrigger value="apis" className="cursor-pointer">APIs</TabsTrigger>
            <TabsTrigger value="keys" className="cursor-pointer">Keybindings</TabsTrigger>
          </TabsList>

          <div className="min-h-[340px]">
            <TabsContent value="general" className="space-y-3 pt-3 mt-0">
              <Row label="Name">
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 bg-secondary/40 border-border/60" />
              </Row>
              <Row label="Models folder">
                <Input value={folder} onChange={(e) => setFolder(e.target.value)} className="h-8 bg-secondary/40 border-border/60 font-mono text-xs" />
              </Row>
              <Row label="Accent">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ACCENTS.map((a, i) => {
                    const swatch = `oklch(${a.l} ${a.c} ${a.h})`;
                    const active = i === accentIdx;
                    return (
                      <button
                        key={a.name}
                        onClick={() => setAccentIdx(i)}
                        title={a.name}
                        aria-label={a.name}
                        className={`h-6 w-6 rounded-full border flex items-center justify-center cursor-pointer transition-transform ${active ? "border-foreground scale-110" : "border-border/60 hover:scale-105"}`}
                        style={{ background: swatch }}
                      >
                        {active && <Check className="h-3 w-3" style={{ color: a.l > 0.6 ? "#000" : "#fff" }} strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              </Row>
              <Toggle label="Auto-load last model" value={autoload} onChange={setAutoload} />
              <Toggle label="Desktop notifications" value={notif} onChange={setNotif} />
            </TabsContent>

            <TabsContent value="apis" className="space-y-3 pt-3 mt-0">
              <Row label="Ollama endpoint">
                <Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="h-8 bg-secondary/40 border-border/60 font-mono text-xs" />
              </Row>
              <Row label="HF token">
                <Input value={hfToken} onChange={(e) => setHfToken(e.target.value)} placeholder="hf_…" className="h-8 bg-secondary/40 border-border/60 font-mono text-xs" />
              </Row>
              <p className="text-[11px] text-muted-foreground pt-1">Tokens are stored locally and only used to pull gated models.</p>
            </TabsContent>

            <TabsContent value="keys" className="pt-3 mt-0">
              <div className="rounded-md border border-border/50 divide-y divide-border/40">
                {[
                  ["New chat", "⌘ N"],
                  ["Toggle sidebar", "⌘ B"],
                  ["Open settings", "⌘ ,"],
                  ["Browse models", "⌘ K"],
                  ["Send message", "Enter"],
                  ["New line", "Shift Enter"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span>{k}</span>
                    <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded border border-border/50 bg-secondary/40">{v}</kbd>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid grid-cols-[120px_1fr] items-center gap-3">
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{label.toUpperCase()}</span>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/50 bg-secondary/30 px-3 py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

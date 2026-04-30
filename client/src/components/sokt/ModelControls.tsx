import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function ModelControls() {
  const [temp, setTemp] = useState([0.7]);
  const [topP, setTopP] = useState([0.9]);
  const [maxTokens, setMaxTokens] = useState([2048]);
  const [stream, setStream] = useState(true);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono text-[10px] tracking-widest text-muted-foreground">MODEL CONTROLS</div>
        <button className="font-mono text-[10px] tracking-widest text-muted-foreground hover:text-primary">
          RESET
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <Control label="Temperature" value={temp[0].toFixed(2)}>
          <Slider value={temp} onValueChange={setTemp} min={0} max={2} step={0.05} />
        </Control>
        <Control label="Top P" value={topP[0].toFixed(2)}>
          <Slider value={topP} onValueChange={setTopP} min={0} max={1} step={0.05} />
        </Control>
        <Control label="Max tokens" value={String(maxTokens[0])}>
          <Slider value={maxTokens} onValueChange={setMaxTokens} min={128} max={8192} step={128} />
        </Control>
      </div>
      <div className="mt-5 grid md:grid-cols-[1fr_auto] gap-4 items-start">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-2">SYSTEM PROMPT</div>
          <Textarea
            placeholder="You are a helpful local assistant…"
            className="bg-secondary/40 border-border/60 min-h-[72px] resize-none"
          />
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2 self-stretch md:self-auto">
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground">STREAM</span>
          <Switch checked={stream} onCheckedChange={setStream} />
        </label>
      </div>
    </div>
  );
}

function Control({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{label.toUpperCase()}</span>
        <span className="font-mono text-xs text-primary">{value}</span>
      </div>
      {children}
    </div>
  );
}

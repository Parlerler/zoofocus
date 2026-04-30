import { useEffect, useState } from "react";

type Stats = { gpu: number; ram: number; cpu: number };

function useFakeStats(active: boolean): Stats {
  const [s, setS] = useState<Stats>({ gpu: 22, ram: 41, cpu: 12 });
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setS((p) => ({
        gpu: Math.max(20, Math.min(92, p.gpu + (Math.random() - 0.4) * 12)),
        ram: Math.max(30, Math.min(88, p.ram + (Math.random() - 0.5) * 6)),
        cpu: Math.max(8, Math.min(85, p.cpu + (Math.random() - 0.5) * 16)),
      }));
    }, 1500);
    return () => clearInterval(id);
  }, [active]);
  return s;
}

/** Compact inline stats. Only shown when a model is actively running. */
export function SystemStats({ active = false }: { active?: boolean }) {
  const { gpu, ram, cpu } = useFakeStats(active);
  if (!active) return null;
  return (
    <div className="inline-flex items-center gap-3 rounded-md border border-border/50 bg-card/40 px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted-foreground animate-float-up">
      <span className="inline-flex items-center gap-1">
        <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
        GPU {gpu.toFixed(0)}%
      </span>
      <span>RAM {ram.toFixed(0)}%</span>
      <span>CPU {cpu.toFixed(0)}%</span>
    </div>
  );
}

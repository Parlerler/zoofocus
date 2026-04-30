import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AppShell } from "@/components/sokt/AppShell";
import { Mic, Square, Upload, Play, Volume2, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/audio")({
  component: AudioPage,
  head: () => ({ meta: [{ title: "Audio · SOKT" }] }),
});

const tabs = [
  { id: "stt", label: "Speech → Text" },
  { id: "tts", label: "Text → Speech" },
] as const;

function AudioPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("stt");
  const [busy, setBusy] = useState(false);

  return (
    <AppShell modelActive={busy}>
      <div className="flex-1 px-4 md:px-8 py-10 max-w-3xl w-full mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Audio</h1>
        <p className="text-sm text-muted-foreground mb-6">Local speech models, no audio leaves your machine.</p>

        <div className="inline-flex rounded-md border border-border/50 bg-card/30 p-0.5 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer ${
                tab === t.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "stt" ? <STTPanel busy={busy} setBusy={setBusy} /> : <TTSPanel busy={busy} setBusy={setBusy} />}
      </div>
    </AppShell>
  );
}

function STTPanel({ busy, setBusy }: { busy: boolean; setBusy: (b: boolean) => void }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const toggle = () => {
    if (recording) {
      setRecording(false);
      setBusy(true);
      setTimeout(() => {
        setTranscript("Hello — this is a transcribed sample from your local Whisper model.");
        setBusy(false);
      }, 900);
    } else {
      setRecording(true);
      setTranscript("");
    }
  };

  return (
    <div className="space-y-4">
      <ModelRow label="Model" value="openai/whisper-large-v3" />
      <div className="rounded-2xl border border-border/50 bg-card/40 p-6 flex flex-col items-center gap-4">
        <button
          onClick={toggle}
          className={`h-20 w-20 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            recording
              ? "border-destructive/60 bg-destructive/10 text-destructive animate-pulse"
              : "border-border bg-secondary/40 hover:border-primary/40 hover:text-primary hover:bg-secondary/60"
          }`}
        >
          {recording ? <Square className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
        </button>
        <div className="text-xs text-muted-foreground">
          {recording ? "Recording… click to stop" : busy ? "Transcribing…" : "Click to record"}
        </div>
        <button className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
          <Upload className="h-3.5 w-3.5" /> Or upload an audio file
        </button>
      </div>
      <Textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Transcript will appear here…"
        className="min-h-[140px] bg-secondary/30 border-border/50"
      />
    </div>
  );
}

function TTSPanel({ busy, setBusy }: { busy: boolean; setBusy: (b: boolean) => void }) {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("Aria");
  const [model, setModel] = useState("coqui/XTTS-v2");
  const fileRef = useRef<HTMLInputElement>(null);

  const voices = ["Aria", "Liam", "Sora", "Atlas", "Nova"];
  const models = ["coqui/XTTS-v2", "suno/bark", "kokoro/kokoro-82M"];

  const synth = () => {
    if (!text.trim()) return;
    setBusy(true);
    setTimeout(() => setBusy(false), 1200);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Model">
          <Select value={model} onChange={setModel} options={models} />
        </Field>
        <Field label="Voice">
          <Select value={voice} onChange={setVoice} options={voices} />
        </Field>
      </div>

      <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg border border-border bg-secondary/50 flex items-center justify-center text-primary">
            <Wand2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium">Clone a voice</div>
            <div className="text-xs text-muted-foreground">Drop a 6-second clean sample.</div>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="audio/*" className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="text-xs rounded-md border border-border/60 bg-secondary/40 px-3 py-1.5 hover:border-primary/40 hover:text-primary cursor-pointer"
        >
          Upload sample
        </button>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to speak…"
        className="min-h-[140px] bg-secondary/30 border-border/50"
      />

      <div className="flex items-center gap-2">
        <button
          onClick={synth}
          disabled={busy || !text.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4" /> {busy ? "Generating…" : "Speak"}
        </button>
        <button className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
          <Volume2 className="h-3.5 w-3.5" /> Preview voice
        </button>
      </div>
    </div>
  );
}

function ModelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/40 px-4 py-2.5">
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{label.toUpperCase()}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
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

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-border/60 bg-secondary/30 px-3 py-2 text-sm font-mono focus:border-primary/40 focus:outline-none"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

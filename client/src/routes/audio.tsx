import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AppShell } from "@/components/sokt/AppShell";
import { Mic, Square, Upload, Play, Volume2, Download, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/audio")({
  component: AudioPage,
  head: () => ({ meta: [{ title: "Audio · SOKT" }] }),
});

const tabs = [
  { id: "stt", label: "Speech → Text" },
  { id: "tts", label: "Text → Speech" },
] as const;

// ─── Pocket TTS constants ────────────────────────────────────────────────────

const POCKET_TTS_VOICES = [
  "alba", "anna", "azelma", "bill_boerst", "caro_davy", "charles",
  "cosette", "eponine", "eve", "fantine", "george", "jane", "jean",
  "javert", "marius", "mary", "michael", "paul", "peter_yearsley",
  "stuart_bell", "vera",
] as const;

const POCKET_TTS_LANGUAGES = [
  { value: "english",        label: "English (default)" },
  { value: "english_2026-01", label: "English 2026-01" },
  { value: "english_2026-04", label: "English 2026-04" },
  { value: "french_24l",     label: "French" },
  { value: "german_24l",     label: "German" },
  { value: "portuguese_24l", label: "Portuguese" },
  { value: "italian_24l",    label: "Italian" },
  { value: "spanish_24l",    label: "Spanish" },
] as const;

// ─── Page ────────────────────────────────────────────────────────────────────

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

// ─── STT Panel (unchanged) ───────────────────────────────────────────────────

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

// ─── TTS Panel ───────────────────────────────────────────────────────────────

function TTSPanel({ busy, setBusy }: { busy: boolean; setBusy: (b: boolean) => void }) {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState<string>(POCKET_TTS_VOICES[0]);
  const [language, setLanguage] = useState(POCKET_TTS_LANGUAGES[0].value);
  const [serverUrl, setServerUrl] = useState("http://localhost:8000");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const synth = async () => {
    if (!text.trim() || busy) return;

    // Revoke previous blob URL to free memory
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setError(null);
    setBusy(true);

    try {
      const form = new FormData();
      form.append("text", text.trim());
      form.append("voice", voice);

      const res = await fetch(`${serverUrl.replace(/\/$/, "")}/tts`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => res.statusText);
        throw new Error(`Server returned ${res.status}: ${msg}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Auto-play once src is set (the useEffect on audioRef handles this,
      // but we can also trigger play directly after the element updates).
      // We use setTimeout(0) to let React flush the audio src update first.
      setTimeout(() => audioRef.current?.play(), 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("Failed to fetch")
        ? `Cannot reach pocket-tts server at ${serverUrl}. Make sure it's running:\n  pocket-tts serve --language ${language}`
        : msg);
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `tts-${voice}-${Date.now()}.wav`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Server URL */}
      <Field label="Server URL">
        <Input
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          className="h-9 font-mono text-sm bg-secondary/40 border-border/50"
          placeholder="http://localhost:8000"
        />
      </Field>

      {/* Language model + Voice */}
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Language model">
          <Select
            value={language}
            onChange={setLanguage}
            options={POCKET_TTS_LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
          />
        </Field>
        <Field label="Voice">
          <Select
            value={voice}
            onChange={setVoice}
            options={POCKET_TTS_VOICES.map((v) => ({ value: v, label: v }))}
          />
        </Field>
      </div>

      {/* Language model hint */}
      <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-card/20 px-3 py-2.5 text-xs text-muted-foreground">
        <span className="font-mono text-primary shrink-0">$</span>
        <span>
          pocket-tts serve{language !== "english" ? ` --language ${language}` : ""}
          <span className="ml-2 opacity-50"># restart server to switch language</span>
        </span>
      </div>

      {/* Text input */}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to speak…"
        className="min-h-[140px] bg-secondary/30 border-border/50"
      />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-xs text-destructive whitespace-pre-wrap">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Audio player */}
      {audioUrl && (
        <div className="rounded-xl border border-border/50 bg-card/40 px-4 py-3 flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-primary shrink-0" />
          <audio ref={audioRef} src={audioUrl} controls className="flex-1 h-8" />
          <button
            onClick={download}
            className="inline-flex items-center gap-1 text-xs h-8 px-2.5 rounded-md border border-border/50 bg-card/40 hover:border-primary/40 hover:text-primary cursor-pointer transition-colors shrink-0"
          >
            <Download className="h-3.5 w-3.5" /> Save
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={synth}
          disabled={busy || !text.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4" />
          {busy ? "Generating…" : "Speak"}
        </button>
      </div>
    </div>
  );
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

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

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-border/60 bg-secondary/30 px-3 py-2 text-sm font-mono focus:border-primary/40 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
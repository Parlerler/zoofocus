import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Plus, Sliders } from "lucide-react";
import { AppShell } from "@/components/sokt/AppShell";
import { ModelControls } from "@/components/sokt/ModelControls";
import { HistorySidebar } from "@/components/sokt/HistorySidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useModel } from "../hooks/ModelContext";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "Chat · SOKT" }] }),
});

type Msg = { role: "user" | "assistant"; content: string };

const PROMPT_SNIPPETS: Record<string, string> = {
  "sys:coder":
    "You are an expert software engineer. Write concise, idiomatic code with brief explanations.",
  "sys:cp":
    "You are a competitive programming coach. Explain algorithms, complexity, and edge cases.",
  "sys:designer":
    "You are a senior product designer. Critique with focus on hierarchy, contrast, and intent.",
  "sys:study":
    "You are a patient tutor. Explain step by step using analogies and quick checks for understanding.",
};

function ChatPage() {
  const { activeModel } = useModel();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [temporary, setTemporary] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const expandSnippet = (text: string) =>
    text.replace(
      /sys:(coder|cp|designer|study)/g,
      (m) => PROMPT_SNIPPETS[m] ?? m,
    );

  const send = async () => {
    const v = input.trim();
    if (!v) return;

    const fullMessage = expandSnippet(v);

    // 1. Add user message to UI immediately
    setMessages((m) => [...m, { role: "user", content: fullMessage }]);
    setInput("");
    setBusy(true);

    // We need to keep track of the entire conversation history to send to Ollama.
    // Ollama needs the context of previous messages to remember the chat!
    const chatHistory = [...messages, { role: "user", content: fullMessage }];

    try {
      // 2. Call your FastAPI backend
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: activeModel,
          messages: chatHistory,
        }),
      });

      if (!res.body) throw new Error("No response body");

      // 3. Prepare an empty assistant message in the UI that we will fill up
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      // 4. Read the stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const { token } = JSON.parse(line.slice(6));

            // 5. Update the LAST message in the array with the new token
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastIndex = newMessages.length - 1;
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: newMessages[lastIndex].content + token,
              };
              return newMessages;
            });
          } catch (e) {
            // Ignore incomplete JSON chunks
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Error connecting to backend." },
      ]);
    } finally {
      setBusy(false);
      taRef.current?.focus();
    }
  };

  const empty = messages.length === 0;

  return (
    <AppShell
      modelActive={busy}
      onNewChat={() => setMessages([])}
      temporary={temporary}
      onToggleTemporary={() => {
        setTemporary((t) => !t);
        setMessages([]);
      }}
    >
      <div className="flex-1 flex min-h-0">
        <HistorySidebar
          expanded={sidebarOpen}
          onToggle={() => setSidebarOpen((s) => !s)}
          onNew={() => setMessages([])}
        />

        <div className="flex-1 flex flex-col min-w-0 relative">
          {empty ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-[18vh]">
              <div
                key={temporary ? "temp" : "normal"}
                className="text-center mb-6 animate-float-up"
              >
                {temporary ? (
                  <>
                    <h1 className="text-2xl md:text-3xl font-medium">
                      Temporary Chat
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This chat won't appear in your chat history.
                    </p>
                  </>
                ) : (
                  <h1 className="text-2xl md:text-3xl font-medium">
                    What can I help with?
                  </h1>
                )}
              </div>
              <div className="w-full max-w-2xl">
                <Composer
                  input={input}
                  setInput={setInput}
                  send={send}
                  taRef={taRef}
                />
                <SnippetHints
                  onPick={(s) => setInput((t) => (t ? t + " " + s : s + " "))}
                />
              </div>
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto scrollbar-thin"
              >
                <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto w-full space-y-4">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border/50"
                        }`}
                      >
                        <ReactMarkdown
                          components={{
                            code(props) {
                              const {
                                children,
                                className,
                                node,
                                ref,
                                ...rest
                              } = props;
                              const match = /language-(\w+)/.exec(
                                className || "",
                              );

                              return match ? (
                                <SyntaxHighlighter
                                  {...rest}
                                  PreTag="div"
                                  language={match[1]}
                                  style={vscDarkPlus}
                                  className="rounded-md border border-border/50 text-xs my-2 !bg-background/50"
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              ) : (
                                <code
                                  {...rest}
                                  className="bg-background/50 rounded px-1.5 py-0.5 text-primary"
                                >
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {busy && (
                    <div className="text-xs text-muted-foreground">
                      thinking…
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 md:px-8 pb-4 pt-2">
                <div className="max-w-3xl mx-auto">
                  <Composer
                    input={input}
                    setInput={setInput}
                    send={send}
                    taRef={taRef}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Composer({
  input,
  setInput,
  send,
  taRef,
}: {
  input: string;
  setInput: (s: string) => void;
  send: () => void;
  taRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="flex items-end gap-2 rounded-2xl border border-border/60 bg-card/60 p-1.5 focus-within:border-primary/40 transition-colors">
      <button
        aria-label="Attach"
        className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:text-primary flex items-center justify-center cursor-pointer"
      >
        <Plus className="h-4 w-4" />
      </button>
      <textarea
        ref={taRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        rows={1}
        placeholder="Ask Anything"
        className="flex-1 resize-none bg-transparent px-1 py-2 text-sm focus:outline-none placeholder:text-muted-foreground max-h-40"
      />
      <Popover>
        <PopoverTrigger
          aria-label="Model controls"
          className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Sliders className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-[420px] p-0 border-border/60 bg-popover"
        >
          <ModelControls />
        </PopoverContent>
      </Popover>
      <button
        onClick={send}
        aria-label="Send"
        className="h-9 w-9 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 cursor-pointer"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}

function SnippetHints({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground mr-1">
        SNIPPETS
      </span>
      {Object.keys(PROMPT_SNIPPETS).map((s) => (
        <button
          key={s}
          onClick={() => onPick(s)}
          className="font-mono text-[11px] px-2 py-0.5 rounded-md border border-border/50 bg-card/40 text-muted-foreground hover:text-primary hover:border-primary/40 cursor-pointer"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

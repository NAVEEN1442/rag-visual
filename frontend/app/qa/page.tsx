"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  ArrowLeft,
  Upload,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface RunResponse {
  answer?: string;
  response?: string;
  result?: string;
}

// ── Markdown renderer components ───────────────────────────────────────────
const markdownComponents: Components = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-white mt-4 mb-2 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-white mt-3 mb-1.5 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-zinc-100 mt-3 mb-1 first:mt-0">{children}</h3>
  ),
  // Paragraph
  p: ({ children }) => (
    <p className="leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  // Bold
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  // Italic
  em: ({ children }) => (
    <em className="italic text-purple-300">{children}</em>
  ),
  // Unordered list
  ul: ({ children }) => (
    <ul className="my-2 ml-1 space-y-1 list-none">{children}</ul>
  ),
  // Ordered list
  ol: ({ children }) => (
    <ol className="my-2 ml-1 space-y-1 list-decimal list-inside">{children}</ol>
  ),
  // List item
  li: ({ children }) => (
    <li className="flex gap-2 items-start text-sm leading-relaxed">
      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400" />
      <span>{children}</span>
    </li>
  ),
  // Inline code
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block w-full overflow-x-auto rounded-lg bg-zinc-900 border border-zinc-700/50 px-4 py-3 text-xs font-mono text-purple-200 my-2 leading-relaxed">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded px-1.5 py-0.5 bg-zinc-800 text-purple-300 text-xs font-mono">
        {children}
      </code>
    );
  },
  // Pre (code block wrapper)
  pre: ({ children }) => (
    <pre className="my-2 rounded-lg bg-zinc-900 border border-zinc-700/50 p-0 overflow-hidden">
      {children}
    </pre>
  ),
  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-purple-500/60 pl-4 text-zinc-400 italic">
      {children}
    </blockquote>
  ),
  // Horizontal rule
  hr: () => <hr className="my-3 border-zinc-700/50" />,
  // Link
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-purple-400 underline underline-offset-2 hover:text-purple-300 transition-colors"
    >
      {children}
    </a>
  ),
};

export default function QAPage() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  const sendMessage = async () => {
    const query = input.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const token = await getToken();
      const data = await api.post<RunResponse>(
        token,
        `/runs?query=${encodeURIComponent(query)}`
      );

      const answer =
        data?.answer ||
        data?.response ||
        data?.result ||
        (typeof data === "string" ? data : JSON.stringify(data));

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100vh - 64px)", paddingTop: "64px" }}
    >
      {/* ── Background orbs ── */}
      <div
        className="pointer-events-none fixed -top-24 right-1/4 h-80 w-80 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-1/4 h-64 w-64 rounded-full opacity-8"
        style={{
          background:
            "radial-gradient(circle, rgba(109,40,217,0.35), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* ── Top bar ── */}
      <div className="relative z-10 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15">
              <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <span className="text-sm font-semibold text-white">
              Q&amp;A — Ask Your Documents
            </span>
          </div>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-purple-500/30 hover:text-white transition-all"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload Doc
        </Link>
      </div>

      {/* ── Messages area ── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          // ── Empty state ──
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6 animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Ask your documents anything
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-zinc-500 leading-relaxed">
                Your uploaded and processed PDFs are ready. Type a question below
                and the RAG pipeline will retrieve and answer using your documents.
              </p>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {[
                "What is the main topic of the document?",
                "Summarize the key points.",
                "What conclusions are drawn?",
                "List the important findings.",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-left text-xs text-zinc-400 hover:border-purple-500/30 hover:text-zinc-200 hover:bg-zinc-900 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // ── Chat bubbles ──
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 items-start animate-slide-up ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${
                    msg.role === "user"
                      ? "bg-purple-600"
                      : msg.isError
                      ? "bg-red-900/50"
                      : "bg-zinc-800"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : msg.isError ? (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  ) : (
                    <Bot className="h-4 w-4 text-purple-400" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`flex flex-col gap-1 max-w-[80%] ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white rounded-tr-sm"
                        : msg.isError
                        ? "bg-red-950/60 border border-red-500/20 text-red-300 rounded-tl-sm"
                        : "glass-card !border-zinc-700/40 text-zinc-200 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "user" || msg.isError ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  <span className="text-xs text-zinc-600">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* ── Typing indicator ── */}
            {isLoading && (
              <div className="flex gap-3 items-start animate-slide-up">
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                  <Bot className="h-4 w-4 text-purple-400" />
                </div>
                <div className="glass-card !border-zinc-700/40 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input area ── */}
      <div className="relative z-10 border-t border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl p-4 flex-shrink-0">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-3 rounded-2xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-3 focus-within:border-purple-500/50 transition-colors">
            <textarea
              ref={textareaRef}
              id="qa-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents… (Enter to send, Shift+Enter for newline)"
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none disabled:opacity-50 min-h-[24px] leading-6"
              style={{ maxHeight: "160px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              id="qa-send-btn"
              className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-zinc-600">
            Answers are generated from your uploaded documents using a local RAG pipeline.
          </p>
        </div>
      </div>
    </div>
  );
}

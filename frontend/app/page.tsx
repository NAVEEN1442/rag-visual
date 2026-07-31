import Link from "next/link";
import {
  Zap,
  Layers,
  Play,
  Shield,
  Radio,
  BarChart3,
  Upload,
  Settings2,
  Eye,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const FEATURES = [
  {
    icon: Radio,
    title: "Live Pipeline Tracing",
    description:
      "Watch every stage — parse, chunk, embed, retrieve, generate — execute in real time via Server-Sent Events.",
  },
  {
    icon: Layers,
    title: "Pluggable Strategies",
    description:
      "Swap parsers, chunkers, and embedders from a strategy registry. Compare results without redeploying.",
  },
  {
    icon: Play,
    title: "Stage-by-Stage Replay",
    description:
      "Navigate completed runs with left/right arrows. Inspect input and output snapshots at every stage.",
  },
  {
    icon: Shield,
    title: "Multi-Tenant Isolation",
    description:
      "Per-user Chroma collections, Postgres RLS, and Clerk JWT auth keep every user's data fully isolated.",
  },
  {
    icon: Zap,
    title: "Async Task Queue",
    description:
      "Heavy embedding and LLM work runs on background workers so the API stays fast for every user.",
  },
  {
    icon: BarChart3,
    title: "Cost & Performance Analytics",
    description:
      "Track token usage, latency per stage, and total cost per run. Surface usage dashboards per user.",
  },
];

const STEPS = [
  {
    icon: Upload,
    title: "Upload Your Document",
    description:
      "Upload a PDF, HTML, or scanned document. It's stored securely in Cloudinary and linked to your account.",
  },
  {
    icon: Settings2,
    title: "Configure Your Pipeline",
    description:
      "Pick your parsing, chunking, and embedding strategy. Tweak chunk sizes, overlap, and retriever top-k.",
  },
  {
    icon: Eye,
    title: "Visualize Every Stage",
    description:
      "Fire a query and watch the full RAG pipeline execute live. Replay past runs anytime with full snapshots.",
  },
];

export default function Home() {
  return (
    <>
      {/* ═════════════════════════════════════════════
          HERO SECTION
          ═════════════════════════════════════════════ */}
      <section
        className="hero-gradient relative flex min-h-[92vh] items-center justify-center overflow-hidden pt-20"
        id="hero"
      >
        {/* Decorative floating orbs */}
        <div
          className="pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full opacity-20 animate-float"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.45), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-10 right-1/4 h-56 w-56 rounded-full opacity-15 animate-float"
          style={{
            background:
              "radial-gradient(circle, rgba(109,40,217,0.4), transparent 70%)",
            filter: "blur(70px)",
            animationDelay: "3s",
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Badge */}
          <div className="animate-slide-up mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-300">
            <Zap className="h-3.5 w-3.5" />
            Open-Source RAG Observability
          </div>

          {/* Heading */}
          <h1 className="animate-slide-up delay-100 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            See Inside Your
            <br />
            <span className="gradient-text">RAG Pipeline</span>
          </h1>

          {/* Subtext */}
          <p className="animate-slide-up delay-200 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Trace every stage — parse, chunk, embed, retrieve, generate — live
            in the browser. Compare strategies, replay past runs, and ship
            production-quality RAG with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="animate-slide-up delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="btn-primary px-8 py-3 text-base"
              id="hero-cta-primary"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-8 py-3 text-base"
              id="hero-cta-secondary"
            >
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </a>
          </div>

          {/* Metric badges */}
          <div className="animate-slide-up delay-500 mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500">
            {[
              "7 Pipeline Stages",
              "3+ Strategies Per Stage",
              "Real-time SSE",
              "Full Replay",
            ].map((stat) => (
              <div key={stat} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                {stat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          FEATURES SECTION
          ═════════════════════════════════════════════ */}
      <section className="relative py-28 px-6" id="features">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need for{" "}
              <span className="gradient-text">RAG Observability</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
              From live tracing to strategy comparison — built for engineers who
              want full visibility into their retrieval-augmented generation
              pipelines.
            </p>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card group p-6 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="feature-icon mb-4">
                  <feature.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          HOW IT WORKS
          ═════════════════════════════════════════════ */}
      <section
        className="relative py-28 px-6 border-t border-zinc-800/50"
        id="how-it-works"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Three steps from document to full pipeline visualization.
            </p>
          </div>

          <div className="mt-16 flex flex-col items-center gap-4">
            {STEPS.map((step, i) => (
              <div key={step.title}>
                <div
                  className="glass-card flex items-start gap-6 p-6 sm:p-8 animate-slide-up"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="step-number flex-shrink-0">{i + 1}</div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <step.icon className="h-4 w-4 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                </div>
                {i < STEPS.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          CTA SECTION
          ═════════════════════════════════════════════ */}
      <section className="relative py-28 px-6" id="cta">
        <div className="mx-auto max-w-3xl">
          <div
            className="glass-card relative overflow-hidden p-10 text-center sm:p-14"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(139,92,246,0.06), rgba(17,17,19,0.8))",
            }}
          >
            {/* Decorative glow */}
            <div
              className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full opacity-30"
              style={{
                background:
                  "radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)",
                filter: "blur(60px)",
              }}
            />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to{" "}
                <span className="gradient-text">Visualize Your Pipeline?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-zinc-400">
                Sign up, upload a document, configure your strategy, and watch
                every RAG stage execute in real time.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="btn-primary px-8 py-3 text-base"
                  id="cta-primary"
                >
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-8 py-3 text-base"
                  id="cta-secondary"
                >
                  <ExternalLink className="h-4 w-4" />
                  Star on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          FOOTER
          ═════════════════════════════════════════════ */}
      <footer className="border-t border-zinc-800/50 py-12 px-6" id="footer">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-purple-500">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-zinc-400">
              RAG Visualizer
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a
              href="#features"
              className="transition-colors hover:text-white"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-white"
            >
              How It Works
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              GitHub
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} RAG Visualizer. All rights
            reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

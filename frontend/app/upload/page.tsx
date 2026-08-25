"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft,
  Cpu,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";

type UploadStage =
  | "idle"
  | "uploading"
  | "processing"
  | "done"
  | "error";

interface UploadedDocument {
  id: string;
  file_name: string;
  file_url: string;
}

export default function UploadPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [stage, setStage] = useState<UploadStage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (chosen: File) => {
    if (chosen.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    setError(null);
    setFile(chosen);
  };

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    []
  );

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const removeFile = () => {
    setFile(null);
    setError(null);
    setStage("idle");
    setUploadedDoc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadAndProcess = async () => {
    if (!file) return;
    setError(null);

    try {
      // ── Step 1: Upload ──────────────────────────────
      setStage("uploading");
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", file);

      const doc = await api.post<UploadedDocument>(
        token,
        "/document-upload",
        formData
      );
      setUploadedDoc(doc);

      // ── Step 2: Process (chunk + embed) ─────────────
      setStage("processing");
      const fileUrl = doc.file_url;
      const documentId = doc.id;

      await api.get(
        token,
        `/documents/process?file_path=${encodeURIComponent(fileUrl)}&document_id=${encodeURIComponent(documentId)}`
      );

      setStage("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setStage("error");
    }
  };

  // ── Stage label helpers ──────────────────────────
  const stageLabel: Record<UploadStage, string> = {
    idle: "Ready to upload",
    uploading: "Uploading to storage…",
    processing: "Processing — chunking & embedding…",
    done: "Done! Your document is ready to query.",
    error: "Something went wrong.",
  };

  const stageProgress: Record<UploadStage, number> = {
    idle: 0,
    uploading: 40,
    processing: 80,
    done: 100,
    error: 0,
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 relative">
      {/* ── Background orbs ── */}
      <div
        className="pointer-events-none fixed -top-32 left-1/4 h-96 w-96 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 right-1/4 h-72 w-72 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(109,40,217,0.35), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl">
        {/* ── Back link ── */}
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* ── Heading ── */}
        <div className="mb-8 animate-slide-up">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300">
            <Sparkles className="h-3 w-3" />
            Upload & Process
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Upload Your{" "}
            <span className="gradient-text">Document</span>
          </h1>
          <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
            Drop a PDF below. It will be uploaded, automatically chunked, and
            embedded into your vector store — ready for Q&amp;A in seconds.
          </p>
        </div>

        {/* ── Drop zone ── */}
        <div
          className={`glass-card p-1 animate-slide-up delay-100 transition-all duration-300 ${
            isDragging ? "border-purple-500/60 shadow-lg shadow-purple-900/30" : ""
          }`}
        >
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed py-12 px-6 text-center transition-all duration-200 cursor-pointer ${
              isDragging
                ? "border-purple-500/70 bg-purple-500/10"
                : file
                ? "border-purple-500/30 bg-purple-500/5 cursor-default"
                : "border-zinc-700/60 hover:border-purple-500/40 hover:bg-purple-500/5"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {file ? (
              // ── Selected file preview ──
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/15 ring-1 ring-purple-500/25">
                  <FileText className="h-7 w-7 text-purple-400" />
                </div>
                <div className="text-sm font-medium text-white truncate max-w-xs">
                  {file.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                {stage === "idle" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-zinc-400" />
                  </button>
                )}
              </div>
            ) : (
              // ── Empty state ──
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20 transition-transform group-hover:scale-110">
                  <Upload className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Drag &amp; drop your PDF here
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    or{" "}
                    <span className="text-purple-400 hover:underline cursor-pointer">
                      browse files
                    </span>
                    {" "}— PDF only, max 50 MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-slide-up">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Progress bar (shown while uploading / processing) ── */}
        {(stage === "uploading" || stage === "processing" || stage === "done") && (
          <div className="mt-6 animate-slide-up">
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                {stage === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
                )}
                {stageLabel[stage]}
              </span>
              <span>{stageProgress[stage]}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${stageProgress[stage]}%`,
                  background: "linear-gradient(90deg, #7c3aed, #8b5cf6, #a78bfa)",
                }}
              />
            </div>
          </div>
        )}

        {/* ── Stage cards ── */}
        <div className="mt-6 grid grid-cols-2 gap-3 animate-slide-up delay-200">
          {/* Upload card */}
          <div
            className={`glass-card p-4 flex items-center gap-3 transition-all duration-300 ${
              stage === "uploading"
                ? "border-purple-500/40 shadow-purple-900/20 shadow-lg"
                : stage === "processing" || stage === "done"
                ? "border-emerald-500/25"
                : ""
            }`}
          >
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                stage === "uploading"
                  ? "bg-purple-500/20"
                  : stage === "processing" || stage === "done"
                  ? "bg-emerald-500/15"
                  : "bg-zinc-800"
              }`}
            >
              {stage === "processing" || stage === "done" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : stage === "uploading" ? (
                <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 text-zinc-500" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Upload</p>
              <p className="text-xs text-zinc-500">Store PDF securely</p>
            </div>
          </div>

          {/* Process card */}
          <div
            className={`glass-card p-4 flex items-center gap-3 transition-all duration-300 ${
              stage === "processing"
                ? "border-purple-500/40 shadow-purple-900/20 shadow-lg"
                : stage === "done"
                ? "border-emerald-500/25"
                : ""
            }`}
          >
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                stage === "processing"
                  ? "bg-purple-500/20"
                  : stage === "done"
                  ? "bg-emerald-500/15"
                  : "bg-zinc-800"
              }`}
            >
              {stage === "done" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : stage === "processing" ? (
                <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
              ) : (
                <Cpu className="h-4 w-4 text-zinc-500" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Process</p>
              <p className="text-xs text-zinc-500">Chunk &amp; embed</p>
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="mt-6 flex gap-3 animate-slide-up delay-300">
          {stage === "done" ? (
            <>
              <Link href="/qa" className="btn-primary flex-1 py-3 text-sm justify-center">
                <Sparkles className="h-4 w-4" />
                Ask Questions Now
              </Link>
              <button
                onClick={removeFile}
                className="btn-secondary py-3 px-5 text-sm"
              >
                Upload Another
              </button>
            </>
          ) : (
            <button
              onClick={handleUploadAndProcess}
              disabled={!file || stage === "uploading" || stage === "processing"}
              className="btn-primary flex-1 py-3 text-sm justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              id="upload-process-btn"
            >
              {stage === "uploading" || stage === "processing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {stage === "uploading" ? "Uploading…" : "Processing…"}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload &amp; Process
                </>
              )}
            </button>
          )}
        </div>

        {/* ── Success state ── */}
        {stage === "done" && uploadedDoc && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 animate-slide-up">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              <span className="font-semibold">Document processed!</span> Your PDF has
              been chunked and embedded into the vector store. Head over to Q&amp;A to
              start asking questions.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

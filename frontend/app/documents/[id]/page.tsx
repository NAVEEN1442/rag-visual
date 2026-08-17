'use client'

import { useEffect, useState, type ChangeEvent } from "react"
import { useAuth } from "@clerk/nextjs"
import { DocumentAPI } from "@/lib/endpoint"
import { GetDocument } from "@/lib/types"
import {
    FileText,
    ExternalLink,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    FolderOpen,
    FileType,
    Hash,
    Upload,
    X,
    FileUp,
} from "lucide-react"

/* ── Helpers ────────────────────────────────── */

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    })
}

/** Extract the original filename from the storage path  (user_id/uuid.ext) */
function displayName(filePath: string) {
    const parts = filePath.split("/")
    return parts[parts.length - 1]
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ── Status badge ───────────────────────────── */

const STATUS_MAP: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    uploaded: {
        label: "Uploaded",
        color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    processing: {
        label: "Processing",
        color: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    },
    failed: {
        label: "Failed",
        color: "bg-red-500/10 text-red-400 border border-red-500/20",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
    },
}

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_MAP[status] ?? {
        label: status,
        color: "bg-zinc-700/40 text-zinc-400 border border-zinc-700",
        icon: <Clock className="h-3.5 w-3.5" />,
    }
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
        >
            {cfg.icon}
            {cfg.label}
        </span>
    )
}

/* ── Skeleton ───────────────────────────────── */

function SkeletonCard() {
    return (
        <div className="glass-card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="skeleton h-10 w-10 rounded-xl" />
                    <div className="flex flex-col gap-2">
                        <div className="skeleton h-4 w-40" />
                        <div className="skeleton h-3 w-24" />
                    </div>
                </div>
                <div className="skeleton h-6 w-20 rounded-full" />
            </div>
            <div className="skeleton h-px w-full" />
            <div className="flex gap-4">
                <div className="skeleton h-3 w-28" />
                <div className="skeleton h-3 w-20" />
            </div>
        </div>
    )
}

/* ── Empty state ────────────────────────────── */

function EmptyState() {
    return (
        <div
            className="glass-card flex flex-col items-center justify-center py-20 gap-5 text-center animate-fade-in"
            id="documents-empty"
        >
            <div
                className="flex items-center justify-center h-20 w-20 rounded-2xl"
                style={{ background: "rgba(139,92,246,0.12)" }}
            >
                <FolderOpen className="h-9 w-9 text-purple-400" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-1">No documents yet</h3>
                <p className="text-sm text-zinc-400 max-w-sm">
                    Upload your first PDF or document from the dashboard to start building your RAG pipeline.
                </p>
            </div>
        </div>
    )
}

/* ── Document Card ──────────────────────────── */

function DocumentCard({ doc, index }: { doc: GetDocument; index: number }) {
    const name = displayName(doc.file_name)

    return (
        <div
            className="glass-card p-5 flex flex-col gap-4 animate-slide-up"
            style={{ animationDelay: `${index * 60}ms` }}
            id={`doc-card-${doc.id}`}
        >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Icon */}
                    <div
                        className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl"
                        style={{ background: "rgba(139,92,246,0.12)" }}
                    >
                        <FileText className="h-5 w-5 text-purple-400" />
                    </div>

                    {/* Name + mime */}
                    <div className="min-w-0">
                        <p
                            className="text-sm font-semibold text-white truncate leading-tight"
                            title={name}
                        >
                            {name}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                            <FileType className="h-3 w-3" />
                            {doc.mime_type.toUpperCase()}
                        </p>
                    </div>
                </div>

                <StatusBadge status={doc.status} />
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                    <Hash className="h-3 w-3 text-purple-400/60" />
                    <span className="font-mono truncate max-w-[140px]" title={doc.id}>
                        {doc.id.slice(0, 8)}&hellip;
                    </span>
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-purple-400/60" />
                    {formatDate(doc.created_at)} &middot; {formatTime(doc.created_at)}
                </span>
            </div>

            {/* Actions row */}
            <div className="flex items-center gap-2 mt-1">
                <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    id={`doc-open-${doc.id}`}
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open File
                </a>
            </div>
        </div>
    )
}

/* ── Stats bar ──────────────────────────────── */

function StatsBar({ docs }: { docs: GetDocument[] }) {
    const total = docs.length
    const uploaded = docs.filter((d) => d.status === "uploaded").length
    const processing = docs.filter((d) => d.status === "processing").length
    const failed = docs.filter((d) => d.status === "failed").length

    const stats = [
        { label: "Total", value: total, color: "text-white" },
        { label: "Uploaded", value: uploaded, color: "text-emerald-400" },
        { label: "Processing", value: processing, color: "text-amber-400" },
        { label: "Failed", value: failed, color: "text-red-400" },
    ]

    return (
        <div
            className="glass-card p-5 mb-6 animate-slide-up delay-100"
            id="documents-stats"
        >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500">{s.label}</span>
                        <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ── Upload Modal ───────────────────────────── */

function UploadModal({
    onClose,
    onUpload,
    uploading,
    uploadError,
    selectedFile,
    onFileChange,
    onClearFile,
}: {
    onClose: () => void
    onUpload: () => void
    uploading: boolean
    uploadError: string | null
    selectedFile: File | null
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
    onClearFile: () => void
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in"
            onClick={() => !uploading && onClose()}
            id="upload-modal-backdrop"
        >
            <div
                className="glass-card w-full max-w-md p-6 flex flex-col gap-5 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                id="upload-modal"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl"
                            style={{ background: "rgba(139,92,246,0.15)" }}
                        >
                            <Upload className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-white leading-tight">
                                Upload document
                            </h3>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Add a single file to your RAG pipeline
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="text-zinc-500 hover:text-white transition-colors disabled:opacity-40"
                        id="upload-modal-close"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* File picker */}
                {selectedFile ? (
                    <div
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                        id="upload-selected-file"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg"
                                style={{ background: "rgba(139,92,246,0.12)" }}
                            >
                                <FileText className="h-4 w-4 text-purple-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate" title={selectedFile.name}>
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        {!uploading && (
                            <button
                                onClick={onClearFile}
                                className="flex-shrink-0 text-zinc-500 hover:text-red-400 transition-colors"
                                id="upload-clear-file"
                                aria-label="Remove selected file"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <label
                        htmlFor="document-file-input"
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-9 px-4 cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-colors"
                        id="upload-dropzone"
                    >
                        <FileUp className="h-7 w-7 text-purple-400/70" />
                        <p className="text-sm text-zinc-300">Click to choose a file</p>
                        <p className="text-xs text-zinc-500">Only one file at a time</p>
                    </label>
                )}

                <input
                    id="document-file-input"
                    type="file"
                    className="hidden"
                    onChange={onFileChange}
                    disabled={uploading}
                />

                {uploadError && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5" id="upload-error">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {uploadError}
                    </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-1">
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
                        id="upload-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onUpload}
                        disabled={uploading || !selectedFile}
                        className="flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-lg text-white bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/30 disabled:cursor-not-allowed transition-colors"
                        id="upload-submit"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Uploading&hellip;
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Upload
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ── Page ───────────────────────────────────── */

export default function AllDocuments() {
    const { getToken } = useAuth()
    const [docData, setDocData] = useState<GetDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [uploadModel, setUploadModel] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const openUploadModal = () => {
        setSelectedFile(null)
        setUploadError(null)
        setUploadModel(true)
    }

    const closeUploadModal = () => {
        setUploadModel(false)
        setSelectedFile(null)
        setUploadError(null)
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setSelectedFile(file)
        setUploadError(null)
    }

    const uploadDocument = async () => {
        if (!selectedFile) {
            setUploadError("Please choose a file to upload.")
            return
        }

        setUploading(true)
        setUploadError(null)
        try {
            const token = await getToken()

            const formData = new FormData()
            formData.append("file", selectedFile)

            const response = await DocumentAPI.UploadDocuments(token, formData)
            console.log(response)
            if (response) {
                setUploadModel(false)
                setSelectedFile(null)
                await getAllDocuments()
            } else {
                setUploadError("Upload failed. Please try again.")
            }
        } catch (error) {
            console.log(error)
            setUploadError("Upload failed. Please try again.")
        } finally {
            setUploading(false)
        }
    }

    const getAllDocuments = async () => {
        setLoading(true)
        setError(null)
        try {
            const token = await getToken()
            const response = await DocumentAPI.GetDocuments(token)
            setDocData(Array.isArray(response) ? response : [response])
            console.log("rendered", response)
        } catch (err) {
            console.error("get all docs:", err)
            setError("Failed to load documents. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getAllDocuments()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        console.log(docData)

    }, [docData])

    return (
        <div className="min-h-screen pt-24 pb-16 px-6">
            {/* ── Background orbs ── */}
            <div
                className="pointer-events-none fixed -top-32 right-1/4 h-96 w-96 rounded-full opacity-15"
                style={{
                    background: "radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)",
                    filter: "blur(100px)",
                }}
            />
            <div
                className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full opacity-10"
                style={{
                    background: "radial-gradient(circle, rgba(109,40,217,0.3), transparent 70%)",
                    filter: "blur(80px)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-6xl">

                {/* ── Page Header ── */}
                <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-up"
                    id="documents-header"
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center justify-center h-12 w-12 rounded-2xl flex-shrink-0"
                            style={{ background: "rgba(139,92,246,0.15)" }}
                        >
                            <FileText className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                My{" "}
                                <span className="gradient-text">Documents</span>
                            </h1>
                            <p className="text-sm text-zinc-400 mt-0.5">
                                All files uploaded to your RAG pipeline
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-2">
                        <button
                            onClick={openUploadModal}
                            disabled={loading}
                            className="btn-secondary flex items-center gap-2 self-start sm:self-auto"
                            id="documents-upload-trigger"
                        >
                            <Upload className="h-4 w-4" />
                            Upload Document
                        </button>

                        {/* Refresh */}
                        <button
                            onClick={getAllDocuments}
                            disabled={loading}
                            className="btn-secondary flex items-center gap-2 self-start sm:self-auto"
                            id="documents-refresh"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* ── Error banner ── */}
                {error && (
                    <div
                        className="glass-card p-4 mb-6 flex items-center gap-3 border border-red-500/20 animate-slide-up"
                        id="documents-error"
                    >
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                        <button
                            onClick={getAllDocuments}
                            className="ml-auto text-xs text-red-400 underline underline-offset-2 hover:text-red-300 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Stats bar (only when loaded and data present) ── */}
                {!loading && !error && docData.length > 0 && <StatsBar docs={docData} />}

                {/* ── Content ── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="documents-skeleton">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : !error && docData.length === 0 ? (
                    <EmptyState />
                ) : !error ? (
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        id="documents-grid"
                    >
                        {docData.map((doc, i) => (
                            <DocumentCard key={doc.id} doc={doc} index={i} />
                        ))}
                    </div>
                ) : null}
            </div>

            {uploadModel && (
                <UploadModal
                    onClose={closeUploadModal}
                    onUpload={uploadDocument}
                    uploading={uploading}
                    uploadError={uploadError}
                    selectedFile={selectedFile}
                    onFileChange={handleFileChange}
                    onClearFile={() => setSelectedFile(null)}
                />
            )}
        </div>
    )
}
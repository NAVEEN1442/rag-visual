"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Upload,
  Settings2,
  Eye,
  FileText,
  Cpu,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Mail,
  User,
  Zap,
} from "lucide-react";

interface BackendProfile {
  user_id: string;
  email: string | null;
  created_at: string | null;
}

interface BackendStatus {
  connected: boolean;
  profile: BackendProfile | null;
  error: string | null;
}

const QUICK_ACTIONS = [
  {
    icon: Upload,
    title: "Upload Document",
    description:
      "Upload a PDF, HTML, or scanned document to start processing through your RAG pipeline.",
    href: "#",
    color: "rgba(139, 92, 246, 0.15)",
  },
  {
    icon: Settings2,
    title: "Configure Pipeline",
    description:
      "Select your parsing, chunking, and embedding strategies. Fine-tune every parameter.",
    href: "#",
    color: "rgba(109, 40, 217, 0.15)",
  },
  {
    icon: Eye,
    title: "View Runs",
    description:
      "Browse completed pipeline runs. Replay and inspect every stage with full snapshots.",
    href: "#",
    color: "rgba(167, 139, 250, 0.15)",
  },
];

const STATS = [
  { icon: FileText, label: "Documents", value: 0 },
  { icon: Cpu, label: "Pipeline Configs", value: 0 },
  { icon: Activity, label: "Total Runs", value: 0 },
];



export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { userId, getToken } = useAuth();
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    connected: false,
    profile: null,
    error: null,
  });
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  async function handleDocumentRoute() {

    try {
      console.log(userId)
      router.push(`documents/${userId}`);

    } catch (error) {
      console.log("error redirecting to user id/documents")
      throw error;
    }

  }

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchBackendProfile = async () => {
      try {
        const token = await getToken();

        if (!token) {
          setBackendStatus({
            connected: false,
            profile: null,
            error: "No auth token available",
          });
          setLoading(false);
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setBackendStatus({
            connected: true,
            profile: data.user,
            error: null,
          });
        } else {
          setBackendStatus({
            connected: false,
            profile: null,
            error: `Backend returned ${res.status}`,
          });
        }
      } catch (err) {
        setBackendStatus({
          connected: false,
          profile: null,
          error: "Could not reach backend",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBackendProfile();
  }, [isLoaded, user, getToken]);

  // ── Loading state ──
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Skeleton header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="skeleton h-16 w-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <div className="skeleton h-7 w-48" />
              <div className="skeleton h-4 w-64" />
            </div>
          </div>
          {/* Skeleton cards */}
          <div className="dashboard-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-28" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    user?.fullName || user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User";
  const displayEmail =
    backendStatus.profile?.email || user?.emailAddresses?.[0]?.emailAddress || "—";
  const memberSince = backendStatus.profile?.created_at
    ? new Date(backendStatus.profile.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    : user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
      : "—";



  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      {/* Decorative background orbs */}
      <div
        className="pointer-events-none fixed -top-32 right-1/4 h-96 w-96 rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(109,40,217,0.3), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ═══════════════════════════════════════════
            WELCOME HEADER
            ═══════════════════════════════════════════ */}
        <div className="flex items-center gap-5 mb-10 animate-slide-up" id="dashboard-header">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                className="h-16 w-16 rounded-full ring-2 ring-purple-500/30 object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white text-xl font-bold ring-2 ring-purple-500/30">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#09090b]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back,{" "}
              <span className="gradient-text">{displayName}</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Your RAG pipeline workspace is ready. Let&apos;s build something great.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            PROFILE + STATUS CARD
            ═══════════════════════════════════════════ */}
        <div
          className="glass-card p-6 mb-8 animate-slide-up delay-100"
          id="dashboard-profile-card"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Profile info */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Mail className="h-4 w-4 text-purple-400" />
                <span>{displayEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <User className="h-4 w-4 text-purple-400" />
                <span className="font-mono text-xs">
                  {backendStatus.profile?.user_id || user?.id || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span>Member since {memberSince}</span>
              </div>
            </div>

            {/* Backend connection status */}
            <div className="flex items-center gap-2">
              {backendStatus.connected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">
                    Backend Connected
                  </span>
                  <span className=" border-2 p-2 " onClick={handleDocumentRoute} >
                    Documents
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-amber-400 font-medium">
                    {backendStatus.error || "Backend Offline"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            STATS OVERVIEW
            ═══════════════════════════════════════════ */}
        <div className="dashboard-grid mb-8" id="dashboard-stats">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="stat-card animate-slide-up"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-zinc-400">
                  {stat.label}
                </span>
                <stat.icon className="h-5 w-5 text-purple-400/60" />
              </div>
              <div className="stat-value">{stat.value}</div>
              <p className="text-xs text-zinc-500 mt-2">
                No {stat.label.toLowerCase()} yet
              </p>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            QUICK ACTIONS
            ═══════════════════════════════════════════ */}
        <div className="mb-6 animate-slide-up delay-500">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            Quick Actions
          </h2>
        </div>
        <div className="dashboard-grid" id="dashboard-actions">
          {QUICK_ACTIONS.map((action, i) => (
            <a
              key={action.title}
              href={action.href}
              className="quick-action animate-slide-up"
              style={{ animationDelay: `${600 + i * 100}ms` }}
            >
              <div
                className="quick-action-icon"
                style={{ background: action.color }}
              >
                <action.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {action.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-purple-400 mt-auto">
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

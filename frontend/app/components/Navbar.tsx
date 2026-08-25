"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { Menu, X, Zap, Upload, MessageSquare } from "lucide-react";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <header
      className={`navbar-glass fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "scrolled" : ""
        }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group" id="nav-logo">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-500 shadow-lg shadow-purple-500/20 transition-transform duration-200 group-hover:scale-105">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            RAG<span className="gradient-text ml-0.5">Visualizer</span>
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden items-center gap-8 md:flex" id="nav-desktop-links">
          {["Features", "How It Works"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>

        {/* ── Desktop auth buttons ── */}
        <div className="hidden items-center gap-3 md:flex" id="nav-desktop-auth">
          {isLoaded && !isSignedIn && (
            <>
              <Link
                href="/log-in"
                className="btn-secondary text-sm px-4 py-2"
                id="nav-sign-in"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="btn-primary text-sm px-5 py-2"
                id="nav-get-started"
              >
                Get Started
              </Link>
            </>
          )}
          {isLoaded && isSignedIn && (
            <>
              <Link
                href="/upload"
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-white"
                id="nav-upload"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </Link>
              <Link
                href="/qa"
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-white"
                id="nav-qa"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Q&amp;A
              </Link>
              <Link
                href="/dashboard"
                className="btn-secondary text-sm px-4 py-2"
                id="nav-dashboard"
              >
                Dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-purple-500/30",
                  },
                }}
              />
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white md:hidden"
          aria-label="Toggle menu"
          id="nav-mobile-toggle"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="animate-slide-down border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl md:hidden" id="nav-mobile-menu">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {["Features", "How It Works"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
              >
                {label}
              </a>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-zinc-800/50 pt-4">
              {isLoaded && !isSignedIn && (
                <>
                  <Link
                    href="/log-in"
                    onClick={() => setMobileOpen(false)}
                    className="btn-secondary w-full justify-center py-2.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary w-full justify-center py-2.5"
                  >
                    Get Started
                  </Link>
                </>
              )}
              {isLoaded && isSignedIn && (
                <>
                  <Link
                    href="/upload"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </Link>
                  <Link
                    href="/qa"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Q&A
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary w-full justify-center py-2.5"
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

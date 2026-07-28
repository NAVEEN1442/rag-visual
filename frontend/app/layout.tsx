import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./components/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RAG Visualizer — See Inside Your RAG Pipeline",
  description:
    "A multi-tenant, observable RAG platform where every pipeline stage is traced, persisted, and replayable — with user-selectable strategies at each stage.",
  keywords: [
    "RAG",
    "retrieval augmented generation",
    "pipeline visualization",
    "LLM",
    "embeddings",
    "vector search",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#8b5cf6",
        },
      }}
    >
      <html lang="en" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-50">
          <Navbar />
          <main className="flex-1">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexProvider } from "./providers";
import { AppShell } from "@/components/app-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BagBros Mission Control",
  description: "Collaborative AI orchestration — connect your agent, contribute compute, earn rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-900 text-zinc-100`}>
        <ConvexProvider>
          <AppShell>{children}</AppShell>
        </ConvexProvider>
      </body>
    </html>
  );
}
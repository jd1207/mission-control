"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

// Pages that should NOT show the sidebar (standalone pages)
const STANDALONE_PAGES = ["/connect", "/claim"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_PAGES.some((p) => pathname.startsWith(p));

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/tasks", label: "Tasks", icon: "📋" },
  { href: "/agents", label: "Agents", icon: "🤖" },
  { href: "/pool", label: "Pool Workers", icon: "⚡" },
  { href: "/activity", label: "Activity", icon: "📈" },
  { href: "/connect", label: "Connect", icon: "🔌" },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-orange-900/20 bg-[#1A1410] flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-orange-900/20">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-ember">Mission</span>
          <span className="text-warm-gold ml-1.5">Control</span>
        </h1>
        <p className="text-[11px] text-orange-800/60 mt-0.5 tracking-wider uppercase">collaborative vibe coding</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-ember/10 text-ember"
                  : "text-orange-200/40 hover:bg-orange-900/10 hover:text-orange-100/80"
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-orange-900/20">
        <p className="text-[10px] text-orange-900/40">v2.0 • powered by OpenClaw</p>
      </div>
    </aside>
  );
}
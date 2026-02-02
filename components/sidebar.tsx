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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-zinc-800/60 bg-zinc-950 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-zinc-800/60">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-emerald-400">Bag</span>
          <span className="text-zinc-100">Bros</span>
        </h1>
        <p className="text-[11px] text-zinc-600 mt-0.5 tracking-wider uppercase">Mission Control</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-zinc-800/60">
        <p className="text-[10px] text-zinc-700">v2.0 • powered by OpenClaw</p>
      </div>
    </aside>
  );
}

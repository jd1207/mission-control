import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "error";
  children: React.ReactNode;
}

const variantStyles = {
  default: "bg-zinc-800 text-zinc-100",
  secondary: "bg-zinc-700 text-zinc-200",
  success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  error: "bg-red-500/10 text-red-500 border border-red-500/20",
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
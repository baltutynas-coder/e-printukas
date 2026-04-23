/**
 * Badge primitive — maži žymekliai (angl. „badges" / „chips").
 * „NAUJIENA" / „-30%" / „Sandėlyje" / „Min. 10 vnt" ženkliukai.
 * Mažas, griežtas, ALL CAPS — TRUEWERK techniškumas.
 */

import { ReactNode } from "react";

interface BadgeProps {
  tone?: "default" | "accent" | "hi-vis" | "success" | "warning" | "error";
  variant?: "solid" | "outline";
  size?: "sm" | "md";
  children: ReactNode;
  className?: string;
}

const solidStyles = {
  default: "bg-graphite text-paper",
  accent: "bg-accent text-white",
  "hi-vis": "bg-hi-vis text-ink",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  error: "bg-error text-white",
};

const outlineStyles = {
  default: "bg-transparent text-ink border border-line-strong",
  accent: "bg-accent-soft text-accent-dark border border-accent",
  "hi-vis": "bg-transparent text-warning border border-hi-vis",
  success: "bg-success-soft text-success border border-success",
  warning: "bg-transparent text-warning border border-warning",
  error: "bg-error-soft text-error border border-error",
};

const sizeStyles = {
  sm: "h-5 px-1.5 text-[10px]",
  md: "h-6 px-2 text-xs",
};

export function Badge({
  tone = "default",
  variant = "solid",
  size = "md",
  children,
  className = "",
}: BadgeProps) {
  const variantStyles = variant === "solid" ? solidStyles : outlineStyles;

  const baseClasses =
    "inline-flex items-center justify-center rounded-sm " +
    "font-display font-medium uppercase tracking-wider " +
    "whitespace-nowrap";

  return (
    <span className={`${baseClasses} ${variantStyles[tone]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}

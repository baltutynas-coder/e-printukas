/**
 * Button primitive — pagrindinis mygtukų komponentas.
 *
 * 3 variantai (intent):
 *   - primary:   oranžinis CTA, pagrindiniai veiksmai („Pridėti į krepšelį")
 *   - secondary: juodas ink, antriniai veiksmai („Peržiūrėti visus")
 *   - ghost:     skaidrus su borderiu, trečiaeiliai veiksmai („Išvalyti filtrus")
 *
 * 3 dydžiai: sm (32px), md (44px default), lg (56px hero CTA).
 * Pilnai a11y (focus-visible ring, disabled state, aria-label palaikymas).
 */

"use client";

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

// Intent stiliai — naudojame Tailwind v4 native klases (generuojamos iš @theme)
const intentStyles = {
  primary:
    "bg-accent text-white hover:bg-accent-dark active:bg-accent-dark shadow-accent",
  secondary:
    "bg-ink text-paper hover:bg-graphite active:bg-graphite",
  ghost:
    "bg-transparent text-ink border border-line-strong " +
    "hover:bg-ink hover:text-paper hover:border-ink",
};

const sizeStyles = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-base gap-2",
  lg: "h-14 px-7 text-lg gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      intent = "primary",
      size = "md",
      fullWidth = false,
      iconLeft,
      iconRight,
      loading = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-display font-medium " +
      "tracking-tight whitespace-nowrap rounded-md transition-all duration-200 " +
      "focus-vis
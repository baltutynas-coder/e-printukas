"use client";

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

// Intent stiliai — Tailwind v4 native klasės (generuojamos iš @theme)
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
      "focus-visible:outline-none focus-visible:ring-2 " +
      "focus-visible:ring-accent focus-visible:ring-offset-2 " +
      "focus-visible:ring-offset-paper " +
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none " +
      "active:scale-[0.98]";

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseClasses} ${intentStyles[intent]} ${sizeStyles[size]} ${widthClass} ${className}`}
        {...props}
      >
        {!loading && iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}

        {loading && (
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0"
            aria-hidden="true"
          />
        )}

        <span>{children}</span>

        {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

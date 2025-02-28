import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// Define button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles applied to all buttons
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#D4C6A1] via-[#BFB28F] to-[#A69A78] text-black hover:brightness-110 active:brightness-90 active:scale-[0.98]",
        secondary:
          "bg-white/10 text-white hover:bg-white/20 active:bg-white/15 active:scale-[0.98]",
        outline:
          "border border-white/20 bg-transparent text-white hover:bg-white/10 active:bg-white/5 active:scale-[0.98]",
        ghost:
          "bg-transparent text-white hover:bg-white/10 active:bg-white/5 active:scale-[0.98]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 active:scale-[0.98]",
        // Keep the existing gold variant
        gold: "bg-gradient-to-r from-[var(--gold-from)] via-[var(--gold-accent)] to-[var(--gold-to)] text-black font-medium hover:brightness-110",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        sm: "h-9 px-3 rounded-md",
        default: "h-10 px-4 py-2",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Define the Button component props
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// Create the Button component
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

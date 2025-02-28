import React from "react";
import { cn } from "../../lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
}

/**
 * Logo component for Paradyze2
 * Uses the gold logo from public/ParadyzeLogoGold.webp
 */
export function Logo({ className, size = "md", withText = true }: LogoProps) {
  // Size mapping
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
    xl: "h-16",
  };

  return (
    <div className={cn("flex items-center", className)}>
      {/* Logo image - using absolute path to ensure it works */}
      <img 
        src="/ParadyzeLogoGold.webp" 
        alt="Paradyze Logo" 
        className={cn(sizeClasses[size], "object-contain")}
        onError={(e) => {
          console.error("Logo failed to load");
          // Fallback to text if image fails to load
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      
      {/* Optional text */}
      {withText && (
        <span className={cn(
          "ml-2 font-semibold gold-gradient-text",
          {
            "text-lg": size === "sm",
            "text-xl": size === "md",
            "text-2xl": size === "lg",
            "text-3xl": size === "xl",
          }
        )}>
          Paradyze
        </span>
      )}
    </div>
  );
}

/**
 * Animated logo variant that pulses slightly
 */
export function AnimatedLogo(props: LogoProps) {
  return (
    <div className="animate-pulse-subtle">
      <Logo {...props} />
    </div>
  );
}

// For backward compatibility with existing imports
export default Logo;

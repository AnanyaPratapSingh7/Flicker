import React from "react";
import { cn } from "../../lib/utils";

// Base GlassCard component
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  noHoverEffect?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, noHoverEffect = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass effect
          "glass relative rounded-xl overflow-hidden",
          // Glass styling
          "bg-black/40 backdrop-blur-xl border border-white/5",
          // Shadow and other effects
          "shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2)]",
          // Hover effect
          !noHoverEffect && "transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
          className
        )}
        {...props}
      >
        {/* Haptic border effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top light edge */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-b from-white/15 via-white/[0.02] to-transparent" />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[#1A1A1F] opacity-20" />
          
          {/* Middle gradient */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 via-transparent to-transparent opacity-25" />
          
          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#13151C] via-transparent to-transparent opacity-50" />
        </div>
        
        {/* Card content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

// Card Header component
interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

const GlassCardHeader = React.forwardRef<HTMLDivElement, GlassCardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-4 border-b border-white/[0.03]", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCardHeader.displayName = "GlassCardHeader";

// Card Title component
interface GlassCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: React.ReactNode;
}

const GlassCardTitle = React.forwardRef<HTMLHeadingElement, GlassCardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-xl font-semibold text-white", className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

GlassCardTitle.displayName = "GlassCardTitle";

// Card Description component
interface GlassCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

const GlassCardDescription = React.forwardRef<HTMLParagraphElement, GlassCardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-white/70", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

GlassCardDescription.displayName = "GlassCardDescription";

// Card Content component
interface GlassCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

const GlassCardContent = React.forwardRef<HTMLDivElement, GlassCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCardContent.displayName = "GlassCardContent";

// Card Footer component
interface GlassCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

const GlassCardFooter = React.forwardRef<HTMLDivElement, GlassCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-4 border-t border-white/[0.03]", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCardFooter.displayName = "GlassCardFooter";

// Info Card component for displaying label-value pairs
interface GlassInfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  label: string;
  value: React.ReactNode;
}

const GlassInfoCard = React.forwardRef<HTMLDivElement, GlassInfoCardProps>(
  ({ className, label, value, ...props }, ref) => {
    return (
      <GlassCard 
        ref={ref} 
        className={cn("p-3", className)} 
        {...props}
      >
        <div className="text-xs text-white/60 mb-1">{label}</div>
        <div className="text-lg font-medium">{value}</div>
      </GlassCard>
    );
  }
);

GlassInfoCard.displayName = "GlassInfoCard";

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
  GlassInfoCard,
};

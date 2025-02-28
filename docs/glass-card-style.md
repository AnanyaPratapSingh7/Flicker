# Glass Card Style Guide

This document outlines the standardized glass card style used across the AgentPad application.

## Basic Structure

```jsx
<div className="group relative">
  {/* Haptic Border Effect Layers */}
  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-white/15 via-white/[0.02] to-transparent" />
  <div className="absolute -inset-[1px] rounded-xl bg-[#1A1A1F] opacity-20" />
  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-white/15 via-transparent to-transparent opacity-25" />
  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-t from-[#13151C] via-transparent to-transparent opacity-50" />
  
  {/* Main Card Container */}
  <div className="relative rounded-xl bg-[#13151C]/40 backdrop-blur-2xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
    {/* Card Content */}
  </div>
</div>
```

## Key Components

### 1. Border Effect
The glass card uses multiple layers to create a sophisticated border effect:
- Top gradient: `from-white/15` creates a subtle light edge
- Dark overlay: `bg-[#1A1A1F] opacity-20` adds depth
- Middle gradient: Adds dimension with `opacity-25`
- Bottom gradient: Creates a soft fade with `opacity-50`

### 2. Main Container
- Background: `bg-[#13151C]/40` with high transparency
- Blur effect: `backdrop-blur-2xl` for the glass effect
- Hover animation: Scale transform and shadow increase

### 3. Inner Elements Style

#### Image Sections
```jsx
<div className="relative h-40 overflow-hidden">
  <img 
    className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-[#13151C]/90 via-[#13151C]/50 to-transparent" />
</div>
```

#### Stats/Info Cards
```jsx
<div className="bg-white/[0.02] backdrop-blur-md rounded-lg p-3 border border-white/[0.03]">
  <span className="text-white/40 text-[10px] uppercase tracking-wide">Label</span>
  <span className="text-white text-lg font-semibold tracking-tight">Value</span>
</div>
```

### 4. Typography
- Labels: `text-[10px] uppercase tracking-wide text-white/40`
- Values: `text-lg font-semibold tracking-tight text-white`
- Descriptions: `text-xs text-white/60`

### 5. Interactive Elements
- Hover states: Use `group-hover:` for coordinated animations
- Transitions: `transition-all duration-300` for smooth animations
- Active states: `active:scale-[0.98]` for button press effect

## Usage Guidelines

1. **Consistency**: Maintain these exact values for opacity and blur effects across all cards
2. **Spacing**: Use consistent padding (`p-4`) and gaps (`gap-3`, `gap-4`)
3. **Animation**: Keep transitions smooth with `duration-300` or `duration-700` for slower effects
4. **Accessibility**: Maintain contrast with proper text opacity values
5. **Responsiveness**: Ensure the glass effect works well on all screen sizes

## Examples

### Metric Card
Used for displaying key statistics and metrics.

### Content Card
Used for displaying content with images and descriptions.

### Action Card
Used for interactive elements with buttons and hover states.

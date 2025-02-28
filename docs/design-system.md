# Paradyze2 Design System

This document outlines the design system for Paradyze2, providing guidelines for visual elements, component styling, and UI patterns to ensure a consistent and cohesive user experience.

---

## 1. Brand Identity

### 1.1 Logo

The Paradyze2 logo is a key brand element featuring a gold design that embodies the premium nature of the platform.

#### Logo Usage
- **Primary Logo**: `/public/ParadyzeLogoGold.webp`
- **Sizes**:
  - Small: 32px height (h-8)
  - Medium: 40px height (h-10)
  - Large: 48px height (h-12)
  - Extra Large: 64px height (h-16)
- **Spacing**: Always maintain clear space around the logo equal to at least 25% of its height
- **Background**: The logo works best on dark backgrounds that provide contrast with the gold elements

#### Logo Variations
- **Logo Only**: For small spaces or icons
- **Logo with Text**: Standard usage in headers and prominent placements
- **Animated Logo**: Subtle pulsing animation for loading states or to draw attention

### 1.2 Color Palette

#### Primary Colors
- **Background**: Deep black (`#000000` / `hsl(0, 0%, 3.9%)`)
- **Foreground**: Off-white (`#fafafa` / `hsl(0, 0%, 98%)`)

#### Gold Accent Colors
- **Gold Light**: `#D4C6A1` - Lighter beige gold for gradient starts and subtle highlights
- **Gold Medium**: `#BFB28F` - Primary accent color for interactive elements
- **Gold Dark**: `#A69A78` - Darker beige gold for gradient ends and depth

#### UI Colors
- **Card Background**: `rgba(19, 21, 28, 0.4)` with backdrop blur
- **Border Colors**: 
  - Primary: `rgba(255, 255, 255, 0.05)`
  - Highlight: `rgba(255, 255, 255, 0.15)`
- **Text Colors**:
  - Primary: White (`#FFFFFF`)
  - Secondary: `rgba(255, 255, 255, 0.8)`
  - Muted: `rgba(255, 255, 255, 0.6)`
  - Disabled: `rgba(255, 255, 255, 0.4)`

#### Functional Colors
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Red)
- **Info**: `#3B82F6` (Blue)

### 1.3 Typography

#### Font Family
- **Primary**: 'Inter', system UI fonts
- **Monospace**: 'source-code-pro', monospace fonts

#### Font Sizes
- **Heading 1**: 2.5rem (40px)
- **Heading 2**: 2rem (32px)
- **Heading 3**: 1.5rem (24px)
- **Heading 4**: 1.25rem (20px)
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)
- **XSmall**: 0.75rem (12px)
- **Tiny**: 0.625rem (10px)

#### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

#### Line Heights
- **Tight**: 1.2
- **Normal**: 1.5
- **Relaxed**: 1.75

### 1.4 Spacing

- **4px** - Extra small (0.25rem)
- **8px** - Small (0.5rem)
- **12px** - Medium small (0.75rem)
- **16px** - Base (1rem)
- **24px** - Medium (1.5rem)
- **32px** - Large (2rem)
- **48px** - Extra large (3rem)
- **64px** - 2x Extra large (4rem)

### 1.5 Borders & Radius

- **Border Width**: 1px
- **Border Radius**:
  - **Small**: 0.375rem (6px)
  - **Medium**: 0.5rem (8px)
  - **Large**: 0.75rem (12px)
  - **XLarge**: 1rem (16px)
  - **Round**: 9999px (for pills and circular elements)

---

## 2. Core UI Elements

### 2.1 Glass Morphism

The signature visual style of Paradyze2 is glass morphism, characterized by:

#### Glass Effect
```css
.glass {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
}
```

#### Haptic Border Effect
The glass elements feature a sophisticated multi-layered border effect:

1. **Top Light Edge**: `bg-gradient-to-b from-white/15 via-white/[0.02] to-transparent`
2. **Dark Overlay**: `bg-[#1A1A1F] opacity-20`
3. **Middle Gradient**: `bg-gradient-to-b from-white/15 via-transparent to-transparent opacity-25`
4. **Bottom Gradient**: `bg-gradient-to-t from-[#13151C] via-transparent to-transparent opacity-50`

### 2.2 Gold Gradient Text

A distinctive feature for headings and important text:

```css
.gold-gradient-text {
  background: linear-gradient(to right, var(--gold-from), var(--gold-via), var(--gold-to));
  background-clip: text;
  color: transparent;
}
```

### 2.3 Background

The application features a dark background with a subtle image overlay:

```css
body {
  background: #000;
}

.App::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/public/images/bg8.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.6;
  z-index: -1;
}
```

---

## 3. Component System

### 3.1 GlassCard

The primary container component with several subcomponents:

#### Base Card
```jsx
<GlassCard>
  {/* Card content */}
</GlassCard>
```

#### Card with Header, Content, and Footer
```jsx
<GlassCard>
  <GlassCardHeader>
    <GlassCardTitle>Card Title</GlassCardTitle>
    <GlassCardDescription>Card description text</GlassCardDescription>
  </GlassCardHeader>
  <GlassCardContent>
    {/* Main content */}
  </GlassCardContent>
  <GlassCardFooter>
    {/* Footer actions */}
  </GlassCardFooter>
</GlassCard>
```

#### Card Hover Effects
Cards have a subtle scale and shadow effect on hover:
```css
transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
```

### 3.2 Buttons

#### Button Variants
- **Primary**: Gold gradient background
- **Secondary**: Semi-transparent white background
- **Outline**: Transparent with white border
- **Ghost**: Transparent with hover effect
- **Destructive**: Red background for destructive actions

#### Button Sizes
- **Small**: Compact size for tight spaces
- **Default**: Standard button size
- **Large**: Emphasized buttons

#### Button States
- **Default**: Normal state
- **Hover**: Slightly lighter background
- **Active**: Slightly darker background with scale effect
- **Disabled**: Reduced opacity and non-interactive

### 3.3 Navigation

#### DockSidebar
A dock-style sidebar for main navigation featuring:
- Icon-based navigation with tooltips
- Gold accent for active items
- Subtle hover effects

#### Tabs
Used for secondary navigation within modules:
- Underline style for active tab
- Gold accent color for active state
- Semi-transparent for inactive tabs

### 3.4 Form Elements

#### Inputs
- Glass-style background
- Subtle border
- Focus state with gold accent

#### Selects & Dropdowns
- Custom styled dropdowns with glass effect
- Gold accent for selected items

---

## 4. Layout System

### 4.1 Grid System

Based on Tailwind CSS grid utilities:
- 12-column grid for complex layouts
- Responsive breakpoints:
  - **sm**: 640px
  - **md**: 768px
  - **lg**: 1024px
  - **xl**: 1280px
  - **2xl**: 1536px

### 4.2 Containers

- **Default**: Max-width container with responsive padding
- **Full-width**: Edge-to-edge container for immersive sections

### 4.3 Spacing Patterns

- **Card Padding**: 1rem (16px)
- **Section Spacing**: 2rem (32px) vertical
- **Component Gap**: 0.75rem (12px) to 1.5rem (24px)

---

## 5. Animation & Interaction

### 5.1 Transitions

- **Duration**:
  - **Fast**: 150ms
  - **Default**: 300ms
  - **Slow**: 500ms
  - **Very Slow**: 700ms (for background effects)

- **Easing**:
  - **Default**: ease-in-out
  - **Entrance**: ease-out
  - **Exit**: ease-in
  - **Bounce**: cubic-bezier(0.34, 1.56, 0.64, 1)

### 5.2 Hover Effects

- **Cards**: Scale up slightly with increased shadow
- **Buttons**: Subtle background change
- **Interactive Elements**: Cursor pointer and visual feedback

### 5.3 Loading States

- **Skeleton Loaders**: For content loading
- **Spinner**: For actions and processes
- **Progress Bars**: For longer operations

---

## 6. Icons & Imagery

### 6.1 Icon System

- **Primary**: Lucide React icons
- **Size System**:
  - **Small**: 16px
  - **Medium**: 20px
  - **Large**: 24px
  - **XLarge**: 32px

### 6.2 Image Treatment

- **Card Images**: Slightly reduced opacity (0.8-0.9)
- **Background Images**: Very reduced opacity (0.6)
- **Gradient Overlays**: Used to ensure text readability over images

---

## 7. Responsive Design

### 7.1 Mobile First Approach

- Base styles designed for mobile
- Progressive enhancement for larger screens

### 7.2 Breakpoint Strategy

- **< 640px**: Single column layouts
- **640px - 768px**: Two column layouts for some components
- **768px - 1024px**: Multi-column layouts
- **> 1024px**: Full desktop experience

### 7.3 Touch Considerations

- Minimum touch target size: 44px × 44px
- Increased spacing on mobile
- Simplified interactions for touch devices

---

## 8. Accessibility

### 8.1 Color Contrast

- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text

### 8.2 Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus styles are clearly visible

### 8.3 Screen Readers

- Semantic HTML structure
- ARIA attributes where necessary
- Alternative text for images

---

## 9. Implementation Guidelines

### 9.1 CSS Variables

```css
:root {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
  --radius: 0.75rem;
  --gold-from: #D4C6A1;  /* Lighter beige gold */
  --gold-via: #BFB28F;   /* Medium beige gold */
  --gold-to: #A69A78;    /* Darker beige gold */
  --gold-accent: #BFB28F; /* Medium vibrant beige gold */
  --gold-rgb: 191, 178, 143;
}
```

### 9.2 Utility Classes

```css
.glass {
  @apply bg-black/40 backdrop-blur-xl border border-white/5 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2)];
}

.gold-gradient-text {
  @apply bg-gradient-to-r from-[var(--gold-from)] via-[var(--gold-via)] to-[var(--gold-to)] bg-clip-text text-transparent;
}
```

### 9.3 Component Props

Components should support the following common props:
- `className`: For extending styles
- `children`: For component composition
- `disabled`: For interactive elements
- `variant`: For style variations
- `size`: For size variations

---

*This design system is a living document and will evolve as the Paradyze2 platform grows and matures.*

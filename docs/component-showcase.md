# Paradyze2 Component Showcase

This document provides visual examples and code snippets for the core UI components of Paradyze2, demonstrating how to implement the design system in practice.

---

## 1. Brand Components

### Logo

The Logo component displays the Paradyze2 gold logo with optional text.

```jsx
import { Logo, AnimatedLogo } from "../ui/Logo";

export function LogoExample() {
  return (
    <div className="space-y-6">
      {/* Logo sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Logo Sizes</h3>
        <div className="flex flex-col gap-4">
          <Logo size="sm" />
          <Logo size="md" />
          <Logo size="lg" />
          <Logo size="xl" />
        </div>
      </div>
      
      {/* Logo without text */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Logo without Text</h3>
        <Logo withText={false} size="lg" />
      </div>
      
      {/* Animated logo */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Animated Logo</h3>
        <AnimatedLogo size="lg" />
      </div>
    </div>
  );
}
```

### Header

The Header component displays the application header with logo and wallet connection.

```jsx
import { Header, AuthHeader } from "../ui/Header";

export function HeaderExample() {
  return (
    <div className="space-y-8">
      {/* Default header (not connected) */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Default Header</h3>
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <Header onConnect={() => alert('Connect wallet clicked')} />
        </div>
      </div>
      
      {/* Connected state */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Connected Header</h3>
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <Header 
            isConnected={true}
            walletAddress="inj1abc123def456ghi789jkl"
            balance="1,234.56 INJ"
          />
        </div>
      </div>
      
      {/* Auth header */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Auth Header</h3>
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <AuthHeader />
        </div>
      </div>
    </div>
  );
}
```

## 2. GlassCard Components

The GlassCard is the primary container component in Paradyze2, featuring a distinctive glass morphism effect.

### Basic GlassCard

```jsx
import { GlassCard } from "../ui/GlassCard";

export function BasicCardExample() {
  return (
    <GlassCard className="w-full max-w-md p-6">
      <h3 className="text-xl font-semibold mb-2">Basic Card</h3>
      <p className="text-white/80">
        This is a simple glass card component with minimal content.
      </p>
    </GlassCard>
  );
}
```

### GlassCard with Header, Content, and Footer

```jsx
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter
} from "../ui/GlassCard";
import { Button } from "../ui/Button";

export function CompleteCardExample() {
  return (
    <GlassCard className="w-full max-w-md">
      <GlassCardHeader>
        <GlassCardTitle className="gold-gradient-text">
          Market Overview
        </GlassCardTitle>
        <GlassCardDescription>
          Summary of current market conditions
        </GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-white/70">Total Value Locked</span>
            <span className="font-medium">$1,245,678</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">24h Volume</span>
            <span className="font-medium">$567,890</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Active Markets</span>
            <span className="font-medium">42</span>
          </div>
        </div>
      </GlassCardContent>
      <GlassCardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm">Details</Button>
        <Button size="sm">Trade Now</Button>
      </GlassCardFooter>
    </GlassCard>
  );
}
```

### Interactive Card with Hover Effects

```jsx
import { GlassCard } from "../ui/GlassCard";

export function InteractiveCardExample() {
  return (
    <div className="group cursor-pointer">
      <GlassCard className="w-full max-w-md p-6 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <h3 className="text-xl font-semibold mb-2 gold-gradient-text">
          Interactive Card
        </h3>
        <p className="text-white/80">
          This card has hover effects. Try hovering over it!
        </p>
      </GlassCard>
    </div>
  );
}
```

## 3. Button Components

Buttons are a key interactive element in the Paradyze2 interface.

### Button Variants

```jsx
import { Button } from "../ui/Button";

export function ButtonVariantsExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  );
}
```

### Button Sizes

```jsx
import { Button } from "../ui/Button";

export function ButtonSizesExample() {
  return (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}
```

### Button with Icon

```jsx
import { Button } from "../ui/Button";
import { Plus, ArrowRight } from "lucide-react";

export function ButtonWithIconExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Create New
      </Button>
      <Button variant="outline">
        View Details
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
```

## 4. Navigation Components

### DockSidebar

```jsx
import { 
  DockSidebar, 
  DockSidebarItem 
} from "../ui/DockSidebar";
import { 
  Home, 
  LineChart, 
  Wallet, 
  Bot, 
  Settings 
} from "lucide-react";

export function DockSidebarExample() {
  return (
    <div className="h-[500px] relative border border-white/10 rounded-lg">
      <DockSidebar>
        <DockSidebarItem icon={<Home />} label="Dashboard" active />
        <DockSidebarItem icon={<LineChart />} label="Prediction Markets" />
        <DockSidebarItem icon={<Wallet />} label="Money Markets" />
        <DockSidebarItem icon={<Bot />} label="Agent Launchpad" />
        <DockSidebarItem icon={<Settings />} label="Settings" />
      </DockSidebar>
      
      <div className="p-6">
        <p className="text-white/60">
          The sidebar now includes the Paradyze logo at the top.
          Hover over the icons to see tooltips.
        </p>
      </div>
    </div>
  );
}

// Example without logo
export function DockSidebarNoLogoExample() {
  return (
    <div className="h-[400px] relative border border-white/10 rounded-lg">
      <DockSidebar showLogo={false}>
        <DockSidebarItem icon={<Home />} label="Dashboard" active />
        <DockSidebarItem icon={<LineChart />} label="Prediction Markets" />
        <DockSidebarItem icon={<Wallet />} label="Money Markets" />
        <DockSidebarItem icon={<Bot />} label="Agent Launchpad" />
      </DockSidebar>
      
      <div className="p-6">
        <p className="text-white/60">
          This variant hides the logo for a more minimal sidebar.
        </p>
      </div>
    </div>
  );
}
```

### Tabs

```jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";

export function TabsExample() {
  return (
    <Tabs defaultValue="markets">
      <TabsList>
        <TabsTrigger value="markets">Markets</TabsTrigger>
        <TabsTrigger value="positions">Positions</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="markets">
        <div className="py-4">Markets content goes here</div>
      </TabsContent>
      <TabsContent value="positions">
        <div className="py-4">Positions content goes here</div>
      </TabsContent>
      <TabsContent value="history">
        <div className="py-4">History content goes here</div>
      </TabsContent>
    </Tabs>
  );
}
```

## 5. Form Components

### Input

```jsx
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

export function InputExample() {
  return (
    <div className="space-y-2">
      <Label htmlFor="amount">Amount</Label>
      <Input
        id="amount"
        placeholder="Enter amount"
        className="glass"
      />
    </div>
  );
}
```

### Select

```jsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "../ui/Select";
import { Label } from "../ui/Label";

export function SelectExample() {
  return (
    <div className="space-y-2">
      <Label htmlFor="token">Token</Label>
      <Select>
        <SelectTrigger id="token" className="glass w-full">
          <SelectValue placeholder="Select token" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="inj">INJ</SelectItem>
          <SelectItem value="usdt">USDT</SelectItem>
          <SelectItem value="eth">ETH</SelectItem>
          <SelectItem value="btc">BTC</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

### Checkbox

```jsx
import { Checkbox } from "../ui/Checkbox";
import { Label } from "../ui/Label";

export function CheckboxExample() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">
        I agree to the terms and conditions
      </Label>
    </div>
  );
}
```

## 6. Data Display Components

### Table

```jsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "../ui/Table";

export function TableExample() {
  return (
    <GlassCard>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Market</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>24h Change</TableHead>
            <TableHead>Volume</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>INJ/USDT</TableCell>
            <TableCell>$12.45</TableCell>
            <TableCell className="text-green-500">+5.67%</TableCell>
            <TableCell>$1.2M</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ETH/USDT</TableCell>
            <TableCell>$3,245.78</TableCell>
            <TableCell className="text-red-500">-2.31%</TableCell>
            <TableCell>$4.5M</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>BTC/USDT</TableCell>
            <TableCell>$42,567.89</TableCell>
            <TableCell className="text-green-500">+1.23%</TableCell>
            <TableCell>$8.7M</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </GlassCard>
  );
}
```

### Badge

```jsx
import { Badge } from "../ui/Badge";

export function BadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  );
}
```

### Progress

```jsx
import { Progress } from "../ui/Progress";

export function ProgressExample() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-sm text-white/70">Pool Liquidity</span>
          <span className="text-sm font-medium">75%</span>
        </div>
        <Progress value={75} />
      </div>
      
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-sm text-white/70">Market Capacity</span>
          <span className="text-sm font-medium">45%</span>
        </div>
        <Progress value={45} />
      </div>
    </div>
  );
}
```

## 7. Feedback Components

### Alert

```jsx
import { Alert, AlertTitle, AlertDescription } from "../ui/Alert";
import { Info } from "lucide-react";

export function AlertExample() {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This transaction will be processed on the OKX blockchain.
      </AlertDescription>
    </Alert>
  );
}
```

### Toast

```jsx
import { Button } from "../ui/Button";
import { useToast } from "../ui/use-toast";

export function ToastExample() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "Transaction Submitted",
          description: "Your transaction has been submitted to the blockchain.",
        });
      }}
    >
      Show Toast
    </Button>
  );
}
```

## 8. Layout Examples

### Dashboard Grid

```jsx
export function DashboardGridExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4 gold-gradient-text">
          Portfolio Value
        </h3>
        {/* Card content */}
      </GlassCard>
      
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4 gold-gradient-text">
          Active Positions
        </h3>
        {/* Card content */}
      </GlassCard>
      
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4 gold-gradient-text">
          Recent Transactions
        </h3>
        {/* Card content */}
      </GlassCard>
    </div>
  );
}
```

### Two-Column Layout

```jsx
export function TwoColumnLayoutExample() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-2/3">
        <GlassCard className="p-6 h-full">
          <h3 className="text-xl font-semibold mb-4 gold-gradient-text">
            Main Content
          </h3>
          {/* Main content */}
        </GlassCard>
      </div>
      
      <div className="w-full lg:w-1/3">
        <GlassCard className="p-6 h-full">
          <h3 className="text-xl font-semibold mb-4 gold-gradient-text">
            Sidebar Content
          </h3>
          {/* Sidebar content */}
        </GlassCard>
      </div>
    </div>
  );
}
```

## 9. Animation Examples

### Fade In Animation

```jsx
import { motion } from "framer-motion";

export function FadeInExample() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-2 gold-gradient-text">
          Fade In Card
        </h3>
        <p className="text-white/80">
          This card fades in when it appears.
        </p>
      </GlassCard>
    </motion.div>
  );
}
```

### Staggered List Animation

```jsx
import { motion } from "framer-motion";

export function StaggeredListExample() {
  const items = [
    "First Item",
    "Second Item",
    "Third Item",
    "Fourth Item"
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4 gold-gradient-text">
        Staggered List
      </h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            className="p-3 bg-white/5 rounded-md"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </GlassCard>
  );
}
```

---

## 10. Implementation Notes

### Component Props Structure

Most components follow this props structure pattern:

```tsx
interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | /* other variants */;
  size?: "sm" | "default" | "lg";
  className?: string;
  children: React.ReactNode;
}
```

### Composition Pattern

Components are designed to be composable:

```jsx
<GlassCard>
  <GlassCardHeader>
    {/* Header content */}
  </GlassCardHeader>
  <GlassCardContent>
    {/* Main content */}
  </GlassCardContent>
  <GlassCardFooter>
    {/* Footer content */}
  </GlassCardFooter>
</GlassCard>
```

### Utility Class Usage

Utility classes should be used consistently:

```jsx
// Good
<div className="glass p-6 rounded-lg">...</div>

// Also good
<GlassCard className="p-6">...</GlassCard>
```

---

This component showcase is a living document and will be updated as new components are added or existing ones are refined.

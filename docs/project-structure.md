# Paradyze2 Project Structure

This document outlines the organization and structure of the Paradyze2 codebase, providing an overview of directories, key files, and the architectural approach.

---

## 1. Overview

Paradyze2 follows a modular, component-based architecture using React with TypeScript. The project is organized to support independent module development while maintaining a cohesive user experience through shared UI components and contexts.

---

## 2. Root Directory Structure

```
paradyzev2/
├── docs/                  # Project documentation
├── node_modules/          # Dependencies (not tracked in git)
├── public/                # Static assets and HTML entry point
├── src/                   # Source code
├── .gitignore             # Git ignore configuration
├── package.json           # Project metadata and dependencies
├── package-lock.json      # Locked dependencies
├── postcss.config.js      # PostCSS configuration
├── README.md              # Project overview
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

---

## 3. Source Code Structure

The `src/` directory contains all the application code, organized as follows:

```
src/
├── components/            # UI components organized by module
│   ├── ui/                # Shared UI components
│   │   ├── Button.tsx     # Reusable button component
│   │   ├── GlassCard.tsx  # Glass morphism card component
│   │   ├── Logo.tsx       # Paradyze logo component
│   │   ├── DockSidebar.tsx # Dock-style sidebar navigation
│   │   ├── Tabs.tsx       # Tab navigation component
│   │   └── WalletButton.tsx # Wallet connection button
│   ├── HomeDashboard/     # Home Dashboard module components
│   ├── AgentLaunchpad/    # Agent Launchpad module components
│   ├── MoneyMarket/       # Money Market module components
│   └── PredictionMarket/  # Prediction Market module components
│
├── contexts/              # React contexts for state management
│   └── WalletContext.tsx  # Wallet connection state management
│
├── lib/                   # Utility functions and shared logic
│
├── types/                 # TypeScript type definitions
│
├── App.css                # Global application styles
├── App.tsx                # Main application component
├── index.css              # Entry point styles including utility classes
└── index.tsx              # Application entry point
```

---

## 4. Component Architecture

### 4.1 Module Components

Each functional module of the application has its own directory under `components/`:

- **AgentLaunchpad/**: Components for creating and managing trading agents
- **HomeDashboard/**: Main dashboard and portfolio overview components
- **MoneyMarket/**: Lending and borrowing functionality components
- **PredictionMarket/**: Prediction market creation and participation components

Each module directory contains:
- Main component file (e.g., `AgentLaunchpad.tsx`)
- Any module-specific subcomponents
- Module-specific styles or utilities (if applicable)

#### Key Components in AgentLaunchpad

- **CreateAgent.tsx**: Streamlined interface for agent creation with:
  - Two-column layout (configuration form and chat preview)
  - Simplified input fields (name, ticker, description, personality)
  - Agent preview card
  - Chat interface for testing
  - Random agent generation
- **AgentList.tsx**: Display and management of created agents
- **AgentDetail.tsx**: Detailed view and interaction with a specific agent

### 4.2 Shared UI Components

The `components/ui/` directory contains reusable UI components used across multiple modules:

- **Button.tsx**: Customizable button component with variants
- **GlassCard.tsx**: Enhanced card system with glass morphism effects
- **Logo.tsx**: Paradyze logo component with size variants and text options
- **DockSidebar.tsx**: Main navigation sidebar with dock-style design
- **Tabs.tsx**: Tab navigation component
- **WalletButton.tsx**: Wallet connection interface

### 4.3 Component Design Patterns

Components follow these design patterns:

1. **Composition**: Complex components are built by composing smaller, focused components
2. **Props Interface**: Each component has a clearly defined TypeScript interface for its props
3. **Variants**: UI components support variants through utility classes or component props
4. **Responsive Design**: Components are designed to work across device sizes

---

## 5. State Management

### 5.1 React Context

Application-wide state is managed using React Context:

- **WalletContext**: Manages wallet connection state, including:
  - Connection status
  - User address
  - Connection/disconnection methods
  - Wallet balance information

### 5.2 Component State

Local component state is managed using React's `useState` and `useReducer` hooks for more complex state logic.

---

## 6. Styling Approach

### 6.1 Tailwind CSS

The project uses Tailwind CSS for styling with:

- Custom configuration in `tailwind.config.js`
- Extended theme with gold accent colors and glass effect variables
- Responsive utility classes

### 6.2 Custom CSS

- **index.css**: Contains global styles and utility classes like `.glass` and `.gold-gradient-text`
- **App.css**: Contains application-level styles including background image setup

### 6.3 Design System

The UI follows a consistent design system with:
- Glass morphism effects for cards and containers
- Gold gradient accents for important text and UI elements
- Dark theme with high contrast for readability
- Consistent spacing and typography

---

## 7. Asset Organization

Static assets are organized as follows:

- **Public directory**: Contains favicon, manifest, and other static files
- **Background images**: Referenced in CSS for the application background
- **SVG icons**: Primarily using Lucide React for consistent iconography

---

## 8. Build and Development

### 8.1 Scripts

The following npm scripts are available:

- `npm start`: Start development server
- `npm build`: Build production-ready bundle
- `npm test`: Run tests
- `npm eject`: Eject from Create React App configuration

### 8.2 Environment Configuration

Environment-specific configuration is managed through:
- `.env` files (not tracked in git)
- Environment variables for API endpoints and feature flags

---

## 9. Documentation

Project documentation is stored in the `docs/` directory:

- **PRD.md**: Product Requirements Document
- **tech-stack.md**: Technology stack overview
- **project-structure.md**: This document
- **glass-card-style.md**: Design guidelines for glass card components

---

*This document serves as a living guide to the project structure and will be updated as the architecture evolves.*

import { 
  createRootRoute, 
  createRoute, 
  createRouter,
  Outlet
} from '@tanstack/react-router';
import React, { Suspense, lazy } from 'react';
import { WalletProvider } from './contexts/WalletContext';
import DockSidebar from './components/ui/DockSidebar';
import WalletButton from './components/ui/WalletButton';

import { AgentLaunchpad } from './components/AgentLaunchpad/AgentLaunchpad';
import { CreateAgent } from './components/CreateAgent/CreateAgent';
import { AgentChat } from './components/AgentChat/AgentChat';
import AgentManagement from './components/AgentManagement/AgentManagement';
import { ThreeDPhotoCarouselDemo } from "./components/ui/code-demo";

// Lazy load components
const HomeDashboard = lazy(() => import('./components/HomeDashboard/HomeDashboard'));
const PredictionMarket = lazy(() => import('./components/PredictionMarket/PredictionMarket'));
const MoneyMarket = lazy(() => import('./components/MoneyMarket/MoneyMarket'));

// Create our root route
export const rootRoute = createRootRoute({
  component: () => {
    return (
      <WalletProvider>
        <div className="App relative">
          <div className="fixed inset-0 z-[-1] bg-bg8 bg-cover bg-center bg-no-repeat"></div>
          <DockSidebar />
          <WalletButton />
          <main className="pl-24 min-h-screen">
            <Suspense fallback={<div className="loading">Loading...</div>}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </WalletProvider>
    );
  },
});

// Create route components with their respective paths
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeDashboard,
});

export const agentLaunchpadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent-launchpad',
  component: AgentLaunchpad,
});

export const agentManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent-management',
  component: AgentManagement,
});

export const predictionMarketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/prediction-market',
  component: PredictionMarket,
});

export const moneyMarketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/money-market',
  component: MoneyMarket,
});

export const demoCarouselRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/demo/3d-carousel',
  component: ThreeDPhotoCarouselDemo,
});

export const createAgentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-agent',
  component: CreateAgent,
});

export const agentChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agents/$agentId',
  component: AgentChat,
});

// Register all routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  agentLaunchpadRoute,
  agentManagementRoute,
  predictionMarketRoute,
  moneyMarketRoute,
  demoCarouselRoute,
  createAgentRoute,
  agentChatRoute,
]);

// Create the router instance
const _router = createRouter({ routeTree });

export const router = _router;

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

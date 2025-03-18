import { 
  createRootRoute, 
  createRoute, 
  createRouter,
  Outlet,
  useNavigate
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

// Redirect from agent-management to agent-launchpad since we've merged these pages
export const agentManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent-management',
  component: () => {
    return (
      <div className="redirect-container">
        <p>Redirecting to Agent Launchpad...</p>
        <meta httpEquiv="refresh" content="0;url=/agent-launchpad" />
      </div>
    );
  },
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

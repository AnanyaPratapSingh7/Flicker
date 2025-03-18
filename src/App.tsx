import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import DockSidebar from './components/ui/DockSidebar';
import WalletButton from './components/ui/WalletButton';
import { WalletProvider } from './contexts/WalletContext';
import { ThreeDPhotoCarouselDemo } from "./components/ui/code-demo";
import { AgentLaunchpad } from './components/AgentLaunchpad/AgentLaunchpad';
import { CreateAgent } from './components/CreateAgent/CreateAgent';
import { AgentChat } from './components/AgentChat/AgentChat';

// Lazy load components
const HomeDashboard = lazy(() => import('./components/HomeDashboard/HomeDashboard'));

const App: React.FC = () => {
  return (
    <WalletProvider>
      <Router>
        <div className="App">
          <DockSidebar />
          <WalletButton />
          <main className="pl-24 min-h-screen">
            <Suspense fallback={<div className="loading">Loading...</div>}>
              <Routes>
                <Route path="/" element={<HomeDashboard />} />
                <Route path="/agent-launchpad" element={<AgentLaunchpad />} />
                <Route path="/agent-management" element={<Navigate to="/agent-launchpad" replace />} />
                <Route path="/demo/3d-carousel" element={<ThreeDPhotoCarouselDemo />} />
                <Route path="/create-agent" element={<CreateAgent />} />
                <Route path="/agents/:agentId" element={<AgentChat />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import DockSidebar from './components/ui/DockSidebar';
import WalletButton from './components/ui/WalletButton';
import { WalletProvider } from './contexts/WalletContext';
import { ThreeDPhotoCarouselDemo } from "./components/ui/code-demo";
import { AgentLaunchpad } from './components/AgentLaunchpad/AgentLaunchpad';
import { CreateAgent } from './components/CreateAgent/CreateAgent';
import { AgentChat } from './components/AgentChat/AgentChat';
import AgentManagement from './components/AgentManagement/AgentManagement';

// Lazy load components
const HomeDashboard = lazy(() => import('./components/HomeDashboard/HomeDashboard'));
const PredictionMarket = lazy(() => import('./components/PredictionMarket/PredictionMarket'));
const MoneyMarket = lazy(() => import('./components/MoneyMarket/MoneyMarket'));

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
                <Route path="/agent-management" element={<AgentManagement />} />
                <Route path="/prediction-market" element={<PredictionMarket />} />
                <Route path="/money-market" element={<MoneyMarket />} />
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

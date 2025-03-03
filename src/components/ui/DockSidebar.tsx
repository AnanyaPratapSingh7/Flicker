import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, LineChart, Bot, Home, DollarSign, LogOut, Twitter, Users } from 'lucide-react';
import { Button } from './Button';
import { useWallet } from '../../contexts/WalletContext';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Agent Launchpad', path: '/agent-launchpad', icon: Bot },
  { name: 'Agent Management', path: '/agent-management', icon: Users },
  { name: 'Prediction Market', path: '/prediction-market', icon: LineChart },
  { name: 'Money Market', path: '/money-market', icon: Wallet },
  { name: 'Earn', path: '/earn', icon: DollarSign },
];

const DockSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { disconnectWallet } = useWallet();
  
  return (
    <aside className="fixed left-0 top-0 bottom-0 p-2 m-4 rounded-xl glass flex flex-col justify-between z-50">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="p-2 mb-4">
          <img 
            src="/ParadyzeLogoGold.webp" 
            alt="Paradyze Logo" 
            className="h-10 w-10 object-contain"
            onError={(e) => {
              console.error("Logo failed to load");
              // Fallback to text if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                const fallback = document.createElement('span');
                fallback.className = "text-2xl font-bold gold-gradient-text";
                fallback.textContent = "P";
                parent.appendChild(fallback);
              }
            }}
          />
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          {navigation.map((item) => (
            <div key={item.name} className="relative group">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(item.path)}
                className={`h-12 w-12 rounded-lg hover:bg-white/5 hover:scale-110 transition-all duration-200 ${
                  location.pathname === item.path ? 'bg-white/10' : ''
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition-colors ${
                    location.pathname === item.path 
                      ? 'text-[var(--gold-accent)]' 
                      : 'text-white/70 group-hover:text-white'
                  }`}
                />
              </Button>
              <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 rounded text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-lg hover:bg-white/5 hover:scale-110 transition-all duration-200"
          >
            <Twitter className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
          </Button>
          <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 rounded text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
            Twitter
          </div>
        </div>

        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            onClick={disconnectWallet}
            className="h-12 w-12 rounded-lg hover:bg-white/5 hover:scale-110 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-300 transition-colors" />
          </Button>
          <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 rounded text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
            Disconnect
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DockSidebar;

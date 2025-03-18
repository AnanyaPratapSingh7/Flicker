import React, { useState, useEffect } from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardFooter } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { 
  Brain, 
  Code, 
  LineChart, 
  Plus, 
  RefreshCw, 
  ArrowRight, 
  TrendingUp, 
  Search, 
  Filter, 
  ChevronDown, 
  Star, 
  Clock, 
  Users, 
  DollarSign,
  MessageSquare,
  Trash2,
  Edit,
  Settings,
  Twitter,
  ChevronUp,
  RocketIcon,
  Rocket
} from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import AgentCard from '../AgentManagement/AgentCard';
import axios from 'axios';

// Agent interface
interface Agent {
  id: string;
  name: string;
  description?: string;
  ticker?: string;
  createdAt?: string;
  clients?: {
    direct?: boolean;
    twitter?: boolean;
    discord?: boolean;
    telegram?: boolean;
    slack?: boolean;
  };
}

const AgentLaunchpad: React.FC = () => {
  const { isWalletConnected, connectWallet } = useWallet();
  const navigate = useNavigate();

  // Agent Management state
  const [showAgents, setShowAgents] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to load agents. Please try again.');
      // For demo purposes, use placeholder data if API fails
      setAgents([
        {
          id: '1',
          name: 'Trading Bot Alpha',
          description: 'Automated trading bot with multi-strategy capabilities',
          ticker: 'TBA',
          createdAt: new Date().toISOString(),
          clients: { direct: true, twitter: true }
        },
        {
          id: '2',
          name: 'Market Sentinel',
          description: 'Market analysis and alert system',
          ticker: 'MS',
          createdAt: new Date().toISOString(),
          clients: { direct: true }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await axios.delete(`/api/agents/${agentId}`);
        // Remove the agent from the list
        setAgents(agents.filter(agent => agent.id !== agentId));
      } catch (error) {
        console.error('Error deleting agent:', error);
        setError('Failed to delete agent. Please try again.');
      }
    }
  };

  const handleCreateAgent = () => {
    navigate('/create-agent');
  };

  const handleEditAgent = (agentId: string) => {
    navigate(`/edit-agent/${agentId}`);
  };

  const handleChatWithAgent = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  // Filter agents based on search query and active tab
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'twitter') return matchesSearch && agent.clients?.twitter;
    if (activeTab === 'direct') return matchesSearch && agent.clients?.direct;
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Hero Section */}
      <section className="mb-20 pt-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6 text-white text-left">
              <span className="text-[#D4C6A1]">Create</span> and Tokenize Agents
            </h1>
            <p className="text-lg text-white/70 mb-8 text-left">
              Build AI trading agents with specialized capabilities, tokenize them, and deploy them to markets to earn passive income.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="secondary" 
                className="bg-[#D4C6A1]/20 hover:bg-[#D4C6A1]/30 text-[#D4C6A1] border border-[#D4C6A1]/30"
                onClick={() => setShowAgents(!showAgents)}
              >
                {showAgents ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide My Agents
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show My Agents
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handleCreateAgent}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </div>
          </div>
          <div className="w-full max-w-md">
            <div className="group relative">
              {/* Using the same glass style as the sidebar dock */}
              <div className="relative rounded-xl glass overflow-hidden">
                <div className="h-[200px] relative">
                  {/* Main content with the same spacing */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
                    <div className="bg-black/20 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-medium mb-4 border border-white/10">
                      <span className="text-white/90 uppercase tracking-wider text-[10px]">COMING SOON</span>
                </div>
                    
                    <h3 className="text-5xl font-bold text-white mb-3 tracking-tight">Agent Presales</h3>
                    
                    <p className="text-white/80 text-center max-w-[260px] text-sm">
                      Invest in promising agent tokens before they launch to the public
                    </p>
                </div>
                </div>
                </div>
              </div>
          </div>
        </div>
      </section>
      
      {/* My Agents Section */}
      {showAgents && (
        <section className="mb-20">
          {/* Combined search and buttons on the same line */}
          <div className="flex items-center justify-between mb-8">
            <div className="relative w-[400px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="h-4 w-4 text-white/70" />
              </div>
              <input 
                type="text" 
                className="w-full h-[38px] pl-12 pr-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BFB28F]/70 focus:border-[#BFB28F]/50 text-white text-sm"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
            <Button 
                onClick={fetchAgents} 
                className="flex h-[38px] items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/50 hover:border-white/20"
                size="default"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
            </Button>
            <Button 
                onClick={handleCreateAgent}
                className="flex items-center gap-2 bg-gradient-to-r from-[#D4C6A1] via-[#BFB28F] to-[#A69A78] text-black"
              >
                <Plus className="h-4 w-4" />
                Create Agent
            </Button>
          </div>
        </div>
        
          {/* Agents Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BFB28F]"></div>
                  </div>
          ) : error && agents.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={fetchAgents} variant="outline" size="sm">
                Try Again
              </Button>
            </GlassCard>
          ) : filteredAgents.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <div className="flex flex-col items-center justify-center py-10">
                <div className="bg-white/5 p-4 rounded-full mb-4">
                  <Settings className="h-10 w-10 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Agents Found</h3>
                <p className="text-white/60 mb-6 max-w-md">
                  {searchQuery ? 'No agents match your search criteria.' : 'You haven\'t created any agents yet.'}
                </p>
                <Button onClick={handleCreateAgent}>
                  Create Your First Agent
                </Button>
                  </div>
              </GlassCard>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map(agent => (
                <AgentCard 
                  key={agent.id}
                  agent={agent}
                  onDelete={() => handleDeleteAgent(agent.id)}
                  onEdit={() => handleEditAgent(agent.id)}
                  onChat={() => handleChatWithAgent(agent.id)}
                />
            ))}
          </div>
          )}
      </section>
      )}
    </div>
  );
};

export { AgentLaunchpad };

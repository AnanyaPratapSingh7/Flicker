import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardFooter } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Plus, RefreshCw, Search, Settings, Twitter, MessageSquare, Trash2, Edit, ExternalLink } from 'lucide-react';
import AgentCard from './AgentCard';
import './AgentManagement.css';

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

const AgentManagement: React.FC = () => {
  const navigate = useNavigate();
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
      const response = await axios.get('http://localhost:3001/api/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to load agents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await axios.delete(`http://localhost:3001/api/agents/${agentId}`);
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
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">Agent Management</h1>
          <p className="text-white/70">Create, manage, and interact with your AI trading agents</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={fetchAgents} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
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

      {/* Search and Filter Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-white/50" />
            </div>
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 text-white"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 rounded-lg p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#D4C6A1]">
                All Agents
              </TabsTrigger>
              <TabsTrigger value="direct" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#D4C6A1]">
                Direct Chat
              </TabsTrigger>
              <TabsTrigger value="twitter" className="data-[state=active]:bg-white/10 data-[state=active]:text-[#D4C6A1]">
                Twitter
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Agents Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BFB28F]"></div>
        </div>
      ) : error ? (
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
    </div>
  );
};

export default AgentManagement; 
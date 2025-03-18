import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, GlassCardContent } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { 
  ArrowUp, 
  ArrowDown,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowRight,
  Trophy,
  Star,
  Diamond,
  Zap,
  Target,
  Crown,
  Shield,
  Rocket,
  Flame,
  Send,
  ChevronDown,
  UserCircle
} from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import axios from 'axios';
import '../AgentChat/AgentChat.css'; // Import CSS for custom scrollbar

// Mock data for user
const userData = {
  name: "", // Start with empty name, should be fetched from API in real app
  level: 42,
  levelProgress: 65, // percentage
  profileImage: "https://source.unsplash.com/random/200x200/?portrait"
};

// Mock data for portfolio
const portfolioData = {
  totalBalance: 12345.67,
  currency: "USD",
  dailyProfit: 1234.56,
  dailyProfitPercentage: 2.5,
  timeframes: ["24H", "7D", "30D"]
};

// Mock data for news
const newsData = [
  { text: "New DeFi protocol gains $1B TVL in 24 hours", important: true }
];

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  clients?: {
    direct?: boolean;
    twitter?: boolean;
    discord?: boolean;
    telegram?: boolean;
    slack?: boolean;
  };
}

// Placeholder until we fetch real agents
const defaultAgents: Agent[] = [
  {
    id: "loading",
    name: "Loading Agents...",
    description: "Please wait while we load your agents",
  }
];

const HomeDashboard: React.FC = () => {
  const { isWalletConnected } = useWallet();
  const [activeTimeframe, setActiveTimeframe] = useState("24H");
  
  // Agents state
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [loadingAgents, setLoadingAgents] = useState(true);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const agentMenuRef = useRef<HTMLDivElement>(null);

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);
        const response = await axios.get('/api/agents');
        console.log('Fetched agents:', response.data);
        
        if (response.data.agents && response.data.agents.length > 0) {
          setAgents(response.data.agents);
          
          // Set the first agent as selected if none is selected yet
          if (!selectedAgent) {
            setSelectedAgent(response.data.agents[0]);
          }
        } else {
          console.log('No agents found, using fallback agents');
          // Fallback to mock agents if API returns empty
          const fallbackAgents = [
            {
              id: "no-agents",
              name: "No Agents Found",
              description: "Please create an agent first",
            }
          ];
          setAgents(fallbackAgents);
          setSelectedAgent(fallbackAgents[0]);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        // Fallback to mock agents if API fails
        const fallbackAgents = [
          {
            id: "eliza",
            name: "Finance Expert",
            description: "Trading and investment specialist",
            avatar: "/images/agents/finance.png"
          },
          {
            id: "baby",
            name: "Research Analyst",
            description: "Deep market research and analysis",
            avatar: "/images/agents/analyst.png"
          },
          {
            id: "degen",
            name: "Wealth Advisor",
            description: "Personal finance and wealth management",
            avatar: "/images/agents/advisor.png"
          }
        ];
        setAgents(fallbackAgents);
        setSelectedAgent(fallbackAgents[0]);
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  // Handle click outside agent menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentMenuRef.current && !agentMenuRef.current.contains(event.target as Node)) {
        setIsAgentMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch agent details and initialize chat when selectedAgent changes
  useEffect(() => {
    if (!selectedAgent) return;
    
    const fetchAgentDetails = async () => {
      setIsLoadingAgent(true);
      try {
        console.log(`Fetching details for agent ${selectedAgent.id}`);
        const response = await axios.get(`/api/agents/${selectedAgent.id}`);
        console.log('Agent details response:', response);
        const agentData = response.data;
        
        // Add welcome message from the agent
        setMessages([
          {
            role: 'assistant',
            content: `Hello! I'm ${agentData?.name || selectedAgent.name}, your ${agentData?.description || selectedAgent.description}. How can I help you today?`,
            timestamp: new Date()
          }
        ]);
      } catch (error) {
        console.error('Error fetching agent details:', error);
        if (axios.isAxiosError(error)) {
          console.error('API error response:', error.response?.data);
          console.error('API error status:', error.response?.status);
          console.error('API error headers:', error.response?.headers);
        }
        
        // Fallback to using selected agent data if API fails
        setMessages([
          {
            role: 'assistant',
            content: `Hello! I'm ${selectedAgent.name}, your ${selectedAgent.description}. How can I help you today?`,
            timestamp: new Date()
          }
        ]);
      } finally {
        setIsLoadingAgent(false);
      }
    };

    fetchAgentDetails();
  }, [selectedAgent]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      // Small delay to ensure the DOM has updated with the new message
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  const handleAgentChange = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([]); // Clear messages
    setIsAgentMenuOpen(false);
  };

  const handleSendMessage = async () => {
    if (!selectedAgent || inputMessage.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const tempInputMessage = inputMessage;
    setInputMessage('');
    
    try {
      // Send message to the agent's API endpoint
      console.log(`Sending message to agent ${selectedAgent.id}`);
      console.log('Request payload:', { message: tempInputMessage });
      
      const response = await axios.post(`/api/agents/${selectedAgent.id}/message`, {
        message: tempInputMessage
      });
      
      console.log('Message API response:', response);
      console.log('Message API response data:', response.data);
      
      // Add agent response
      const agentResponse: Message = {
        role: 'assistant',
        content: response.data.response || "I'm sorry, I couldn't process your request at this time.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Error sending message to agent:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('API error response:', error.response?.data);
        console.error('API error status:', error.response?.status);
        console.error('API error headers:', error.response?.headers);
      }
      
      // Add more detailed error message from assistant
      let errorMessage = "I'm sorry, there was an error processing your message. Please try again later.";
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = `[Error ${error.response.status}] ${errorMessage} (${error.response.data?.error || 'Unknown error'})`;
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = `[Network Error] ${errorMessage} - No response received from server`;
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = `[Request Error] ${errorMessage} - ${error.message}`;
        }
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      }]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Premium Welcome Text - Left Aligned */}
      <div className="mb-10 flex justify-start pl-2">
        <h2 className="text-3xl font-light tracking-wider">
          Welcome Back <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4C6A1] to-[#A69A78]">Trader</span>
        </h2>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Balance Card - Takes 2/3 of the width on large screens */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <GlassCard className="bg-[#1A1C23]/80" noHoverEffect>
            <GlassCardContent className="p-5">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-[var(--gold-accent)]">Total Balance</h2>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => setActiveTimeframe("24H")}
                      className={`px-3 py-1 rounded-full text-xs ${activeTimeframe === "24H" ? "bg-[var(--gold-accent)]/20 text-[var(--gold-accent)]" : "text-white/50 hover:text-white/80"}`}
                    >
                      24H
                    </button>
                    <button 
                      onClick={() => setActiveTimeframe("7D")}
                      className={`px-3 py-1 rounded-full text-xs ${activeTimeframe === "7D" ? "bg-[var(--gold-accent)]/20 text-[var(--gold-accent)]" : "text-white/50 hover:text-white/80"}`}
                    >
                      7D
                    </button>
                    <button 
                      onClick={() => setActiveTimeframe("30D")}
                      className={`px-3 py-1 rounded-full text-xs ${activeTimeframe === "30D" ? "bg-[var(--gold-accent)]/20 text-[var(--gold-accent)]" : "text-white/50 hover:text-white/80"}`}
                    >
                      30D
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-start mb-4">
                  <h1 className="text-5xl font-bold text-[var(--gold-accent)]">
                    ${portfolioData.totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </h1>
                  <p className="text-white/50 mt-1 text-sm">{portfolioData.currency}</p>
                </div>
                
                {/* Action Buttons inside the balance card */}
                <div className="grid grid-cols-3 gap-4 mt-auto">
                  <div className="relative group">
                  <Button 
                    variant="secondary" 
                      disabled
                      className="w-full py-2 flex items-center justify-center gap-2 bg-black/20 hover:bg-black/20 border-[#1A1C23] opacity-50 cursor-not-allowed"
                  >
                      <ArrowUp className="h-4 w-4 text-white/70" />
                    <span className="text-sm">Deposit</span>
                  </Button>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Coming Soon
                    </div>
                  </div>
                  
                  <div className="relative group">
                  <Button 
                    variant="secondary" 
                      disabled
                      className="w-full py-2 flex items-center justify-center gap-2 bg-black/20 hover:bg-black/20 border-[#1A1C23] opacity-50 cursor-not-allowed"
                  >
                      <ArrowDown className="h-4 w-4 text-white/70" />
                    <span className="text-sm">Withdraw</span>
                  </Button>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Coming Soon
                    </div>
                  </div>
                  
                  <div className="relative group">
                  <Button 
                    variant="secondary" 
                      disabled
                      className="w-full py-2 flex items-center justify-center gap-2 bg-black/20 hover:bg-black/20 border-[#1A1C23] opacity-50 cursor-not-allowed"
                  >
                      <ArrowRightLeft className="h-4 w-4 text-white/70" />
                    <span className="text-sm">Swap</span>
                  </Button>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* User Profile Card - Takes 1/3 of the width on large screens */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1"
        >
          <GlassCard className="h-full bg-[#1A1C23]/80" noHoverEffect>
            <GlassCardContent className="h-full p-5">
              <div className="flex flex-col h-full">
                {/* Profile Header */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-[#BFB28F]/30">
                      <img 
                        src={userData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://source.unsplash.com/random/200x200/?abstract";
                        }}
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-white">{userData.name}</h2>
                      <div className="flex items-center mt-2">
                        <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#D4C6A1] to-[#A69A78] rounded-full" 
                            style={{ width: `${userData.levelProgress}%` }}
                          ></div>
                        </div>
                        <div className="ml-3 flex items-center">
                          <span className="text-xs text-white/50 mr-1">LVL</span>
                          <span className="text-xl font-bold text-[#BFB28F]">{userData.level}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick links */}
                <div className="mt-auto">
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="link" 
                      className="text-white/70 hover:text-[var(--gold-accent)] px-0"
                    >
                      View Profile
                    </Button>
                    <Button 
                      variant="link" 
                      className="text-white/70 hover:text-[var(--gold-accent)] px-0"
                    >
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* Agent Chat Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <GlassCard className="bg-[#1A1C23]/80" noHoverEffect>
          <GlassCardContent className="p-0 h-[500px] flex flex-col">
            {/* Chat Header with Agent Selector */}
            <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center shrink-0">
              <h3 className="text-white font-medium">AI Terminal</h3>
              
              {/* Agent Selector */}
              <div className="relative" ref={agentMenuRef}>
                <button
                  onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {selectedAgent && selectedAgent.avatar ? (
                    <img src={selectedAgent.avatar} alt={selectedAgent.name} className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[var(--gold-accent)]/20 flex items-center justify-center">
                      <span className="text-xs text-[var(--gold-accent)]">{selectedAgent?.name?.charAt(0) || '?'}</span>
                    </div>
                  )}
                  <span className="text-sm text-white truncate max-w-[120px]">{selectedAgent?.name || 'Loading...'}</span>
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </button>
                
                {isAgentMenuOpen && (
                  <div className="absolute right-0 mt-1 w-60 bg-[#202024] border border-white/10 rounded-lg shadow-xl z-10 py-1 max-h-60 overflow-auto custom-scrollbar">
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        className={`w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2 ${
                          selectedAgent?.id === agent.id ? 'bg-white/5' : ''
                        }`}
                        onClick={() => handleAgentChange(agent)}
                      >
                        {agent.avatar ? (
                          <img src={agent.avatar} alt={agent.name} className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[var(--gold-accent)]/20 flex items-center justify-center">
                            <span className="text-xs text-[var(--gold-accent)]">{agent.name.charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-sm text-white truncate">{agent.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat Messages */}
            <div 
              className="flex-grow overflow-y-auto px-5 py-4 custom-scrollbar"
              ref={chatContainerRef}
            >
              {loadingAgents ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BFB28F] mb-3"></div>
                  <p className="text-white/50 text-sm">Loading your agents...</p>
                </div>
              ) : !selectedAgent ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <UserCircle className="h-10 w-10 text-white/20 mb-2" />
                  <p className="text-white/50 text-sm">No agent selected</p>
                </div>
              ) : selectedAgent.id === "no-agents" ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <UserCircle className="h-10 w-10 text-white/20 mb-2" />
                  <p className="text-white/50 text-sm">You don't have any agents yet</p>
                  <button 
                    onClick={() => window.location.href = '/create-agent'} 
                    className="mt-4 px-4 py-2 bg-[var(--gold-accent)]/20 text-[var(--gold-accent)] rounded-lg text-sm hover:bg-[var(--gold-accent)]/30 transition-colors"
                  >
                    Create Your First Agent
                  </button>
                </div>
              ) : isLoadingAgent ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BFB28F]"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <UserCircle className="h-10 w-10 text-white/20 mb-2" />
                  <p className="text-white/50 text-sm">Start a conversation with {selectedAgent.name}</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-xl p-3 ${
                        message.role === 'user' 
                          ? 'bg-[var(--gold-accent)]/20 text-white ml-auto' 
                          : 'bg-white/5 text-white'
                      }`}
                    >
                      {message.content}
                      <div className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-white/40 text-right' : 'text-white/40'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Chat Input */}
            <div className="px-5 py-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <textarea
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2 px-4 text-white resize-none h-[40px] focus:outline-none focus:ring-1 focus:ring-[var(--gold-accent)]/50"
                    placeholder={isLoadingAgent ? "Loading agent..." : `Ask ${selectedAgent?.name || 'Loading...'} anything...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={1}
                    disabled={isLoadingAgent}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!selectedAgent || inputMessage.trim() === '' || isLoadingAgent || loadingAgents}
                  className={`${!selectedAgent || isLoadingAgent || loadingAgents ? 'bg-[var(--gold-accent)]/50 cursor-not-allowed' : 'bg-[var(--gold-accent)] hover:bg-[var(--gold-accent)]/90'} text-black`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
      </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default HomeDashboard;

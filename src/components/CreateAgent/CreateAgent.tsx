import React, { useState, useEffect, useRef } from 'react';
import { GlassCard, GlassCardContent } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Send, Upload, RefreshCw, ChevronDown, ChevronUp, Settings, ExternalLink } from 'lucide-react';
import axios from 'axios';
import './CreateAgent.css'; // Import CSS for custom scrollbar
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Agent interface for the list of agents
interface Agent {
  id: string;
  name: string;
  description?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AgentConfig {
  name: string;
  description: string;
  ticker: string;
  personality: string;
  picture: string;
  clients: {
    discord: boolean;
    telegram: boolean;
    twitter: boolean;
    slack: boolean;
    direct: boolean;
    simsai: boolean;
  };
  templateName: string;
  enableTwitter: boolean;
  modelProvider: string;
  imageModelProvider: string;
  model: string;
  memorySettings: {
    enableRagKnowledge: boolean;
    enableLoreMemory: boolean;
    enableDescriptionMemory: boolean;
    enableDocumentsMemory: boolean;
  };
  plugins: string[];
}

// X Logo SVG Component
const XLogo: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 1200 1227">
    <path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"/>
  </svg>
);

// Discord Logo SVG Component
const DiscordLogo: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 256 199" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
    <path d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z"/>
  </svg>
);

const CreateAgent: React.FC = () => {
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: '',
    description: '',
    ticker: '',
    personality: '',
    picture: 'https://source.unsplash.com/random/300x300/?robot,ai',
    clients: {
      discord: false,
      telegram: false,
      twitter: false,
      slack: false,
      direct: true,
      simsai: false
    },
    templateName: 'trading-agent',
    enableTwitter: false,
    modelProvider: 'openrouter',
    imageModelProvider: 'openai',
    model: 'openai/gpt-4o-mini',
    memorySettings: {
      enableRagKnowledge: false,
      enableLoreMemory: true,
      enableDescriptionMemory: true,
      enableDocumentsMemory: false,
    },
    plugins: []
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to help you create a trading agent. What kind of trading agent would you like to create today?',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'personality', 'examples', 'clients'
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [loadAgentError, setLoadAgentError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [customPluginId, setCustomPluginId] = useState('');

  // Available models
  const availableModels = [
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'openai' },
    { value: 'gpt-4', label: 'GPT-4', provider: 'openai' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'openai' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'anthropic' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'anthropic' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku', provider: 'anthropic' }
  ];
  
  // Available model providers
  const modelProviders = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' }
  ];

  // Scroll to bottom when component mounts
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

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

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoadingAgents(true);
    setLoadAgentError(null);
    
    try {
      const response = await axios.get('http://localhost:3001/api/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setLoadAgentError('Failed to load agents. Please try again.');
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // Load agent details into the form
  const loadAgentDetails = async (agentId: string) => {
    try {
      // Get agent details from the API
      const response = await axios.get(`http://localhost:3001/api/agents/${agentId}`);
      const agent = response.data;
      
      // Update the form with agent details
      setAgentConfig({
        ...agentConfig,
        name: agent.name || '',
        description: agent.description || '',
        // For other fields, we'll need to map from the agent format to our form format
        // This will vary based on your API response structure
        personality: '', // This might need to be extracted from lore, bio, etc.
        ticker: '', // This might need to be extracted from name or other fields
        // Keep existing clients and other settings
        clients: {
          ...agentConfig.clients
        }
      });
      
      // Add confirmation message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've loaded the configuration for agent "${agent.name}". You can modify it and create a new agent based on this configuration.`,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Error loading agent details:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I couldn't load the agent details. Please try again or start with a new configuration.`,
        timestamp: new Date()
      }]);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: 'I understand you want to create a trading agent. Could you tell me more about the specific trading strategies or indicators you want this agent to use?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAgentConfig({
          ...agentConfig,
          picture: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomAgent = () => {
    const randomIndex = Math.floor(Math.random() * 5);
    
    // Sample names
    const names = [
      'AlphaTrader',
      'QuantumFinance',
      'MarketOracle',
      'TradingTitan',
      'FinanceForge'
    ];
    
    // Sample tickers
    const tickers = [
      'ALPH',
      'QFIN',
      'ORCL',
      'TITN',
      'FORG'
    ];
    
    // Sample descriptions
    const descriptions = [
      'A trading agent specializing in cryptocurrency analysis and trading strategies',
      'A quantitative finance specialist focused on stock market analysis',
      'An oracle for market predictions and trading insights',
      'A powerful trading assistant for all financial markets',
      'A comprehensive financial analysis and trading strategy agent'
    ];
    
    // Sample personalities
    const personalities = [
      'Analytical and data-driven with a focus on technical analysis. Provides clear entry and exit points for trades. Risk-conscious but willing to take calculated risks when the reward potential is high. Specializes in cryptocurrency markets with emphasis on Bitcoin and major altcoins.',
      'Conservative and methodical with emphasis on fundamental analysis. Prefers long-term investment strategies over short-term trading. Focuses on value stocks with strong fundamentals and dividend history. Provides thorough market analysis with economic context.',
      'Balanced approach combining technical and fundamental analysis. Adapts strategy based on market conditions. Specializes in forex markets with particular expertise in major currency pairs. Emphasizes proper risk management and position sizing.',
      'Macro-focused with strong emphasis on intermarket relationships. Specializes in commodity trading with expertise in seasonal patterns. Considers geopolitical factors in analysis. Provides both short and medium-term trading opportunities.',
      'Mathematical and probability-based approach to markets. Specializes in options trading strategies. Focuses on volatility analysis and risk/reward optimization. Provides detailed explanations of complex trading concepts.'
    ];
    
    // Set the agent config
    setAgentConfig({
      ...agentConfig,
      name: names[randomIndex],
      ticker: tickers[randomIndex],
      description: descriptions[randomIndex],
      personality: personalities[randomIndex],
      picture: `https://source.unsplash.com/random/300x300/?robot,ai&${Date.now()}`,
      clients: {
        ...agentConfig.clients,
        direct: true, // Always enabled
        twitter: Math.random() > 0.5,
        discord: Math.random() > 0.5
      }
    });
  };
  
  const createAgent = async () => {
    setIsCreating(true);
    setCreationError(null);
    
    try {
      // Transform the clients object into an array format for Eliza
      const activeClients = [];
      
      // Direct chat is always enabled
      activeClients.push("direct");
      
      // Add other clients if enabled
      if (agentConfig.clients.discord) activeClients.push("discord");
      if (agentConfig.clients.twitter) activeClients.push("twitter");
      if (agentConfig.clients.telegram) activeClients.push("telegram");
      if (agentConfig.clients.slack) activeClients.push("slack");
      if (agentConfig.clients.simsai) activeClients.push("simsai");
      
      // Prepare the Eliza character file format
      const elizaCharacterConfig = {
        name: agentConfig.name,
        modelProvider: agentConfig.modelProvider || 'openrouter',
        clients: activeClients,
        plugins: agentConfig.plugins,
        settings: {
          ragKnowledge: agentConfig.memorySettings.enableRagKnowledge,
          secrets: {},
          model: agentConfig.model || 'openai/gpt-4o-mini'
        },
        // Add system prompt based on personality
        system: `You are ${agentConfig.name}. ${agentConfig.description}\n\nPersonality: ${agentConfig.personality}`,
        // Parse personality into structured components
        ...parsePersonalityToBio(agentConfig.personality),
        // Add character bio
        bio: [
          agentConfig.description,
          ...agentConfig.personality.split('\n').filter(line => line.trim())
        ],
        // Required message examples
        messageExamples: [[
          {
            user: "user1",
            content: { text: "What's your trading strategy?" },
            response: `As ${agentConfig.name}, I ${agentConfig.description}`
          }
        ]],
        // Required post examples
        postExamples: [
          `${agentConfig.name} analyzing market trends: ${agentConfig.description}`,
          `Trading update from ${agentConfig.name}: Market analysis based on ${agentConfig.personality.split('\n')[0] || 'technical analysis'}`
        ],
        style: {
          all: [],
          chat: agentConfig.personality.split('\n')
            .filter(line => line.trim())
            .map(line => line.trim()),
          post: []
        },
        // Add memory settings
        memorySettings: {
          enableRagKnowledge: agentConfig.memorySettings.enableRagKnowledge,
          enableLoreMemory: agentConfig.memorySettings.enableLoreMemory,
          enableDescriptionMemory: agentConfig.memorySettings.enableDescriptionMemory,
          enableDocumentsMemory: agentConfig.memorySettings.enableDocumentsMemory
        }
      };
      
      // Send the request in the format expected by the backend API
      const response = await axios.post('http://localhost:3001/api/agents', {
        templateName: agentConfig.templateName,
        name: agentConfig.name,
        description: agentConfig.description,
        character: elizaCharacterConfig
      });
      
      console.log('Agent created:', response.data);
      
      // Refresh the agents list
      fetchAgents();
      
      // Reset form or redirect
      // router.push('/agents');
      
    } catch (error) {
      console.error('Error creating agent:', error);
      setCreationError('Failed to create agent. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  
  // Helper function to parse personality text into bio elements
  const parsePersonalityToBio = (personality: string) => {
    if (!personality) {
      // Return default values for required fields if no personality is provided
      return {
        lore: ["A trading agent focused on market analysis"],
        topics: ["trading", "market analysis", "investment strategies"],
        adjectives: ["analytical", "data-driven", "strategic"]
      };
    }
    
    // Split by periods and filter out empty strings
    const sentences = personality.split('.').filter(s => s.trim().length > 0);
    
    // Extract potential topics (more comprehensive implementation)
    const topicsKeywords = [
      'specializes in', 'expertise in', 'focus on', 'knowledge of', 'skilled in',
      'specializing in', 'expert in', 'focuses on', 'familiar with', 'proficient in',
      'trading', 'market', 'analysis', 'strategy', 'investment', 'risk', 'technical',
      'fundamental', 'cryptocurrency', 'forex', 'stocks', 'options', 'commodities'
    ];
    
    const topics: string[] = [];
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      for (const keyword of topicsKeywords) {
        if (lowerSentence.includes(keyword)) {
          // Extract the topic phrase
          const topicPhrase = sentence.trim();
          
          // Only add if not already included
          if (!topics.includes(topicPhrase)) {
            topics.push(topicPhrase);
          }
          break;
        }
      }
    });
    
    // If no topics were found, add default trading topics
    if (topics.length === 0) {
      topics.push("trading", "market analysis", "investment strategies");
    }
    
    // Extract potential traits/adjectives
    const adjectiveKeywords = [
      'is', 'approach is', 'style is', 'personality is', 'character is',
      'analytical', 'conservative', 'aggressive', 'balanced', 'methodical',
      'cautious', 'risk-averse', 'risk-taking', 'data-driven', 'intuitive',
      'technical', 'fundamental', 'quantitative', 'qualitative'
    ];
    
    const adjectives: string[] = [];
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      for (const keyword of adjectiveKeywords) {
        if (lowerSentence.includes(keyword)) {
          const adjectivePhrase = sentence.trim();
          
          // Only add if not already included
          if (!adjectives.includes(adjectivePhrase)) {
            adjectives.push(adjectivePhrase);
          }
          break;
        }
      }
    });
    
    // If no adjectives were found, add default trading-related adjectives
    if (adjectives.length === 0) {
      adjectives.push("analytical", "data-driven", "strategic");
    }
    
    // Remaining sentences become lore
    const lore = sentences
      .filter(sentence => {
        const lowerSentence = sentence.toLowerCase();
        
        // Check if sentence contains any topic or adjective keyword
        const isTopicSentence = topicsKeywords.some(keyword => 
          lowerSentence.includes(keyword.toLowerCase())
        );
        
        const isAdjectiveSentence = adjectiveKeywords.some(keyword => 
          lowerSentence.includes(keyword.toLowerCase())
        );
        
        return !isTopicSentence && !isAdjectiveSentence;
      })
      .map(s => s.trim());
    
    // If no lore was extracted, add a default lore entry
    if (lore.length === 0) {
      lore.push(`A trading agent specializing in market analysis and strategic investment decisions`);
    }
    
    return {
      lore,
      topics,
      adjectives
    };
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Create Your Trading Agent</h1>
      
      {/* Agents Top Bar */}
      <div className="mb-6">
        <GlassCard className="w-full" noHoverEffect={true}>
          <GlassCardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Your Agents</h2>
                {agents.length > 0 && (
                  <span className="bg-[#D4C6A1]/20 text-[#D4C6A1] text-xs px-2 py-1 rounded-full">
                    {agents.length}
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={fetchAgents}
                disabled={isLoadingAgents}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingAgents ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {loadAgentError && (
              <div className="text-red-500 text-sm mb-4">
                {loadAgentError}
              </div>
            )}
            
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {agents.length === 0 ? (
                <div className="text-white/70 text-sm py-4">
                  {isLoadingAgents ? 'Loading agents...' : 'No agents created yet. Create your first agent below!'}
                </div>
              ) : (
                <AnimatePresence>
                  {agents.map((agent, index) => (
                    <motion.div 
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`flex-shrink-0 w-40 bg-black/30 border ${selectedAgent?.id === agent.id ? 'border-[#D4C6A1]' : 'border-white/10'} 
                        rounded-lg p-3 cursor-pointer transition-all hover:bg-black/40`}
                      onClick={() => setSelectedAgent(agent.id === selectedAgent?.id ? null : agent)}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-12 h-12 rounded-full bg-[#D4C6A1]/20 flex items-center justify-center text-[#D4C6A1] text-lg font-semibold">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                        <p className="text-white/70 text-xs mt-1 truncate">{agent.id.substring(0, 8)}</p>
                        <div className="mt-2 flex justify-center gap-2">
                          <button
                            className="text-xs text-[#D4C6A1] hover:text-[#BFB28F] flex items-center px-2 py-1 bg-[#D4C6A1]/10 rounded-sm hover:bg-[#D4C6A1]/20 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadAgentDetails(agent.id);
                            }}
                          >
                            Load
                          </button>
                          <Link 
                            to={`/agents/${agent.id}`}
                            className="text-xs text-[#D4C6A1] hover:text-[#BFB28F] flex items-center gap-1 px-2 py-1 bg-[#D4C6A1]/10 rounded-sm hover:bg-[#D4C6A1]/20 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agent Preview Card */}
        <GlassCard className="w-full" noHoverEffect={true}>
          <GlassCardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Agent Preview</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdvancedMode(!advancedMode)}
                  className="flex items-center gap-1 text-xs bg-black/30 hover:bg-black/50 text-white/70 hover:text-white px-2 py-1 rounded-md border border-white/10"
                >
                  <Settings className="w-3 h-3" />
                  {advancedMode ? 'Simple Mode' : 'Advanced Mode'}
                </button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={generateRandomAgent}
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate Random
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Agent Image Column - More compact */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-2">
                  <img 
                    src={agentConfig.picture} 
                    alt="Agent" 
                    className="w-full h-full object-cover rounded-full border-2 border-[#D4C6A1]/30"
                  />
                  <label className="absolute bottom-0 right-0 bg-[#D4C6A1]/20 hover:bg-[#D4C6A1]/30 text-[#D4C6A1] border border-[#D4C6A1]/30 rounded-full p-1 cursor-pointer">
                    <Upload className="h-3 w-3" />
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </label>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-sm">{agentConfig.name || 'Agent Name'}</h3>
                  <p className="text-white/70 text-xs">{agentConfig.ticker || 'TICKER'}</p>
                </div>
              </div>
              
              {/* Agent Details Column */}
              <div className="md:col-span-3">
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50"
                      placeholder="e.g. AlphaTrader"
                      value={agentConfig.name}
                      onChange={(e) => setAgentConfig({...agentConfig, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Ticker</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50"
                      placeholder="e.g. ALPH (max 5 characters)"
                      maxLength={5}
                      value={agentConfig.ticker}
                      onChange={(e) => setAgentConfig({...agentConfig, ticker: e.target.value.toUpperCase()})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Description</label>
                    <textarea 
                      className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 resize-none"
                      rows={3}
                      placeholder="e.g. A trading agent specializing in cryptocurrency analysis and trading strategies"
                      value={agentConfig.description}
                      onChange={(e) => setAgentConfig({...agentConfig, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Personality</label>
                    <textarea 
                      className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 resize-none"
                      rows={3}
                      placeholder="Describe your agent's trading personality and strategy in detail. Include their approach to risk, preferred markets, analysis style, and any specialized knowledge. This will be used to generate the agent's character."
                      value={agentConfig.personality}
                      onChange={(e) => setAgentConfig({...agentConfig, personality: e.target.value})}
                    />
                  </div>
                </div>
                
                {/* Client Integrations */}
                <div className="mt-3">
                  <label className="block text-white/70 text-xs mb-1">Client Integrations</label>
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableDiscord"
                        className="mr-2"
                        checked={agentConfig.clients.discord}
                        onChange={(e) => setAgentConfig({
                          ...agentConfig, 
                          clients: {
                            ...agentConfig.clients,
                            discord: e.target.checked
                          }
                        })}
                      />
                      <label htmlFor="enableDiscord" className="text-white/70 text-xs flex items-center">
                        <DiscordLogo className="w-3 h-3 mr-1 text-white/70" /> Discord
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableTwitter"
                        className="mr-2"
                        checked={agentConfig.clients.twitter}
                        onChange={(e) => {
                          setAgentConfig({
                            ...agentConfig, 
                            clients: {
                              ...agentConfig.clients,
                              twitter: e.target.checked
                            },
                            enableTwitter: e.target.checked
                          });
                        }}
                      />
                      <label htmlFor="enableTwitter" className="text-white/70 text-xs flex items-center">
                        <XLogo className="w-3 h-3 mr-1 text-white/70" /> X
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Create Button */}
            <div className="flex justify-center mt-4">
              <Button
                className="w-full bg-gradient-to-r from-[#D4C6A1] to-[#BFB28F] hover:from-[#BFB28F] hover:to-[#D4C6A1] text-black font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                onClick={createAgent}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create & Launch Agent'}
              </Button>
            </div>
            
            {creationError && (
              <div className="mt-2 text-red-500 text-sm">
                {creationError}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
        
        {/* Chat Interface - Now full width and taller */}
        <GlassCard className="w-full h-[600px]" noHoverEffect={true}>
          <GlassCardContent className="p-4 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Chat Preview</h2>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" ref={chatContainerRef}>
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div 
                    className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user' 
                        ? 'bg-[#D4C6A1]/20 text-white' 
                        : 'bg-black/20 text-white'
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="text-xs text-white/50 block mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex">
              <input 
                type="text" 
                className="flex-1 bg-black/20 border border-white/10 text-white rounded-l-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button 
                variant="secondary" 
                className="bg-[#D4C6A1]/20 hover:bg-[#D4C6A1]/30 text-[#D4C6A1] border border-[#D4C6A1]/30 rounded-r-lg px-4"
                onClick={handleSendMessage}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </GlassCardContent>
        </GlassCard>
        
        {/* Advanced Configuration - Only shown in advanced mode */}
        {advancedMode && (
          <GlassCard className="w-full">
            <GlassCardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Advanced Configuration</h2>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                {/* Memory Management */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2 border-b border-white/10 pb-1">Memory Management</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableRagKnowledge"
                        className="mr-2"
                        checked={agentConfig.memorySettings.enableRagKnowledge}
                        onChange={(e) => setAgentConfig({
                          ...agentConfig,
                          memorySettings: {
                            ...agentConfig.memorySettings,
                            enableRagKnowledge: e.target.checked
                          }
                        })}
                      />
                      <label htmlFor="enableRagKnowledge" className="text-white/70 text-xs">
                        Enable RAG Knowledge
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableLoreMemory"
                        className="mr-2"
                        checked={agentConfig.memorySettings.enableLoreMemory}
                        onChange={(e) => setAgentConfig({
                          ...agentConfig,
                          memorySettings: {
                            ...agentConfig.memorySettings,
                            enableLoreMemory: e.target.checked
                          }
                        })}
                      />
                      <label htmlFor="enableLoreMemory" className="text-white/70 text-xs">
                        Enable Lore Memory
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableDescriptionMemory"
                        className="mr-2"
                        checked={agentConfig.memorySettings.enableDescriptionMemory}
                        onChange={(e) => setAgentConfig({
                          ...agentConfig,
                          memorySettings: {
                            ...agentConfig.memorySettings,
                            enableDescriptionMemory: e.target.checked
                          }
                        })}
                      />
                      <label htmlFor="enableDescriptionMemory" className="text-white/70 text-xs">
                        Enable Description Memory
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableDocumentsMemory"
                        className="mr-2"
                        checked={agentConfig.memorySettings.enableDocumentsMemory}
                        onChange={(e) => setAgentConfig({
                          ...agentConfig,
                          memorySettings: {
                            ...agentConfig.memorySettings,
                            enableDocumentsMemory: e.target.checked
                          }
                        })}
                      />
                      <label htmlFor="enableDocumentsMemory" className="text-white/70 text-xs">
                        Enable Documents Memory
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Plugins Section */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2 border-b border-white/10 pb-1">Plugins</h3>
                  <div className="space-y-2">
                    <p className="text-white/70 text-xs mb-2">
                      Enable plugins to give your agent additional capabilities.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="pluginSearch"
                          className="mr-2"
                          checked={agentConfig.plugins.includes('search')}
                          onChange={(e) => {
                            const updatedPlugins = e.target.checked 
                              ? [...agentConfig.plugins, 'search']
                              : agentConfig.plugins.filter(p => p !== 'search');
                            
                            setAgentConfig({
                              ...agentConfig,
                              plugins: updatedPlugins
                            });
                          }}
                        />
                        <label htmlFor="pluginSearch" className="text-white/70 text-xs">
                          Web Search
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="pluginWeather"
                          className="mr-2"
                          checked={agentConfig.plugins.includes('weather')}
                          onChange={(e) => {
                            const updatedPlugins = e.target.checked 
                              ? [...agentConfig.plugins, 'weather']
                              : agentConfig.plugins.filter(p => p !== 'weather');
                            
                            setAgentConfig({
                              ...agentConfig,
                              plugins: updatedPlugins
                            });
                          }}
                        />
                        <label htmlFor="pluginWeather" className="text-white/70 text-xs">
                          Weather
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="pluginCalendar"
                          className="mr-2"
                          checked={agentConfig.plugins.includes('calendar')}
                          onChange={(e) => {
                            const updatedPlugins = e.target.checked 
                              ? [...agentConfig.plugins, 'calendar']
                              : agentConfig.plugins.filter(p => p !== 'calendar');
                            
                            setAgentConfig({
                              ...agentConfig,
                              plugins: updatedPlugins
                            });
                          }}
                        />
                        <label htmlFor="pluginCalendar" className="text-white/70 text-xs">
                          Calendar
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="pluginNews"
                          className="mr-2"
                          checked={agentConfig.plugins.includes('news')}
                          onChange={(e) => {
                            const updatedPlugins = e.target.checked 
                              ? [...agentConfig.plugins, 'news']
                              : agentConfig.plugins.filter(p => p !== 'news');
                            
                            setAgentConfig({
                              ...agentConfig,
                              plugins: updatedPlugins
                            });
                          }}
                        />
                        <label htmlFor="pluginNews" className="text-white/70 text-xs">
                          News
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="pluginCrypto"
                          className="mr-2"
                          checked={agentConfig.plugins.includes('crypto')}
                          onChange={(e) => {
                            const updatedPlugins = e.target.checked 
                              ? [...agentConfig.plugins, 'crypto']
                              : agentConfig.plugins.filter(p => p !== 'crypto');
                            
                            setAgentConfig({
                              ...agentConfig,
                              plugins: updatedPlugins
                            });
                          }}
                        />
                        <label htmlFor="pluginCrypto" className="text-white/70 text-xs">
                          Cryptocurrency Data
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="pluginStocks"
                          className="mr-2"
                          checked={agentConfig.plugins.includes('stocks')}
                          onChange={(e) => {
                            const updatedPlugins = e.target.checked 
                              ? [...agentConfig.plugins, 'stocks']
                              : agentConfig.plugins.filter(p => p !== 'stocks');
                            
                            setAgentConfig({
                              ...agentConfig,
                              plugins: updatedPlugins
                            });
                          }}
                        />
                        <label htmlFor="pluginStocks" className="text-white/70 text-xs">
                          Stock Market Data
                        </label>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <label className="block text-white/70 text-xs mb-1">Custom Plugin ID</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          className="flex-1 bg-black/20 border border-white/10 text-white rounded-lg p-2 text-sm focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50"
                          placeholder="Enter plugin ID"
                          value={customPluginId}
                          onChange={(e) => setCustomPluginId(e.target.value)}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-[#D4C6A1]"
                          onClick={() => {
                            if (customPluginId && !agentConfig.plugins.includes(customPluginId)) {
                              setAgentConfig({
                                ...agentConfig,
                                plugins: [...agentConfig.plugins, customPluginId]
                              });
                              setCustomPluginId('');
                            }
                          }}
                          disabled={!customPluginId || agentConfig.plugins.includes(customPluginId)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    
                    {/* Display active plugins */}
                    {agentConfig.plugins.length > 0 && (
                      <div className="mt-2">
                        <label className="block text-white/70 text-xs mb-1">Active Plugins</label>
                        <div className="flex flex-wrap gap-2">
                          {agentConfig.plugins.map(plugin => (
                            <div 
                              key={plugin} 
                              className="bg-[#D4C6A1]/10 text-[#D4C6A1] text-xs px-2 py-1 rounded-md flex items-center"
                            >
                              {plugin}
                              <button 
                                className="ml-2 text-white/50 hover:text-white"
                                onClick={() => {
                                  setAgentConfig({
                                    ...agentConfig,
                                    plugins: agentConfig.plugins.filter(p => p !== plugin)
                                  });
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Bio & Lore Section */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2 border-b border-white/10 pb-1">Bio & Lore</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Bio (Core identity, character biography)</label>
                      <textarea 
                        className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 resize-none"
                        placeholder="Enter one bio statement per line (e.g. 'Expert in cryptocurrency trading')"
                        rows={3}
                        value={''}
                        onChange={(e) => {}}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Lore (Character background elements)</label>
                      <textarea 
                        className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 resize-none"
                        placeholder="Enter one lore statement per line (e.g. 'Created by a team of quant traders in 2023')"
                        rows={3}
                        value={''}
                        onChange={(e) => {}}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Style & Personality Section */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2 border-b border-white/10 pb-1">Style & Personality</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Adjectives (one per line)</label>
                      <textarea 
                        className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 resize-none"
                        placeholder="Enter one adjective per line (e.g. 'Analytical')"
                        rows={2}
                        value={''}
                        onChange={(e) => {}}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Topics (one per line)</label>
                      <textarea 
                        className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 resize-none"
                        placeholder="Enter one topic per line (e.g. 'Technical Analysis')"
                        rows={2}
                        value={''}
                        onChange={(e) => {}}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Style Guidelines Section */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2 border-b border-white/10 pb-1">Style Guidelines</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/70 text-xs mb-1">General Style (one per line)</label>
                      <textarea 
                        className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 resize-none"
                        placeholder="Enter one style guideline per line (e.g. 'Clear and concise communication')"
                        rows={2}
                        value={''}
                        onChange={(e) => {}}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Chat Style (one per line)</label>
                      <textarea 
                        className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 resize-none"
                        placeholder="Enter one chat style guideline per line (e.g. 'Engage with curiosity')"
                        rows={2}
                        value={''}
                        onChange={(e) => {}}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Post Style (one per line)</label>
                      <textarea 
                        className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 resize-none"
                        placeholder="Enter one post style guideline per line (e.g. 'Keep posts informative')"
                        rows={2}
                        value={''}
                        onChange={(e) => {}}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Examples Section */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2 border-b border-white/10 pb-1">Examples</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Message Examples (one per line)</label>
                      <textarea 
                        className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 resize-none"
                        placeholder="Enter example user messages (e.g. 'What do you think about Bitcoin's current price action?')"
                        rows={2}
                        value={''}
                        onChange={(e) => {}}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-xs mb-1">Post Examples (one per line)</label>
                      <textarea 
                        className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 resize-none"
                        placeholder="Enter example social posts (e.g. 'BTC analysis: Support at $45K, resistance at $48K...')"
                        rows={2}
                        value={''}
                        onChange={(e) => {}}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Additional Client Types */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2 border-b border-white/10 pb-1">Additional Clients</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="advancedEnableDiscord"
                        className="mr-2"
                        checked={agentConfig.clients.discord}
                        onChange={(e) => setAgentConfig({
                          ...agentConfig, 
                          clients: {
                            ...agentConfig.clients,
                            discord: e.target.checked
                          }
                        })}
                      />
                      <label htmlFor="advancedEnableDiscord" className="text-white/70 text-xs flex items-center">
                        <DiscordLogo className="w-3 h-3 mr-1 text-white/70" /> Discord
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="advancedEnableTwitter"
                        className="mr-2"
                        checked={agentConfig.clients.twitter}
                        onChange={(e) => setAgentConfig({
                          ...agentConfig, 
                          clients: {
                            ...agentConfig.clients,
                            twitter: e.target.checked
                          },
                          enableTwitter: e.target.checked
                        })}
                      />
                      <label htmlFor="advancedEnableTwitter" className="text-white/70 text-xs flex items-center">
                        <XLogo className="w-3 h-3 mr-1 text-white/70" /> X
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableTelegram"
                        className="mr-2"
                        checked={agentConfig.clients.telegram}
                        onChange={(e) => setAgentConfig({
                          ...agentConfig, 
                          clients: {
                            ...agentConfig.clients,
                            telegram: e.target.checked
                          }
                        })}
                      />
                      <label htmlFor="enableTelegram" className="text-white/70 text-xs">
                        Telegram
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableSlack"
                        className="mr-2"
                        checked={agentConfig.clients.slack}
                        onChange={(e) => setAgentConfig({
                          ...agentConfig, 
                          clients: {
                            ...agentConfig.clients,
                            slack: e.target.checked
                          }
                        })}
                      />
                      <label htmlFor="enableSlack" className="text-white/70 text-xs">
                        Slack
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableSimsai"
                        className="mr-2"
                        checked={agentConfig.clients.simsai}
                        onChange={(e) => setAgentConfig({
                          ...agentConfig, 
                          clients: {
                            ...agentConfig.clients,
                            simsai: e.target.checked
                          }
                        })}
                      />
                      <label htmlFor="enableSimsai" className="text-white/70 text-xs">
                        SimsAI
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export { CreateAgent };

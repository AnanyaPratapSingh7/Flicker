import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Send, ArrowLeft } from 'lucide-react';
import { GlassCard, GlassCardContent } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import './AgentChat.css'; // Import CSS for custom scrollbar

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Agent {
  id: string;
  name: string;
  description?: string;
}

export const AgentChat: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:3001/api/agents/${agentId}`);
        console.log('Agent API response:', response.data);
        // The response now contains the agent data directly, no need to access .agent
        const agentData = response.data;
        console.log('Extracted agent data:', agentData);
        setAgent(agentData);
        
        // Add welcome message from the agent
        setMessages([
          {
            role: 'assistant',
            content: `Hello! I'm ${agentData?.name || 'Agent'}, your ${agentData?.description || 'trading assistant'}. How can I help you today?`,
            timestamp: new Date()
          }
        ]);
      } catch (error) {
        console.error('Error fetching agent details:', error);
        setError('Failed to load agent. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId]);

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

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;
    
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
      const response = await axios.post(`http://localhost:3001/api/agents/${agentId}/message`, {
        message: tempInputMessage
      });
      
      // Add agent response
      const agentResponse: Message = {
        role: 'assistant',
        content: response.data.response || "I'm sorry, I couldn't process your request at this time.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Error sending message to agent:', error);
      
      // Add error message from assistant
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, there was an error processing your message. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-white p-4 md:p-6 flex items-center justify-center">
        <div className="animate-pulse">Loading agent...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white p-4 md:p-6 flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/create-agent">
          <Button variant="outline">Return to Agent List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link to="/create-agent" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Agents
            </Button>
          </Link>
          
          {agent && (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#D4C6A1]/20 flex items-center justify-center text-[#D4C6A1] text-lg font-semibold mr-3">
                {agent.name ? agent.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{agent.name || 'Agent'}</h1>
                {agent.description && (
                  <p className="text-white/70 text-sm">{agent.description}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <GlassCard className="w-full" noHoverEffect={true}>
          <GlassCardContent className="p-4 flex flex-col h-[calc(100vh-200px)]">
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
                placeholder={`Message ${agent?.name || 'Agent'}...`}
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
      </div>
    </div>
  );
};

export default AgentChat; 
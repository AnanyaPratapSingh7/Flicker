import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Message interface for chat messages
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

// AI suggestion interface
interface AISuggestion {
  field: string;
  value: string;
  applied: boolean;
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
  modelProvider: string;
  model: string;
  memorySettings: {
    enableRagKnowledge: boolean;
    enableLoreMemory: boolean;
    enableDescriptionMemory: boolean;
    enableDocumentsMemory: boolean;
  };
  plugins: string[];
}

interface AssistantThreadProps {
  currentStep: string;
  stepTitle: string;
  agentConfig: AgentConfig;
  onMessageSent: (message: string) => void;
  onSuggestionReceived: (suggestions: AISuggestion[]) => void;
}

export const AssistantThread: React.FC<AssistantThreadProps> = ({
  currentStep,
  stepTitle,
  agentConfig,
  onMessageSent,
  onSuggestionReceived
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [aiAssistEnabled, setAiAssistEnabled] = useState<boolean>(true);
  const [aiIsGenerating, setAiIsGenerating] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Step messages for different wizard steps
  const STEP_MESSAGES = {
    identity: `I'll help you create your agent's core identity. What would you like to name your agent? What is its primary purpose?`,
    style: `Now let's define how your agent communicates. What kind of personality should it have? Formal, casual, technical, friendly?`,
    technical: `Let's configure the technical aspects of your agent. You can select which model to use and enable various memory features.`,
    review: `Here's a summary of your agent configuration. Please review and make any final changes before creating your agent.`
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add initial message when component mounts or step changes
  useEffect(() => {
    const initialMessage = {
      role: 'assistant' as const,
      content: STEP_MESSAGES[currentStep as keyof typeof STEP_MESSAGES] || 'How can I help you create your agent?',
      timestamp: Date.now()
    };
    
    setMessages([initialMessage]);
    setIsTyping(false);
    setAiIsGenerating(false);
  }, [currentStep]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    onMessageSent(inputMessage);
    
    // Clear input
    setInputMessage('');
    
    // Generate AI response
    generateAIResponse(inputMessage);
  };

  // Process user message for AI
  const processUserMessage = (message: string): string => {
    return `User is creating an agent and is currently on the "${stepTitle}" step. Current agent config: ${JSON.stringify(agentConfig)}. User message: ${message}`;
  };

  // Extract suggestions from AI responses
  const extractSuggestions = (content: string): AISuggestion[] => {
    const suggestions: AISuggestion[] = [];
    
    // Look for suggestion patterns like [SUGGESTION:field:value]
    const suggestionRegex = /\[SUGGESTION:(.*?):(.*?)\]/g;
    let match;
    
    while ((match = suggestionRegex.exec(content)) !== null) {
      if (match.length >= 3) {
        suggestions.push({
          field: match[1].trim(),
          value: match[2].trim(),
          applied: false
        });
      }
    }
    
    return suggestions;
  };

  // Generate AI response
  const generateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    setAiIsGenerating(true);
    
    try {
      // In a real implementation, this would call your AI API
      // For now, we'll simulate a response
      
      // Prepare context about the current step and form state
      const context = {
        currentStep,
        agentName: agentConfig.name || '',
        agentDescription: agentConfig.description || '',
        personality: agentConfig.personality || '',
      };
      
      // Process the user message with context
      const processedMessage = processUserMessage(userMessage);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a response based on the current step
      let aiResponse = '';
      const suggestions: AISuggestion[] = [];
      
      if (currentStep === 'identity') {
        if (userMessage.toLowerCase().includes('name')) {
          const nameMatch = userMessage.match(/(?:name|call it|named) ['"]?([a-zA-Z0-9\s]+)['"]?/i);
          if (nameMatch && nameMatch[1]) {
            const extractedName = nameMatch[1].trim();
            aiResponse = `"${extractedName}" is a great name! [SUGGESTION:name:${extractedName}] What will this agent's primary purpose be?`;
          } else {
            aiResponse = "What would you like to name your agent?";
          }
        } else if (userMessage.toLowerCase().includes('purpose') || userMessage.toLowerCase().includes('do')) {
          const purposeMatch = userMessage.match(/(?:purpose|do) (?:is|would be|will be) ['"]?([^.'"\n]+)[.'"\n]?/i);
          if (purposeMatch && purposeMatch[1]) {
            const extractedPurpose = purposeMatch[1].trim();
            aiResponse = `I understand that your agent will ${extractedPurpose}. [SUGGESTION:description:${extractedPurpose}] Would you like to add any specific personality traits?`;
          } else {
            aiResponse = "What will be the primary purpose of this agent?";
          }
        } else {
          aiResponse = "I'm here to help you create your agent. Would you like to start by giving it a name and purpose?";
        }
      } else if (currentStep === 'style') {
        if (userMessage.toLowerCase().includes('formal')) {
          aiResponse = "A formal communication style is perfect for professional contexts. [SUGGESTION:personality:The agent communicates in a formal, professional manner with clear and concise language.]";
        } else if (userMessage.toLowerCase().includes('casual') || userMessage.toLowerCase().includes('friendly')) {
          aiResponse = "A casual, friendly style works well for most users. [SUGGESTION:personality:The agent has a casual, friendly tone that makes conversations feel natural and engaging.]";
        } else if (userMessage.toLowerCase().includes('technical')) {
          aiResponse = "A technical style is good for specialized domains. [SUGGESTION:personality:The agent uses technical language appropriate for domain experts, focusing on precision and detail.]";
        } else {
          aiResponse = "What kind of communication style would you like your agent to have? Formal, casual, technical, or something else?";
        }
      } else if (currentStep === 'technical') {
        aiResponse = "You can configure which AI model to use and what memory features to enable. What's most important for your use case?";
      } else if (currentStep === 'review') {
        aiResponse = `Your agent "${agentConfig.name}" is ready to be created! Is there anything you'd like to change before finalizing?`;
      } else {
        aiResponse = "How else can I help you create your agent?";
      }
      
      // Extract any suggestions from the AI response
      const extractedSuggestions = extractSuggestions(aiResponse);
      if (extractedSuggestions.length > 0) {
        onSuggestionReceived(extractedSuggestions);
      }
      
      // Clean up the response by removing suggestion markers
      const cleanResponse = aiResponse.replace(/\[SUGGESTION:(.*?):(.*?)\]/g, '');
      
      // Add AI response to messages
      const assistantMessage: Message = {
        role: 'assistant',
        content: cleanResponse,
        timestamp: Date.now()
      };
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error generating a response. Please try again.',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setAiIsGenerating(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center ${aiAssistEnabled ? 'text-purple-400' : 'text-gray-400'}`}
            onClick={() => setAiAssistEnabled(!aiAssistEnabled)}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            {aiAssistEnabled ? 'AI Enabled' : 'AI Disabled'}
          </Button>
        </div>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-purple-600/30 text-white' 
                    : 'bg-gray-700/50 text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.timestamp && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-700/50 text-white p-3 rounded-lg">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask the AI assistant for help..."
            className="flex-1 bg-gray-800 text-white rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
            disabled={aiIsGenerating}
          />
          <Button
            className="rounded-l-none bg-purple-600 hover:bg-purple-700"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || aiIsGenerating}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

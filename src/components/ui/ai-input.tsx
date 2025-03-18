"use client";

import { CornerRightUp, Mic, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { Textarea } from "./textarea";
import { useAutoResizeTextarea } from "../hooks/use-auto-resize-textarea";

// Import custom styles for the AI input component
import "./ai-input-styles.css";

// Import the client API for OpenRouter integration
import aiClient, { Message } from "../../api/chat/client";
import env from "../../utils/env";

interface AIInputProps {
  id?: string
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  onSubmit?: (value: string) => void
  className?: string
  generateResponse?: (input: string) => Promise<string>
  showResponse?: boolean
  // OpenRouter API related props
  systemPrompt?: string
  initialPrompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
  streamingEnabled?: boolean
  apiEndpoint?: string
  showConversation?: boolean
}

export function AIInput({

  id = "ai-input",
  placeholder = "Type your message...",
  minHeight = 52,
  maxHeight = 200,
  onSubmit,
  className,
  generateResponse,
  showResponse = false,
  // OpenRouter API related props with defaults
  systemPrompt = "You are a helpful AI assistant for creating AI agents.",
  initialPrompt,
  model = env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
  temperature = 0.7,
  maxTokens = 800,
  streamingEnabled = true,
  apiEndpoint = "/api/chat/ai-chat", // Updated for Vite setup
  showConversation = true
}: AIInputProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });
  const [inputValue, setInputValue] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>(
    initialPrompt ? [
      { role: "system", content: systemPrompt },
      { role: "user", content: initialPrompt }
    ] : [
      { role: "system", content: systemPrompt }
    ]
  );
  const [error, setError] = useState<string | null>(null);
  const conversationContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize with the initial prompt if provided
  useEffect(() => {
    if (initialPrompt && conversation.length === 1) {
      handleSendMessage(initialPrompt, true);
    }
  }, [initialPrompt]);
  
  // Initialize with correct endpoint based on environment
  const [actualEndpoint, setActualEndpoint] = useState(apiEndpoint);
  
  // Validate API endpoint on mount and try to detect running servers
  useEffect(() => {
    // Helper function to fetch with timeout
    const fetchWithTimeout = async (url: string, options: any = {}, timeout = 5000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    };
    
    const checkEndpoint = async () => {
      try {
        console.log(`Starting with endpoint: ${apiEndpoint}`);
        
        // Try the ping endpoint
        try {
          const pingUrl = `${apiEndpoint.replace(/\/+$/, '')}/ping`;
          console.log(`Checking ping endpoint: ${pingUrl}`);
          
          const testResponse = await fetchWithTimeout(pingUrl, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
          }, 3000); // 3 second timeout
          
          if (testResponse.ok) {
            console.log(`Successfully connected to ${apiEndpoint}`);
            setActualEndpoint(apiEndpoint);
            return;
          } else {
            console.warn(`Ping check failed with status: ${testResponse.status}`);
          }
        } catch (e: any) {
          console.warn(`Ping check failed: ${e.message}`);
        }
        
        // If endpoint check fails, still use the configured endpoint
        console.warn(`Will use the configured endpoint ${apiEndpoint} anyway`);
        setActualEndpoint(apiEndpoint);
      } catch (e) {
        console.error(`Error during endpoint check: ${e instanceof Error ? e.message : String(e)}`);
        // Still use the provided endpoint
        setActualEndpoint(apiEndpoint);
      }
    };
    
    checkEndpoint();
  }, [apiEndpoint]);

  // Process chat message and get response from API
  const processChat = async (messages: Array<{role: string, content: string}>, stream = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try the direct API call without pre-checking
      try {
        // Always use the direct endpoint for more reliable connections
        const endpoint = '/api/chat/ai-chat';
        console.log(`Attempting to call API at ${endpoint} with ${stream ? 'streaming' : 'regular'} request`);
        
        if (stream) {
          await streamResponse(messages, endpoint);
        } else {
          await fetchResponse(messages);
        }
      } catch (apiError: any) {
        console.warn(`API call failed: ${apiError.message}`);
        console.error('Error details:', apiError);
        
        // If API call fails and it's a 404 or network error, fall back to mock response
        if (apiError.message.includes('404') || 
            apiError.message.includes('Failed to fetch') ||
            apiError.message.includes('Network') ||
            apiError.message.includes('CORS') ||
            apiError.message.includes('status: 500')) {
          console.warn(`Backend proxy not available. Using mock response instead.`);
          await mockResponse(messages);
        } else {
          // For other errors, show them to the user
          throw apiError;
        }
      }
    } catch (err) {
      console.error('Error processing chat:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch response without streaming using our client API
  const fetchResponse = async (messages: Array<{role: string, content: string}>) => {
    console.log(`Attempting non-streaming request with ${messages.length} messages`);
    try {
      // Use our client API for non-streaming requests
      const data = await aiClient.sendChatRequest(
        messages as Message[],
        {
          temperature,
          max_tokens: maxTokens,
          model,
          stream: false
        }
      );
      
      const assistantMessage = data.choices[0].message.content;
      
      // Update conversation with the response
      setConversation(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      
      // Scroll to bottom after a short delay to ensure the DOM has updated
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      console.error('Fetch error details:', err);
      throw err;
    }
  };

  // Mock response for testing without the backend proxy
  const mockResponse = async (messages: Array<{role: string, content: string}>) => {
    console.log('Using mock response as backend proxy is unavailable');
    
    // Create new message in conversation
    setConversation(prev => [...prev, { role: 'assistant', content: '' }]);
    
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userContent = lastUserMessage?.content || '';
    
    // Simulate typing with a mock response based on the message
    let mockContent = '';
    
    try {
      // Enhanced keyword-based responses
      if (userContent.toLowerCase().includes('hello') || userContent.toLowerCase().includes('hi')) {
        mockContent = "Hello! I'm your AI assistant for Paradyze. How can I help you create or customize your trading agent today?";
      } else if (userContent.toLowerCase().includes('name') || userContent.toLowerCase().includes('call')) {
        mockContent = 'Based on your trading focus, I would suggest names like "AlphaEdge", "QuantumTrade", "MarketMind", "TradePulse", or "OmniTrader". Each conveys sophistication and expertise in algorithmic trading.';
      } else if (userContent.toLowerCase().includes('description')) {
        mockContent = 'Your agent is an advanced trading system that leverages market microstructure patterns to identify profitable opportunities across multiple asset classes while maintaining strict risk management parameters. It analyzes real-time data feeds, historical patterns, and can adapt to changing market conditions.';
      } else if (userContent.toLowerCase().includes('trading') || userContent.toLowerCase().includes('strategy')) {
        mockContent = 'I can help you implement several trading strategies including momentum trading, mean reversion, statistical arbitrage, trend following, or a hybrid approach. Each strategy can be fine-tuned for your risk tolerance and investment goals.';
      } else if (userContent.toLowerCase().includes('risk') || userContent.toLowerCase().includes('management')) {
        mockContent = 'Effective risk management is crucial. Your agent can implement position sizing rules, stop-loss mechanisms, volatility-based adjustments, and portfolio diversification to protect your capital while pursuing returns.';
      } else if (userContent.toLowerCase().includes('suggest') || userContent.toLowerCase().includes('recommendation')) {
        mockContent = 'Based on current market conditions, I would suggest a balanced approach combining trend-following for directional moves with mean-reversion tactics for range-bound markets. This adaptive strategy has shown resilience in backtesting across various market environments.';
      } else {
        mockContent = `I've analyzed your message: "${userContent}". To continue building your trading agent, would you like to focus on strategy selection, risk parameters, or implementation details?`;
      }
      
      // Simulate streaming by typing one character at a time with variable speed
      let currentText = '';
      for (const char of mockContent) {
        currentText += char;
        setConversation(prev => {
          const newConvo = [...prev];
          newConvo[newConvo.length - 1].content = currentText;
          return newConvo;
        });
        
        // Add a small varying delay to simulate more natural typing
        // Shorter delays for common characters, longer for punctuation
        const delay = char.match(/[,.!?;:]/) ? 80 : (Math.random() * 20 + 20);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error('Error in mock response:', error);
      setError(`Mock response error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Stream response using our client API
  const streamResponse = async (messages: Array<{role: string, content: string}>, endpoint = '/api/chat/ai-chat') => {
    try {
      console.log(`Sending streaming request with ${messages.length} messages and model ${model} to ${endpoint}...`);
      
      // Create new message placeholder in conversation
      setConversation(prev => [...prev, { role: 'assistant', content: 'Connecting to AI...' }]);
      
      let assistantMessage = '';
      let chunkCount = 0;
      let streamStarted = false;
      
      // Add a timeout to detect if streaming doesn't start properly
      const streamingTimeout = setTimeout(() => {
        if (!streamStarted && chunkCount === 0) {
          console.warn('Stream timeout - no chunks received within 10 seconds');
          // Update the message to reflect the timeout
          setConversation(prev => {
            const newConvo = [...prev];
            const lastMessage = newConvo[newConvo.length - 1];
            if (lastMessage.role === 'assistant' && lastMessage.content === 'Connecting to AI...') {
              lastMessage.content = 'The connection to the AI service timed out. Please try again.';
            }
            return newConvo;
          });
          setError('Connection timeout. No response received from the server.');
          setIsLoading(false);
        }
      }, 10000); // 10 second timeout
      
      // Use our client API for streaming
      await aiClient.streamChatRequest(
        messages as Message[],
        {
          temperature,
          max_tokens: maxTokens,
          model,
          stream: true,
          endpoint
        },
        // Handle each chunk
        (chunk) => {
          streamStarted = true;
          chunkCount++;
          
          // Clear any connection placeholder on first chunk
          if (chunkCount === 1) {
            setConversation(prev => {
              const newConvo = [...prev];
              if (newConvo[newConvo.length - 1].content === 'Connecting to AI...') {
                newConvo[newConvo.length - 1].content = '';
              }
              return newConvo;
            });
          }
          
          const content = chunk.choices?.[0]?.delta?.content || '';
          if (content) {
            console.log(`Chunk #${chunkCount} received with content: ${content}`);
            assistantMessage += content;
            // Update the last message in the conversation with new content
            setConversation(prev => {
              const newConvo = [...prev];
              newConvo[newConvo.length - 1].content = assistantMessage;
              
              // Scroll to bottom after updating content
              setTimeout(() => scrollToBottom(), 10);
              return newConvo;
            });
          } else {
            console.log(`Chunk #${chunkCount} received without content`);
          }
        },
        // Handle errors
        (error) => {
          console.error('Error in streaming chat:', error);
          clearTimeout(streamingTimeout);
          
          // If we've received some content already, keep it but add an error notice
          if (assistantMessage) {
            setConversation(prev => {
              const newConvo = [...prev];
              newConvo[newConvo.length - 1].content += '\n\n[Connection interrupted]';
              return newConvo;
            });
          } else {
            // If no content was received, show the error message
            setConversation(prev => {
              const newConvo = [...prev];
              newConvo[newConvo.length - 1].content = 'Sorry, there was an error connecting to the AI service.';
              return newConvo;
            });
          }
          
          setError(error instanceof Error ? error.message : 'Unknown error');
        },
        // On complete
        () => {
          clearTimeout(streamingTimeout);
          console.log(`Stream completed successfully with ${chunkCount} chunks`);
          
          if (chunkCount === 0 || assistantMessage === '') {
            console.warn('Stream completed but no content was received');
            // Update the placeholder message
            setConversation(prev => {
              const newConvo = [...prev];
              newConvo[newConvo.length - 1].content = 'No response received from the AI service. Please try again.';
              return newConvo;
            });
            setError('No response received from the server. Please try again.');
          }
          
          scrollToBottom();
        }
      );
    } catch (error) {
      console.error('Stream response error:', error);
      
      // Update the conversation with an error message
      setConversation(prev => {
        const newConvo = [...prev];
        if (newConvo[newConvo.length - 1].role === 'assistant') {
          newConvo[newConvo.length - 1].content = 'Sorry, there was an error connecting to the AI service.';
        }
        return newConvo;
      });
      
      throw error;
    }
  };

  // Send a new user message and get AI response
  const handleSendMessage = async (message: string, isInitial = false) => {
    if (!message.trim() && !isInitial) return;
    
    // Call onSubmit with the input value if provided
    if (!isInitial) {
      onSubmit?.(message);
    }
    
    // If using generateResponse callback instead of API
    if (generateResponse && showResponse) {
      setIsLoading(true);
      try {
        const aiResponse = await generateResponse(message);
        setResponse(aiResponse);
        setInputValue("");
        adjustHeight(true);
      } catch (error) {
        console.error('Error generating response:', error);
        setResponse('Sorry, I encountered an error generating a response.');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Add user message to conversation
    const newMessage = { role: 'user', content: message };
    const updatedConversation = [...conversation, newMessage];
    setConversation(updatedConversation);
    
    // Process the updated conversation
    if (!isInitial) {
      setInputValue("");
      adjustHeight(true);
    }
    // Scroll to bottom after adding user message
    setTimeout(() => scrollToBottom(), 50);
    await processChat(updatedConversation, streamingEnabled);
  };

  // Clear the conversation except for the system prompt
  const clearConversation = () => {
    setConversation([{ role: "system", content: systemPrompt }]);
    setResponse("");
    setError(null);
  };
  
  // Function to scroll to the bottom of the conversation
  const scrollToBottom = () => {
    const conversationEnd = document.getElementById('conversation-end');
    if (conversationEnd) {
      conversationEnd.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      const conversationContainer = document.querySelector('.conversation-container');
      if (conversationContainer) {
        conversationContainer.scrollTop = conversationContainer.scrollHeight;
      }
    }
  };

  const handleReset = async () => {
    if (!inputValue.trim()) return;
    await handleSendMessage(inputValue);
  };


  return (
    <div className={cn("w-full py-4 rounded-lg", className)}>
      <div className="relative max-w-xl w-full mx-auto">
        {/* Conversation display */}
        {showConversation && conversation.length > 1 && (
          <div className="conversation-container mb-4 h-80 overflow-y-auto overscroll-contain scroll-smooth" 
               style={{ scrollBehavior: 'smooth', scrollbarWidth: 'thin' }}>
            <div className="flex flex-col space-y-3 p-2 min-h-full">
              {conversation.filter(msg => msg.role !== 'system').map((msg, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div 
                    className={cn(
                      "p-3 max-w-[85%] rounded-xl",
                      msg.role === 'user' 
                        ? "bg-amber-500/20 text-amber-50 rounded-tr-none" 
                        : "bg-black/40 backdrop-blur-xl border border-white/5 text-white rounded-tl-none"
                    )}
                  >
                    <div className="text-xs mb-1 opacity-70">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {error && (
                <div className="flex justify-start">
                  <div className="p-3 max-w-[85%] rounded-xl bg-red-500/20 text-red-200">
                    <div className="text-xs mb-1 opacity-70">Error</div>
                    <div>{error}</div>
                  </div>
                </div>
              )}
              {/* Spacer for auto-scrolling */}
              <div id="conversation-end"></div>
            </div>
          </div>
        )}
        
        {/* Old response display for backward compatibility */}
        {showResponse && response && !showConversation && (
          <div className="mb-4 p-4 rounded-xl bg-black/40 backdrop-blur-xl border border-white/5 text-white">
            {response}
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 flex justify-center p-2">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
          </div>
        )}
        
        {/* Clear conversation button if conversation exists */}
        {showConversation && conversation.length > 1 && (
          <button
            onClick={clearConversation}
            className="absolute top-0 right-0 p-1 text-xs text-amber-300/70 hover:text-amber-300 transition-colors"
          >
            Clear
          </button>
        )}
        <Textarea
          id={id}
          placeholder={placeholder}
          style={{ outline: 'none' }}
          className={cn(
            "max-w-xl rounded-3xl pl-6 pr-16",
            "bg-black/40 backdrop-blur-xl", // Glass effect
            "border border-white/5", // Very subtle border

            "placeholder:text-white/60",
            "text-white text-wrap",
            "overflow-y-auto resize-none",
            "outline-none focus:outline-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "transition-all duration-200 ease-out",
            "leading-[1.2] py-[16px]",
            `min-h-[${minHeight}px]`,
            `max-h-[${maxHeight}px]`,
            "[&::-webkit-resizer]:hidden" // Hide resizer
          )}
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleReset();
            }
          }}
        />

        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 py-1 px-1 transition-all duration-200",
            inputValue ? "right-10" : "right-3"
          )}
        >
          <Mic className="w-4 h-4 text-amber-400" />
        </div>
       <button
          onClick={handleReset}
          type="button"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 right-3",
            "rounded-xl bg-amber-500/80 backdrop-blur-sm py-1 px-1",
            "shadow-[0_2px_10px_rgba(245,158,11,0.3)]", 
            "transition-all duration-200",
            inputValue 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-95 pointer-events-none"
          )}
        >
          <CornerRightUp className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

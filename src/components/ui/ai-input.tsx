"use client";

import { CornerRightUp, Mic, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { Textarea } from "./textarea";
import { useAutoResizeTextarea } from "../hooks/use-auto-resize-textarea";

// Import custom styles for the AI input component
import "./ai-input-styles.css";

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
  model = "openai/gpt-4o-mini",
  temperature = 0.7,
  maxTokens = 800,
  streamingEnabled = true,
  apiEndpoint = "http://localhost:3005/api/ai-chat", // Must always be an absolute URL with protocol
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
    const checkEndpoint = async () => {
      try {
        // Validate the URL format
        const url = new URL(apiEndpoint);
        console.log(`Starting with endpoint: ${url.toString()}`);
        
        // Try the specified endpoint first
        try {
          const testResponse = await fetch(`${apiEndpoint.replace(/\/+$/, '')}/ping`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
          });
          if (testResponse.ok) {
            console.log(`Successfully connected to ${apiEndpoint}`);
            setActualEndpoint(apiEndpoint);
            return;
          }
        } catch (e) {
          console.warn(`Primary endpoint ${apiEndpoint} not available, trying alternatives`);
        }
        
        // Try alternative endpoints
        const alternativeEndpoints = [
          'http://localhost:3005/api/ai-chat',
          'http://localhost:3002/api/proxy/ai-chat',
          'http://localhost:3002/api/ai-chat',
          'http://localhost:3000/api/ai-chat'
        ];
        
        for (const endpoint of alternativeEndpoints) {
          if (endpoint === apiEndpoint) continue; // Skip the one we already tried
          
          try {
            console.log(`Trying alternative endpoint: ${endpoint}`);
            const pingURL = `${endpoint.replace(/\/+$/, '')}/ping`;
            const testResponse = await fetch(pingURL, {
              method: 'GET',
              mode: 'cors',
              credentials: 'include',
            });
            
            if (testResponse.ok) {
              console.log(`Successfully connected to ${endpoint}`);
              setActualEndpoint(endpoint);
              return;
            }
          } catch (e) {
            console.warn(`Alternative endpoint ${endpoint} not available`);
          }
        }
        
        // If we get here, none of the endpoints worked
        console.warn('No working endpoints found, will use mock responses');
      } catch (e) {
        console.error(`Invalid API endpoint URL: ${apiEndpoint}`);
        console.error('API URL Error:', e);
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
        console.log(`Attempting to call API at ${actualEndpoint}`);
        
        if (stream) {
          await streamResponse(messages);
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
            apiError.message.includes('CORS')) {
          console.warn(`Backend proxy at ${actualEndpoint} not available. Using mock response instead.`);
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

  // Fetch response without streaming
  const fetchResponse = async (messages: Array<{role: string, content: string}>) => {
    console.log(`Attempting to fetch from ${actualEndpoint} with ${messages.length} messages`);
    try {
      const response = await fetch(actualEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          messages,
          temperature,
          max_tokens: maxTokens,
          model,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
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

  // Stream response
  const streamResponse = async (messages: Array<{role: string, content: string}>) => {
    try {
      console.log(`Sending streaming request to ${actualEndpoint} with ${messages.length} messages and model ${model}...`);
      const response = await fetch(actualEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          messages,
          temperature,
          max_tokens: maxTokens,
          model,
          stream: true
        }),
      });

      // Handle HTTP errors
      if (!response.ok) {
        let errorText = `API error: ${response.status}`;
        try {
          // Try to parse error details
          const errorData = await response.json();
          console.error('API error details:', errorData);
          errorText = errorData.message || errorData.error || errorText;
        } catch (e) {
          // If we can't parse JSON, just use the status
          console.warn('Could not parse error response:', e);
        }
        throw new Error(errorText);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      // Create new message in conversation
      setConversation(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let assistantMessage = '';
      let buffer = ''; // Buffer for incomplete SSE data

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the chunk and append to the buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Process each complete line in the buffer (Server-Sent Events format)
          const lines = buffer.split('\n');
          
          // Keep the last line in the buffer if it's incomplete
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  assistantMessage += content;
                  // Update the last message in the conversation with new content
                  setConversation(prev => {
                    const newConvo = [...prev];
                    newConvo[newConvo.length - 1].content = assistantMessage;
                    
                    // Scroll to bottom after updating content
                    setTimeout(() => scrollToBottom(), 10);
                    return newConvo;
                  });
                }
              } catch (e) {
                console.warn('Error parsing SSE:', e, 'Data:', data);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error reading stream:', error);
        throw error;
      } finally {
        reader.releaseLock();
      }
    } catch (outerError) {
      console.error('Stream response error:', outerError);
      throw outerError;
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

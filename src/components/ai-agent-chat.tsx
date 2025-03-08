import React, { useState } from 'react';
import { AIInput } from './ui/ai-input';
import { AgentPreview } from './agent-preview'; // Assuming you have this component
import { Button } from './ui/button'; // Assuming you have this component

interface AIAgentChatProps {
  agentId?: string;
  agentName?: string;
  agentDescription?: string;
  iconUrl?: string;
  defaultOpen?: boolean;
  systemPrompt?: string;
}

/**
 * AIAgentChat - A component that combines the agent preview card with the AI chat component
 * The chat remains open until the user explicitly closes it
 */
export function AIAgentChat({
  agentId = 'default-agent',
  agentName = 'AI Assistant',
  agentDescription = 'Your helpful AI assistant',
  iconUrl = '/images/default-agent-icon.svg',
  defaultOpen = false,
  systemPrompt = 'You are a helpful AI assistant.'
}: AIAgentChatProps) {
  const [chatVisible, setChatVisible] = useState(defaultOpen);
  
  const handleChatClose = () => {
    setChatVisible(false);
  };
  
  const handleOpenChat = () => {
    setChatVisible(true);
  };
  
  return (
    <div className="ai-agent-chat-container">
      {/* Agent preview card */}
      <div className="agent-preview-wrapper">
        <AgentPreview
          id={agentId}
          name={agentName}
          description={agentDescription}
          iconUrl={iconUrl}
        />
      </div>
      
      {/* AI Chat component */}
      {chatVisible ? (
        <div className="ai-chat-wrapper">
          <AIInput
            placeholder={`Ask ${agentName} something...`}
            systemPrompt={systemPrompt}
            showConversation={true}
            className="seamless-chat-integration"
            initiallyVisible={true}
            onClose={handleChatClose}
          />
        </div>
      ) : (
        <div className="chat-button-wrapper">
          <Button 
            onClick={handleOpenChat}
            variant="accent"
            size="sm"
            className="open-chat-button"
          >
            Chat with {agentName}
          </Button>
        </div>
      )}
    </div>
  );
}

export default AIAgentChat;

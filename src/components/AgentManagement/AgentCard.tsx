import React from 'react';
import { GlassCard, GlassCardContent, GlassCardFooter } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { MessageSquare, Trash2, Edit, Twitter } from 'lucide-react';

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

interface AgentCardProps {
  agent: Agent;
  onDelete: () => void;
  onEdit: () => void;
  onChat: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onDelete, onEdit, onChat }) => {
  // Generate a random image if none is provided
  const agentImage = `https://source.unsplash.com/random/300x300/?robot,ai&sig=${agent.id}`;
  
  // Format date
  const formattedDate = agent.createdAt 
    ? new Date(agent.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : 'Unknown date';

  return (
    <GlassCard className="overflow-hidden transition-all duration-300 hover:shadow-lg group">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={agentImage} 
          alt={agent.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Agent ticker badge */}
        {agent.ticker && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-[#D4C6A1]">
            ${agent.ticker}
          </div>
        )}
        
        {/* Integration badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {agent.clients?.twitter && (
            <div className="bg-black/60 backdrop-blur-sm p-1.5 rounded-full">
              <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />
            </div>
          )}
        </div>
      </div>
      
      <GlassCardContent className="p-5">
        <h3 className="text-xl font-semibold text-white mb-2 truncate">{agent.name}</h3>
        <p className="text-white/70 text-sm line-clamp-2 h-10">
          {agent.description || 'No description provided.'}
        </p>
        <div className="mt-4 text-xs text-white/50">
          Created: {formattedDate}
        </div>
      </GlassCardContent>
      
      <GlassCardFooter className="p-4 border-t border-white/5 flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className="hover:bg-white/10 text-white/70 hover:text-white"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete}
            className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          onClick={onChat}
          size="sm"
          className="bg-gradient-to-r from-[#D4C6A1]/80 via-[#BFB28F]/80 to-[#A69A78]/80 hover:from-[#D4C6A1] hover:via-[#BFB28F] hover:to-[#A69A78] text-black flex items-center gap-1.5"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </Button>
      </GlassCardFooter>
    </GlassCard>
  );
};

export default AgentCard; 
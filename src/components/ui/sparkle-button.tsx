"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { AIInput } from "./ai-input";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// Define animations
import "./sparkle-button-animations.css";

// AI Idea Icon with subtle animation
const AiIdeaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={24} 
    height={24} 
    fill={"none"} 
    className="animate-pulse-subtle"
    {...props}
  >
    <path 
      d="M19 9.62069C19 12.1999 17.7302 14.1852 15.7983 15.4917C15.3483 15.796 15.1233 15.9482 15.0122 16.1212C14.9012 16.2942 14.8633 16.5214 14.7876 16.9757L14.7287 17.3288C14.5957 18.127 14.5292 18.526 14.2494 18.763C13.9697 19 13.5651 19 12.7559 19H10.1444C9.33528 19 8.93069 19 8.65095 18.763C8.3712 18.526 8.30469 18.127 8.17166 17.3288L8.11281 16.9757C8.03734 16.5229 7.99961 16.2965 7.88968 16.1243C7.77976 15.9521 7.55428 15.798 7.10332 15.4897C5.1919 14.1832 4 12.1986 4 9.62069C4 5.4119 7.35786 2 11.5 2C12.0137 2 12.5153 2.05248 13 2.15244" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M16.5 2L16.7579 2.69703C17.0961 3.61102 17.2652 4.06802 17.5986 4.40139C17.932 4.73477 18.389 4.90387 19.303 5.24208L20 5.5L19.303 5.75792C18.389 6.09613 17.932 6.26524 17.5986 6.59861C17.2652 6.93198 17.0961 7.38898 16.7579 8.30297L16.5 9L16.2421 8.30297C15.9039 7.38898 15.7348 6.93198 15.4014 6.59861C15.068 6.26524 14.611 6.09613 13.697 5.75792L13 5.5L13.697 5.24208C14.611 4.90387 15.068 4.73477 15.4014 4.40139C15.7348 4.06802 15.9039 3.61102 16.2421 2.69703L16.5 2Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinejoin="round" 
      className="animate-sparkle" 
    />
    <path 
      d="M13.5 19V20C13.5 20.9428 13.5 21.4142 13.2071 21.7071C12.9142 22 12.4428 22 11.5 22C10.5572 22 10.0858 22 9.79289 21.7071C9.5 21.4142 9.5 20.9428 9.5 20V19" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinejoin="round" 
    />
  </svg>
);

interface SparkleButtonProps {
  className?: string;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  generateResponse?: (input: string) => Promise<string>;
  showResponse?: boolean;
  systemPrompt?: string;
  initialPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  streamingEnabled?: boolean;
  apiEndpoint?: string;
}

export function SparkleButton({
  className,
  onSubmit,
  placeholder = "Ask AI for suggestions...",
  generateResponse,
  showResponse = false,
  systemPrompt = "You are a helpful AI assistant.",
  initialPrompt,
  model = "openai/gpt-4o-mini",
  temperature = 0.7,
  maxTokens = 800,
  streamingEnabled = true,
  apiEndpoint = "/api/proxy/ai-chat"
}: SparkleButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const aiInputRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });
  const [wasSubmitted, setWasSubmitted] = useState(false);

  const handleSubmit = (value: string) => {
    onSubmit?.(value);
    // Mark as submitted but don't close immediately
    setWasSubmitted(true);
    
    // Only auto-close after a longer delay to allow viewing the response
    // This delay can be adjusted as needed
    setTimeout(() => {
      if (wasSubmitted) {
        setIsOpen(false);
        setWasSubmitted(false);
      }
    }, 10000); // 10 second delay before auto-closing
  };
  
  // Create portal container
  useEffect(() => {
    const portalRoot = document.createElement('div');
    portalRoot.id = 'sparkle-button-portal';
    portalRoot.style.position = 'absolute';
    portalRoot.style.top = '0';
    portalRoot.style.left = '0';
    portalRoot.style.width = '0';
    portalRoot.style.height = '0';
    portalRoot.style.zIndex = '9999';
    portalRoot.style.overflow = 'visible';
    document.body.appendChild(portalRoot);
    setPortalContainer(portalRoot);
    
    return () => {
      document.body.removeChild(portalRoot);
    };
  }, []);
  
  // Find parent card and update button position
  useEffect(() => {
    if (buttonRef.current && isOpen) {
      // Find the parent card (GlassCard)
      let parentElement = buttonRef.current.parentElement;
      while (parentElement) {
        if (parentElement.classList.contains('glass')) {
          cardRef.current = parentElement as HTMLElement;
          break;
        }
        parentElement = parentElement.parentElement;
      }

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const cardRect = cardRef.current ? cardRef.current.getBoundingClientRect() : buttonRect;
      
      // Update position to align chat with the top of the card
      setButtonPosition({
        top: cardRect.top, // Align with the top of the card
        left: buttonRect.left, // We'll use this to position relative to the button
        width: buttonRect.width
      });

      // Animate the card to slide left
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        cardRef.current.style.transform = 'translateX(-80px)';
      }
    } else if (!isOpen && cardRef.current) {
      // Reset the card position when closing
      cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      cardRef.current.style.transform = 'translateX(0)';
    }
  }, [isOpen]);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        aiInputRef.current && 
        !aiInputRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        // If a message was recently submitted, don't close instantly on outside click
        if (wasSubmitted) {
          return;
        }
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, wasSubmitted]);

  return (
    <div className="relative" style={{ zIndex: 40 }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center p-2 rounded-full",
          "bg-gradient-to-r from-[var(--gold-from)] via-[var(--gold-via)] to-[var(--gold-to)]",
          "hover:brightness-110 active:brightness-90 active:scale-[0.98]",
          "text-black transition-all duration-300",
          "shadow-[0_2px_10px_rgba(191,178,143,0.3)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)]/50",
          className
        )}
      >
        <AiIdeaIcon className="w-5 h-5" />
      </button>

      {portalContainer && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={aiInputRef}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
              style={{ 
                position: 'fixed',
                width: '350px',
                top: `${buttonPosition.top}px`, // Align with the card top
                left: `${buttonPosition.left + 50}px`, // Position to the right of the button
                pointerEvents: 'auto',
                zIndex: 9999,
                overflow: 'visible'
              }}
              className="origin-top-left"
            >
              <div className="relative">

                <AIInput 
                  placeholder={placeholder}
                  onSubmit={handleSubmit}
                  className="shadow-lg rounded-xl overflow-hidden"
                  systemPrompt={systemPrompt}
                  initialPrompt={initialPrompt}
                  model={model}
                  temperature={temperature}
                  maxTokens={maxTokens}
                  streamingEnabled={streamingEnabled}
                  apiEndpoint={apiEndpoint}
                  generateResponse={generateResponse}
                  showResponse={showResponse}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        portalContainer
      )}
    </div>
  );
}

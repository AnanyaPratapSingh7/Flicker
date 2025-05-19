import React, { useState } from 'react';
import { useWallet, OKXWallet } from '../../contexts/WalletContext';
import { Button } from './Button';
import { Wallet as WalletIcon } from 'lucide-react'; // Renamed icon import to avoid conflict
import { OKXChainId } from '../../api/okx/types';

const WalletButton: React.FC = () => {
  const {
    isWalletConnected,
    isConnecting,
    address,
    connectWallet,
    disconnectWallet, // Get disconnect function
    formatAddress,
    selectedChain,
    setSelectedChain
  } = useWallet();

  // State to control the visibility of the wallet selection dropdown
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [isChainSelectorOpen, setIsChainSelectorOpen] = useState(false);

  // Handler function to connect a specific wallet type
  const handleConnect = async (walletType: OKXWallet) => {
    setIsSelectionOpen(false); // Close dropdown after selection
    try {
      console.log(`Attempting to connect ${walletType}...`);
      await connectWallet(walletType);
      console.log(`${walletType} connection attempt finished.`);
    } catch (error) {
      console.error(`Failed to connect ${walletType}:`, error);
      // You could add user feedback here, like a toast notification
      // Example: toast.error(`Failed to connect ${walletType}: ${error.message}`);
    }
  };

  // Chain names for UI display
  const chainNames: Record<string, string> = {
    [OKXChainId.ETHEREUM]: 'Ethereum',
    [OKXChainId.BSC]: 'BSC',
    [OKXChainId.SOLANA]: 'Solana',
    [OKXChainId.AVALANCHE]: 'Avalanche'
  };

  // Handler to change selected chain
  const handleChainChange = (chainId: string) => {
    setSelectedChain(chainId);
    setIsChainSelectorOpen(false);
    // If wallet is already connected, we could trigger a chain switch in the wallet
    console.log(`Selected chain changed to: ${chainNames[chainId]}`);
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      {isWalletConnected ? (
        // --- Display when connected ---
        <div className="flex space-x-2">
          {/* Chain selector */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsChainSelectorOpen(!isChainSelectorOpen)}
              className="bg-[#0028FF]/10 hover:bg-[#0028FF]/20 text-[#0028FF] border border-[#0028FF]/30 rounded-xl"
            >
              {chainNames[selectedChain] || 'Select Chain'}
            </Button>
            
            {/* Chain selection dropdown */}
            {isChainSelectorOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 rounded-md shadow-lg bg-[#1A1C23]/90 backdrop-blur-md ring-1 ring-black ring-opacity-5 focus:outline-none border border-[#0028FF]/20 py-1">
                {Object.entries(chainNames).map(([chainId, chainName]) => (
                  <button
                    key={chainId}
                    onClick={() => handleChainChange(chainId)}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedChain === chainId ? 'text-[#0028FF] bg-[#0028FF]/10' : 'text-white hover:bg-[#0028FF]/5'
                    }`}
                  >
                    {chainName}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Wallet address display */}
          <div className="relative group">
            <div className="bg-[#1A1C23]/80 backdrop-blur-md px-4 py-2 rounded-xl text-sm flex items-center border border-[#0028FF]/20 cursor-pointer">
              <WalletIcon className="h-4 w-4 mr-2 text-[#0028FF]" />
              <span className="text-white">{formatAddress(address)}</span>
            </div>
            {/* Disconnect button shown on hover */}
            <div className="absolute top-full right-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
              <Button
                variant="destructive"
                size="sm"
                onClick={disconnectWallet}
                className="whitespace-nowrap mt-1"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // --- Display when disconnected ---
        <div className="relative">
          <Button
            variant="secondary"
            onClick={() => setIsSelectionOpen(!isSelectionOpen)}
            disabled={isConnecting}
            className="px-4 py-2 bg-[#0028FF]/20 hover:bg-[#0028FF]/30 text-white border border-[#0028FF]/30 rounded-xl"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>

          {/* Wallet Selection Dropdown */}
          {isSelectionOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg bg-[#1A1C23]/90 backdrop-blur-md ring-1 ring-black ring-opacity-5 focus:outline-none border border-[#0028FF]/20 py-1">
              {/* MetaMask Button */}
              <button
                onClick={() => handleConnect(OKXWallet.METAMASK)}
                disabled={isConnecting}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#0028FF]/10 disabled:opacity-50"
              >
                Connect MetaMask
              </button>
              {/* WalletConnect Button */}
              <button
                onClick={() => handleConnect(OKXWallet.WALLETCONNECT)}
                disabled={isConnecting}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#0028FF]/10 disabled:opacity-50"
              >
                Connect WalletConnect
              </button>
              {/* Coinbase Button */}
              <button
                onClick={() => handleConnect(OKXWallet.COINBASE)}
                disabled={isConnecting}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#0028FF]/10 disabled:opacity-50"
              >
                Connect Coinbase
              </button>
              {/* OKX Wallet Button */}
              <button
                onClick={() => handleConnect(OKXWallet.OKX)}
                disabled={isConnecting}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#0028FF]/10 disabled:opacity-50 font-bold"
              >
                Connect OKX Wallet
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletButton;
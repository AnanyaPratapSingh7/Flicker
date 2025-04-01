import React, { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { Button } from './Button';
import { Wallet as WalletIcon } from 'lucide-react'; // Renamed icon import to avoid conflict
import { Wallet } from '@injectivelabs/wallet-base'; // Import the Wallet enum

const WalletButton: React.FC = () => {
  const {
    isWalletConnected,
    isConnecting,
    address,
    connectWallet,
    disconnectWallet, // Get disconnect function
    formatAddress,
  } = useWallet();

  // State to control the visibility of the wallet selection dropdown
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);

  // Handler function to connect a specific wallet type
  const handleConnect = async (walletType: Wallet) => {
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

  return (
    <div className="fixed top-6 right-6 z-50">
      {isWalletConnected ? (
        // --- Display when connected ---
        <div className="relative group"> {/* Container for potential disconnect dropdown */}
          <div className="bg-[#1A1C23]/80 backdrop-blur-md px-4 py-2 rounded-xl text-sm flex items-center border border-[#A69A78]/20 cursor-pointer">
            <WalletIcon className="h-4 w-4 mr-2 text-[#BFB28F]" /> {/* Use renamed icon */}
            <span className="text-[#D4C6A1]">{formatAddress(address)}</span>
          </div>
          {/* Optional: Disconnect button shown on hover/click */}
          <div className="absolute top-full right-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
            <Button
              variant="destructive"
              size="sm"
              onClick={disconnectWallet}
              className="whitespace-nowrap mt-1" // Added small margin top
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        // --- Display when disconnected ---
        <div className="relative"> {/* Container for connect button and dropdown */}
          <Button
            variant="secondary"
            onClick={() => setIsSelectionOpen(!isSelectionOpen)} // Toggle dropdown visibility
            disabled={isConnecting}
            className="px-4 py-2 bg-[#D4C6A1]/20 hover:bg-[#D4C6A1]/30 text-[#D4C6A1] border border-[#D4C6A1]/30 rounded-xl"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>

          {/* Wallet Selection Dropdown */}
          {isSelectionOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg bg-[#1A1C23]/90 backdrop-blur-md ring-1 ring-black ring-opacity-5 focus:outline-none border border-[#A69A78]/20 py-1">
              {/* Keplr Button */}
              <button
                onClick={() => handleConnect(Wallet.Keplr)}
                disabled={isConnecting}
                className="block w-full text-left px-4 py-2 text-sm text-[#D4C6A1] hover:bg-[#D4C6A1]/10 disabled:opacity-50"
              >
                Connect Keplr
              </button>
              {/* Leap Button */}
              <button
                onClick={() => handleConnect(Wallet.Leap)}
                disabled={isConnecting}
                className="block w-full text-left px-4 py-2 text-sm text-[#D4C6A1] hover:bg-[#D4C6A1]/10 disabled:opacity-50"
              >
                Connect Leap
              </button>
              {/* Add more wallet options here using the same pattern */}
              {/* Example:
              <button
                onClick={() => handleConnect(Wallet.Metamask)}
                disabled={isConnecting}
                className="block w-full text-left px-4 py-2 text-sm text-[#D4C6A1] hover:bg-[#D4C6A1]/10 disabled:opacity-50"
              >
                Connect MetaMask
              </button>
              */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletButton;
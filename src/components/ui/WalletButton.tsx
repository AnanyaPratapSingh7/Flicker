import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { Button } from './Button';
import { Wallet } from 'lucide-react';

const WalletButton: React.FC = () => {
  const { 
    isWalletConnected, 
    isConnecting, 
    address, 
    connectWallet, 
    formatAddress 
  } = useWallet();

  return (
    <div className="fixed top-6 right-6 z-50">
      {isWalletConnected ? (
        <div className="bg-[#1A1C23]/80 backdrop-blur-md px-4 py-2 rounded-xl text-sm flex items-center border border-[#A69A78]/20">
          <Wallet className="h-4 w-4 mr-2 text-[#BFB28F]" />
          <span className="text-[#D4C6A1]">{formatAddress(address)}</span>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-4 py-2 bg-[#D4C6A1]/20 hover:bg-[#D4C6A1]/30 text-[#D4C6A1] border border-[#D4C6A1]/30 rounded-xl"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
};

export default WalletButton;

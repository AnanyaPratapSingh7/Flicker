import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletContextType {
  isWalletConnected: boolean;
  isConnecting: boolean;
  address: string;
  publicKey: string;
  network: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  formatAddress: (addr: string) => string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [network, setNetwork] = useState('injective-888');

  const checkKeplrAvailability = async (retries = 10, interval = 500): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
      if (typeof window !== 'undefined' && 'keplr' in window) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    return false;
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      const savedAddress = localStorage.getItem('walletAddress');
      if (savedAddress) {
        const isKeplrAvailable = await checkKeplrAvailability();
        if (!isKeplrAvailable) {
          console.log('Keplr not available');
          return;
        }

        try {
          await (window as any).keplr.enable('injective-888');
          const offlineSigner = (window as any).keplr.getOfflineSigner('injective-888');
          const accounts = await offlineSigner.getAccounts();
          const userAddress = accounts[0].address;
          
          if (savedAddress === userAddress) {
            console.log('Wallet reconnected:', userAddress);
            setAddress(userAddress);
            setIsWalletConnected(true);
          } else {
            console.log('Saved address does not match current account');
            localStorage.removeItem('walletAddress');
          }
        } catch (error) {
          console.error('Error reconnecting wallet:', error);
          localStorage.removeItem('walletAddress');
        }
      }
    };

    checkWalletConnection();

    const handleAccountChange = () => {
      console.log('Keplr account changed');
      checkWalletConnection();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keplr_keystorechange', handleAccountChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keplr_keystorechange', handleAccountChange);
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      console.log('Connecting wallet...');

      const isKeplrAvailable = await checkKeplrAvailability();
      if (!isKeplrAvailable) {
        throw new Error('Please install Keplr extension');
      }

      await (window as any).keplr.enable('injective-888');
      console.log('Keplr enabled');

      const offlineSigner = (window as any).keplr.getOfflineSigner('injective-888');
      const accounts = await offlineSigner.getAccounts();
      const userAddress = accounts[0].address;
      
      // Get the key details from Keplr
      const key = await (window as any).keplr.getKey('injective-888');
      const pubKey = key.pubKey;
      
      console.log('Connected to address:', userAddress);
      localStorage.setItem('walletAddress', userAddress);
      
      setAddress(userAddress);
      setPublicKey(Buffer.from(pubKey).toString('base64'));
      setNetwork('injective-888');
      setIsWalletConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      localStorage.removeItem('walletAddress');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    console.log('Disconnecting wallet');
    localStorage.removeItem('walletAddress');
    setIsWalletConnected(false);
    setAddress('');
    setPublicKey('');
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <WalletContext.Provider
      value={{
        isWalletConnected,
        isConnecting,
        address,
        publicKey,
        network,
        connectWallet,
        disconnectWallet,
        formatAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

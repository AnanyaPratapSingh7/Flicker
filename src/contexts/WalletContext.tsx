import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChainId, EthereumChainId } from '@injectivelabs/ts-types';
import { WalletStrategy } from '@injectivelabs/wallet-strategy';
import { Wallet } from '@injectivelabs/wallet-base';
import { getInjectiveAddress } from '@injectivelabs/sdk-ts';

interface WalletContextType {
  isWalletConnected: boolean;
  isConnecting: boolean;
  address: string;
  publicKey: string;
  network: string;
  connectWallet: (walletType: Wallet) => Promise<void>;
  disconnectWallet: () => void;
  formatAddress: (addr: string) => string;
  walletStrategy: WalletStrategy;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const targetChainId = ChainId.Mainnet;
const ethereumChainId = EthereumChainId.Mainnet;
const ethereumRpcUrl = import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletStrategy] = useState(() => new WalletStrategy({
    chainId: targetChainId,
    strategies: {},
  }));

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [network, setNetwork] = useState(targetChainId);

  const connectWallet = async (walletType: Wallet) => {
    try {
      setIsConnecting(true);
      console.log(`Connecting wallet via WalletStrategy (${walletType})...`);

      walletStrategy.setWallet(walletType);

      const addresses = await walletStrategy.getAddresses();

      if (addresses.length === 0) {
        throw new Error('No accounts found in the selected wallet.');
      }

      const firstAddress = addresses[0];
      let injectiveAddress: string;
      let ethAddress: string | undefined = undefined;

      if (firstAddress.startsWith('0x')) {
        injectiveAddress = getInjectiveAddress(firstAddress);
        ethAddress = firstAddress;
        console.log(`Connected ETH address: ${ethAddress}, derived INJ address: ${injectiveAddress}`);
      } else if (firstAddress.startsWith('inj')) {
        injectiveAddress = firstAddress;
        console.log(`Connected INJ address: ${injectiveAddress}`);
      } else {
        throw new Error('Unrecognized address format received.');
      }
      
      let base64PubKey = '';
      try {
        base64PubKey = await walletStrategy.getPubKey();
        console.log('Public key obtained (already base64?):', base64PubKey);
      } catch (e) {
        console.warn(`Could not get public key from wallet (${walletType}):`, e);
      }
            
      setAddress(injectiveAddress);
      setPublicKey(base64PubKey);
      setNetwork(targetChainId);
      setIsWalletConnected(true);

    } catch (error) {
      console.error('Error connecting wallet:', error);
      setIsWalletConnected(false);
      setAddress('');
      setPublicKey('');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    console.log('Disconnecting wallet');
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
        walletStrategy: walletStrategy
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

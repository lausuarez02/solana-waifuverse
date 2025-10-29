"use client";
import { ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

export function RootProvider({ children }: { children: ReactNode }) {
  // Solana network (mainnet-beta, testnet, or devnet)
  // Default to devnet if not configured
  const network = useMemo(() => {
    const envNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
    if (envNetwork === 'mainnet-beta') return WalletAdapterNetwork.Mainnet;
    if (envNetwork === 'testnet') return WalletAdapterNetwork.Testnet;
    if (envNetwork === 'devnet') return WalletAdapterNetwork.Devnet;
    // Default to devnet for safety
    return WalletAdapterNetwork.Devnet;
  }, []);

  // RPC endpoint - use custom RPC for better performance
  const endpoint = useMemo(() => {
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }
    return clusterApiUrl(network);
  }, [network]);

  // Configure wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  // Log configuration for debugging
  if (typeof window !== 'undefined') {
    console.log('Solana Wallet Configuration:', {
      network,
      endpoint,
      walletsConfigured: wallets.length
    });
  }

  // Initialize Reown AppKit for Solana (optional - provides WalletConnect support)
  // Note: Reown configuration is commented out due to type issues
  // You can uncomment and configure when needed
  /*
  useMemo(() => {
    if (process.env.NEXT_PUBLIC_REOWN_PROJECT_ID) {
      // Configure Reown AppKit here
      // See: https://docs.reown.com/appkit/react/core/installation
    }
  }, [endpoint, network, wallets]);
  */

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={false}
        onError={(error, adapter) => {
          // Only log non-Phantom errors or if it's a different error than "Unexpected error"
          if (adapter?.name !== 'Phantom' || !error.message.includes('Unexpected error')) {
            console.error('Wallet error details:', {
              error,
              errorMessage: error.message,
              adapter: adapter?.name
            });
          } else {
            // Silently ignore known Phantom StandardWallet connection issues
            console.warn('⚠️ Phantom wallet connection failed (known issue with StandardWallet protocol). Please use Solflare or Torus instead.');
          }
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

"use client";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styles from './WalletStatus.module.css';

export function WalletStatus() {
  const { publicKey, connected, wallet } = useWallet();

  if (!connected || !publicKey) {
    return (
      <div className={styles.container}>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.address}>
        <span className={styles.label}>WALLET:</span>
        <span className={styles.value}>
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </span>
      </div>

      {wallet && (
        <div className={styles.capabilities}>
          <span className={styles.badge} title={`Connected via ${wallet.adapter.name}`}>
            {wallet.adapter.name}
          </span>
        </div>
      )}

      <WalletMultiButton />
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/8bit/button";
import { IntroVideo } from "@/components/IntroVideo";
import styles from "./page.module.css";
import bs58 from "bs58";

interface UserData {
  publicKey: string;
  issuedAt: number;
  expiresAt: number;
}

export default function GameDashboard() {
  const router = useRouter();
  const { publicKey, signMessage, connected, connecting, wallet } = useWallet();
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [introWatched, setIntroWatched] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    async function initializeApp() {
      // Check if intro was already watched this session
      const introSeen = sessionStorage.getItem('intro_watched');
      if (introSeen) {
        setShowIntro(false);
        setIntroWatched(true);
      }

      // Check for saved authentication token
      const savedToken = localStorage.getItem('sol_auth_token');
      const savedPublicKey = localStorage.getItem('sol_public_key');

      if (savedToken && savedPublicKey && publicKey?.toString() === savedPublicKey) {
        setToken(savedToken);
        try {
          const response = await fetch(`${window.location.origin}/api/auth`, {
            headers: { "Authorization": `Bearer ${savedToken}` }
          });

          const data = await response.json();

          if (data.success && data.user) {
            setUserData(data.user);
          } else {
            // Token invalid, clear it
            signOut();
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          signOut();
        }
      }
    }
    initializeApp();
  }, [publicKey]);

  async function signIn() {
    if (!connected) {
      setError('Wallet is not connected. Please connect your wallet and try again.');
      return;
    }

    if (!publicKey) {
      setError('Wallet public key not found. Please reconnect your wallet.');
      return;
    }

    if (!signMessage) {
      setError(`Your wallet (${wallet?.adapter?.name || 'Unknown'}) does not support message signing. Please try a different wallet like Phantom or Solflare.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log('Starting sign-in process...', {
      wallet: wallet?.adapter?.name,
      publicKey: publicKey.toString(),
      connected,
      signMessageAvailable: !!signMessage
    });

    try {
      // Create a message to sign
      const message = `Sign this message to authenticate with Waifuverse.\n\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);

      console.log('Requesting signature from wallet...');

      // Request signature from wallet
      let signature;
      try {
        signature = await signMessage(encodedMessage);
        console.log('Signature received successfully');
      } catch (signErr) {
        console.error("Signature error:", signErr);

        // Check if user rejected
        if (signErr instanceof Error) {
          if (signErr.message.includes('User rejected') ||
              signErr.message.includes('rejected') ||
              signErr.message.includes('declined') ||
              signErr.message.includes('denied')) {
            throw new Error('You rejected the signature request. Please approve the request to sign in.');
          }
        }

        throw new Error('Signature request failed. Please make sure your wallet is unlocked and try again.');
      }

      // Send signature and public key to backend for verification
      const response = await fetch(`${window.location.origin}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: publicKey.toString(),
          signature: bs58.encode(signature),
          message,
        })
      });

      const data = await response.json();

      if (data.success && data.token) {
        setToken(data.token);
        setUserData(data.user);
        localStorage.setItem('sol_auth_token', data.token);
        localStorage.setItem('sol_public_key', publicKey.toString());
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error("Authentication failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(errorMessage);
      // Don't sign out here, just show the error
    } finally {
      setIsLoading(false);
    }
  }

  function signOut() {
    setToken(null);
    setUserData(null);
    localStorage.removeItem('sol_auth_token');
    localStorage.removeItem('sol_public_key');
  }

  function handleIntroComplete() {
    setShowIntro(false);
    setIntroWatched(true);
    sessionStorage.setItem('intro_watched', 'true');
  }

  // Show intro video on first visit
  if (showIntro && !introWatched) {
    return <IntroVideo onComplete={handleIntroComplete} />;
  }

  // Show sign-in screen if not authenticated
  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>WAIFUVERSE</h1>
          <p className={styles.subtitle}>Connect your wallet to start your adventure</p>

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <WalletMultiButton />
          </div>

          {connected && publicKey && (
            <Button
              onClick={signIn}
              size="lg"
              disabled={isLoading || connecting}
              className={styles.signInButton}
            >
              {isLoading ? 'SIGNING IN...' : connecting ? 'CONNECTING...' : 'SIGN IN'}
            </Button>
          )}

          {connecting && (
            <p className={styles.subtitle}>Connecting to wallet...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.userInfo}>
          <h1 className={styles.title}>Game Dashboard</h1>
          {userData && (
            <p className={styles.fid}>Wallet: {userData.publicKey.substring(0, 4)}...{userData.publicKey.substring(userData.publicKey.length - 4)}</p>
          )}
        </div>

        <div className={styles.buttonGrid}>
          <Button
            onClick={() => router.push('/game/charm/hunt')}
            size="lg"
            className={styles.dashboardButton}
          >
            CHARM HUNT
          </Button>

          <Button
            onClick={() => router.push('/game/charm/map')}
            size="lg"
            variant="outline"
            className={styles.dashboardButton}
          >
            MAP
          </Button>

          <Button
            onClick={() => router.push('/game/charm/collection')}
            size="lg"
            variant="outline"
            className={styles.dashboardButton}
          >
            COLLECTION
          </Button>

          <Button
            onClick={() => router.push('/game/waifu-showcase')}
            size="lg"
            variant="outline"
            className={styles.dashboardButton}
          >
            WAIFU SHOWCASE
          </Button>
        </div>

        <div className={styles.bottomActions}>
          <Button
            onClick={signOut}
            variant="ghost"
            className="mt-8"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

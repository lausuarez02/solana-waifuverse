"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sdk } from "@farcaster/miniapp-sdk";
import { Button } from "@/components/ui/8bit/button";
import { IntroVideo } from "@/components/IntroVideo";
import styles from "./page.module.css";

interface UserData {
  fid: number;
  issuedAt: number;
  expiresAt: number;
}

export default function GameDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [introWatched, setIntroWatched] = useState(false);

  // Check for existing token on mount and tell SDK app is ready
  useEffect(() => {
    async function initializeApp() {
      // Check if intro was already watched this session
      const introSeen = sessionStorage.getItem('intro_watched');
      if (introSeen) {
        setShowIntro(false);
        setIntroWatched(true);
      }

      // Tell Farcaster SDK that the app is ready to display
      try {
        await sdk.actions.ready();
      } catch (error) {
        console.error('Failed to signal ready:', error);
      }

      // Check for saved authentication token
      const savedToken = localStorage.getItem('fc_auth_token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const response = await sdk.quickAuth.fetch(`${window.location.origin}/api/auth`, {
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
  }, []);

  async function signIn() {
    setIsLoading(true);
    setError(null);
    try {
      // Get the domain for JWT verification - must match backend
      const domain = window.location.host;

      console.log('Getting token for domain:', domain);

      const { token: authToken } = await sdk.quickAuth.getToken();

      console.log('Received token:', {
        tokenPreview: authToken.substring(0, 30) + '...',
        currentDomain: domain,
        origin: window.location.origin
      });

      setToken(authToken);
      localStorage.setItem('fc_auth_token', authToken);

      // Verify token and fetch user data
      console.log('Verifying token with backend at:', `${window.location.origin}/api/auth`);

      const response = await sdk.quickAuth.fetch(`${window.location.origin}/api/auth`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });

      const data = await response.json();

      console.log('Backend response:', data);

      if (data.success && data.user) {
        setUserData(data.user);
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error("Authentication failed:", err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      signOut();
    } finally {
      setIsLoading(false);
    }
  }

  function signOut() {
    setToken(null);
    setUserData(null);
    localStorage.removeItem('fc_auth_token');
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
          <p className={styles.subtitle}>Sign in to start your adventure</p>

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          <Button
            onClick={signIn}
            size="lg"
            disabled={isLoading}
            className={styles.signInButton}
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* WalletStatus temporarily disabled - enable when wallet is connected */}
      {/* <WalletStatus /> */}
      <div className={styles.content}>
        <div className={styles.userInfo}>
          <h1 className={styles.title}>Game Dashboard</h1>
          {userData && (
            <p className={styles.fid}>FID: {userData.fid}</p>
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

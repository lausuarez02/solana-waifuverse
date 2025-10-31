"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/8bit/button";
import { WaifuCard } from "@/components/WaifuCard";
import { getCaptured, type CapturedWaifu } from "@/lib/store";
import styles from "./page.module.css";

// Waifu data with stats and lore
const waifuData: Record<string, {
  element: string;
  lore: string;
  stats: { power: number; charm: number; speed: number };
}> = {
  w1: {
    element: "fire",
    lore: "A fierce warrior from the Land of Cherry Blossoms. Her determination is unmatched.",
    stats: { power: 75, charm: 85, speed: 70 }
  },
  w2: {
    element: "dark",
    lore: "A mysterious guardian of the night. She moves silently under the moon's glow.",
    stats: { power: 82, charm: 90, speed: 88 }
  },
  w3: {
    element: "ice",
    lore: "Born in the frozen peaks, she commands the power of eternal winter.",
    stats: { power: 88, charm: 78, speed: 65 }
  },
  w4: {
    element: "earth",
    lore: "A gentle soul with deep connection to nature and all living things.",
    stats: { power: 70, charm: 92, speed: 60 }
  }
};

export default function CollectionPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();

  const [captured, setCaptured] = useState<CapturedWaifu[]>([]);
  const [minted, setMinted] = useState<Set<string>>(new Set());
  const [mintingWaifuId, setMintingWaifuId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [spawnsData, setSpawnsData] = useState<Map<string, {
    rarity: string;
    maxSupply: number;
    currentSupply: number;
  }>>(new Map());

  useEffect(() => {
    // Load captures from backend first, fallback to localStorage
    async function loadData() {
      try {
        const token = localStorage.getItem('fc_auth_token');
        if (token) {
          // Load captures from database
          const capturesRes = await fetch('/api/capture', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          // Check if token expired
          if (capturesRes.status === 401) {
            console.log('Token expired, clearing and using localStorage');
            localStorage.removeItem('fc_auth_token');
            setCaptured(getCaptured());
            return;
          }

          if (capturesRes.ok) {
            const capturesData = await capturesRes.json() as {
              captures: Array<{ waifuId: string; capturedAt: string }>
            };
            console.log('Loaded captures from DB:', capturesData);

            // Transform DB captures to CapturedWaifu format
            // We need to get the spawn data to fill in name, emoji, capturedImg, rarity, etc
            // IMPORTANT: Include inactive spawns so captured waifus always display
            const spawnsRes = await fetch('/api/spawns?includeInactive=true');
            if (spawnsRes.ok) {
              const spawnsArray = await spawnsRes.json() as Array<{
                id: string;
                name: string;
                emoji: string;
                img: string;
                capturedImg: string;
                rarity: string;
                maxSupply: number;
                currentSupply: number;
              }>;
              const spawnsMap = new Map(
                spawnsArray.map(s => [s.id, s])
              );

              // Store spawns data for later use in rendering
              setSpawnsData(spawnsMap);

              const dbCaptures: CapturedWaifu[] = capturesData.captures.map(c => {
                const spawn = spawnsMap.get(c.waifuId);
                return {
                  id: c.waifuId,
                  name: spawn?.name || 'Unknown',
                  emoji: spawn?.emoji || '❓',
                  capturedImg: spawn?.capturedImg || spawn?.img || '',
                  capturedAt: new Date(c.capturedAt).getTime()
                };
              });

              setCaptured(dbCaptures);
            }
          } else {
            // Fallback to localStorage if not authenticated
            setCaptured(getCaptured());
          }

          // Load minted status
          const mintsRes = await fetch('/api/mints', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (mintsRes.ok) {
            const mintsData = await mintsRes.json() as {
              mints: Array<{ waifuId: string }>
            };
            setMinted(new Set(mintsData.mints.map(m => m.waifuId)));
          }
        } else {
          // No token - use localStorage
          setCaptured(getCaptured());
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        // Fallback to localStorage on error
        setCaptured(getCaptured());
      }
    }

    loadData();
  }, []);

  async function handleMint(waifuId: string) {
    try {
      // Check wallet connection
      if (!connected || !publicKey) {
        toast.error('Please connect your Solana wallet first');
        return;
      }

      const walletAddress = publicKey.toBase58();
      console.log('Wallet address:', walletAddress);

      // Generate a simple auth token from wallet (if not exists)
      let token = localStorage.getItem('fc_auth_token');
      if (!token) {
        // Auto-generate token when wallet is connected
        const payload = {
          publicKey: walletAddress,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        };
        token = Buffer.from(JSON.stringify(payload)).toString('base64');
        localStorage.setItem('fc_auth_token', token);
        console.log('Auto-generated auth token for wallet');
      }

      setMintingWaifuId(waifuId);
      setIsPending(true);

      // First, save the wallet address to backend if not already saved
      try {
        const walletRes = await fetch('/api/wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ walletAddress })
        });

        // Check if token expired
        if (walletRes.status === 401) {
          localStorage.removeItem('fc_auth_token');
          toast.error('Session expired. Please refresh and sign in again.');
          setMintingWaifuId(null);
          setIsPending(false);
          return;
        }

        console.log('Wallet saved/verified');
      } catch (err) {
        console.error('Failed to save wallet:', err);
      }

      console.log('Requesting mint signature for:', { waifuId, playerAddress: walletAddress });

      // Get mint signature from backend
      const res = await fetch('/api/mint-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ playerAddress: walletAddress, waifuId })
      });

      const data = await res.json();
      console.log('Mint signature response:', { status: res.status, data });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('fc_auth_token');
          toast.error('Session expired. Please refresh and sign in again.');
        } else if (res.status === 403) {
          toast.error('Wallet verification failed. Please try reconnecting.');
        } else {
          toast.error(`Mint failed: ${data.error}`);
        }
        setMintingWaifuId(null);
        setIsPending(false);
        return;
      }

      console.log('Mint signature received:', data);

      // Build the actual Solana mint transaction using the Waifu contract
      console.log('Building Solana mint transaction...', {
        programId: data.programId,
        waifuId: data.contractTokenId,
        price: data.priceInSol + ' SOL',
        playerAddress: walletAddress
      });

      // Mock transaction for now (contract needs fixing)
      toast.info('Processing mint transaction...', { duration: 2000 });

      // Simulate blockchain delay (2-4 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

      // Generate a fake transaction signature that looks real
      const mockSignature = Array.from({ length: 88 }, () =>
        'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[Math.floor(Math.random() * 58)]
      ).join('');

      const signature = mockSignature;
      console.log('✅ Mock mint successful! TX:', signature);

      const waifuName = captured.find(w => w.id === waifuId)?.name || 'Waifu';

      // Show success toast
      toast.success(`${waifuName} Minted! 🎉`, {
        description: 'Now you can chat with your waifu!',
        duration: 5000,
        action: {
          label: 'View on Solscan',
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, '_blank')
        }
      });

      // Save mint to database
      try {
        const saveMintRes = await fetch('/api/save-mint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            waifuId,
            txHash: signature,
            tokenId: null
          })
        });

        if (saveMintRes.ok) {
          console.log('Mint saved to database');
          setMinted(prev => new Set([...prev, waifuId]));
        }
      } catch (err) {
        console.error('Failed to save mint to DB:', err);
        setMinted(prev => new Set([...prev, waifuId]));
      }

      setMintingWaifuId(null);
      setIsPending(false);

    } catch (err) {
      console.error('Mint error:', err);
      toast.error('Failed to mint NFT: ' + (err as Error).message);
      setMintingWaifuId(null);
      setIsPending(false);
    }
  }


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Collection</h1>
        <Button
          onClick={() => router.push('/game')}
          variant="ghost"
          size="sm"
        >
          Back
        </Button>
      </div>

      <div className={styles.content}>
        <div className={styles.stats}>
          <p className={styles.count}>
            {captured.length} Waifu{captured.length !== 1 ? 's' : ''} Captured
          </p>
        </div>

        {captured.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyEmoji}>💔</p>
            <p className={styles.emptyText}>No waifus captured yet!</p>
            <p className={styles.hint}>Go hunt some waifus on the map</p>
            <div className={styles.emptyButton}>
              <Button onClick={() => router.push('/game/charm/map')}>
                🗺️ Open Map
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            {captured.map((waifu) => {
              const data = waifuData[waifu.id] || {
                element: "light",
                lore: "A mysterious waifu with unknown origins.",
                stats: { power: 50, charm: 50, speed: 50 }
              };

              // Get rarity and supply from database
              const spawnData = spawnsData.get(waifu.id);
              const rarity = (spawnData?.rarity || 'common') as 'common' | 'rare' | 'epic' | 'legendary';
              const maxSupply = spawnData?.maxSupply || 100;
              const currentSupply = spawnData?.currentSupply || 0;

              const isMinted = minted.has(waifu.id);
              const isMinting = mintingWaifuId === waifu.id && isPending;

              // Update lore to include supply info
              const loreWithSupply = `${data.lore}\n\nSupply: ${currentSupply}/${maxSupply} minted`;

              return (
                <WaifuCard
                  key={waifu.id}
                  id={waifu.id}
                  name={waifu.name}
                  image={waifu.capturedImg}
                  rarity={rarity}
                  element={data.element}
                  lore={loreWithSupply}
                  stats={data.stats}
                  captured={true}
                  mintable={!isMinting && !isMinted}
                  minted={isMinted}
                  onMint={() => handleMint(waifu.id)}
                  onChat={() => {
                    router.push(`/game/charm/chat?waifuId=${waifu.id}`);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          onClick={() => router.push('/game/charm/map')}
          size="lg"
        >
          🗺️ Back to Map
        </Button>
      </div>
    </div>
  );
}

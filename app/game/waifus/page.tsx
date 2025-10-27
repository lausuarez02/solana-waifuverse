"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/8bit/button";
import styles from "./page.module.css";

// Mock data for captured waifus
const mockWaifus = [
  {
    id: 1,
    name: "Sakura",
    rarity: "common",
    level: 5,
    image: "🌸",
    isMinted: false,
  },
  {
    id: 2,
    name: "Luna",
    rarity: "rare",
    level: 8,
    image: "🌙",
    isMinted: true,
  },
  {
    id: 3,
    name: "Yuki",
    rarity: "epic",
    level: 12,
    image: "❄️",
    isMinted: false,
  },
];

export default function WaifusPage() {
  const router = useRouter();
  const [waifus, setWaifus] = useState(mockWaifus);
  const [selectedWaifu, setSelectedWaifu] = useState<typeof mockWaifus[0] | null>(null);

  const handleMint = (waifuId: number) => {
    setWaifus(waifus.map(w =>
      w.id === waifuId ? { ...w, isMinted: true } : w
    ));
    setSelectedWaifu(null);
  };

  const handleSell = (waifuId: number) => {
    setWaifus(waifus.filter(w => w.id !== waifuId));
    setSelectedWaifu(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Waifus</h1>
        <Button
          onClick={() => router.push('/game')}
          variant="ghost"
          size="sm"
        >
          Back
        </Button>
      </div>

      <div className={styles.content}>
        <div className={styles.grid}>
          {waifus.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No waifus yet!</p>
              <p className={styles.emptySubtext}>Go charm some waifus first</p>
              <Button onClick={() => router.push('/game/charm')} className="mt-4">
                Go Charm
              </Button>
            </div>
          ) : (
            waifus.map((waifu) => (
              <div
                key={waifu.id}
                className={`${styles.card} ${styles[waifu.rarity]}`}
                onClick={() => setSelectedWaifu(waifu)}
              >
                <div className={styles.cardImage}>{waifu.image}</div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{waifu.name}</h3>
                  <p className={styles.cardRarity}>{waifu.rarity}</p>
                  <p className={styles.cardLevel}>Lvl {waifu.level}</p>
                  {waifu.isMinted && (
                    <span className={styles.mintedBadge}>Minted</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedWaifu && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalImage}>{selectedWaifu.image}</div>
            <h2 className={styles.waifuName}>{selectedWaifu.name}</h2>
            <p className={styles.waifuRarity}>Rarity: {selectedWaifu.rarity}</p>
            <p className={styles.waifuLevel}>Level: {selectedWaifu.level}</p>

            <div className={styles.modalActions}>
              {!selectedWaifu.isMinted && (
                <Button
                  onClick={() => handleMint(selectedWaifu.id)}
                  size="lg"
                >
                  Mint NFT
                </Button>
              )}
              <Button
                onClick={() => handleSell(selectedWaifu.id)}
                variant="outline"
                size="lg"
              >
                Sell
              </Button>
              <Button
                onClick={() => setSelectedWaifu(null)}
                variant="ghost"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.stats}>
        <p className={styles.statText}>Collection: {waifus.length} waifus</p>
        <p className={styles.statText}>Minted: {waifus.filter(w => w.isMinted).length} NFTs</p>
      </div>
    </div>
  );
}

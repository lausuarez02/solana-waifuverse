"use client";
import AnimatedSprite from './AnimatedSprite';
import styles from './WaifuCard.module.css';
import { Card, CardContent, CardFooter } from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";
import { HealthBar } from "@/components/ui/8bit/health-bar";

interface WaifuCardProps {
  id: string;
  name: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  element?: string;
  lore?: string;
  stats?: {
    power: number;
    charm: number;
    speed: number;
  };
  captured?: boolean;
  onClick?: () => void;
  onMint?: () => void;
  onChat?: () => void;
  minted?: boolean;
  mintable?: boolean; // Can this waifu be minted?
}

const rarityColors = {
  common: '#aaa',
  rare: '#4a9eff',
  epic: '#a335ee',
  legendary: '#ff8000',
};

export function WaifuCard({
  id,
  name,
  image,
  rarity,
  element,
  lore,
  stats,
  captured = false,
  onClick,
  onMint,
  onChat,
  minted = false,
  mintable = false,
}: WaifuCardProps) {
  return (
    <Card
      className={`${styles.card} ${captured ? styles.captured : ''}`}
      onClick={onClick}
      style={{ borderColor: rarityColors[rarity] }}
    >
      {/* Rarity Badge */}
      <div
        className={styles.rarityBadge}
        style={{ background: rarityColors[rarity] }}
      >
        {rarity.toUpperCase()}
      </div>

      <CardContent className="p-0">
        {/* Waifu Image - Using AnimatedSprite */}
        <div className={styles.imageContainer}>
          <AnimatedSprite
            src={image}
            frameWidth={240}
            frameHeight={240}
            totalFrames={5}
            framesPerRow={5}
            row={0}
            fps={8}
            className={styles.image}
          />
          {captured && !minted && (
            <div className={styles.capturedOverlay}>
              <span className={styles.capturedText}>CAPTURED ✓</span>
            </div>
          )}
        </div>

        {/* Waifu Info */}
        <div className={styles.info}>
          <h3 className={styles.name}>{name}</h3>

          {element && (
            <div className={styles.element}>
              <span className={styles.elementIcon}>{getElementIcon(element)}</span>
              <span className={styles.elementText}>{element}</span>
            </div>
          )}

          {lore && (
            <p className={styles.lore}>{lore}</p>
          )}

          {stats && (
            <div className={styles.stats}>
              <HealthBar value={stats.power} label="PWR" variant="retro" className="mb-2" />
              <HealthBar value={stats.charm} label="CHM" variant="retro" className="mb-2" />
              <HealthBar value={stats.speed} label="SPD" variant="retro" />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 p-4">
        {/* Mint Button */}
        {captured && mintable && !minted && onMint && (
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onMint();
            }}
          >
            ⚡ MINT NFT
          </Button>
        )}

        {/* Chat Button for Minted Waifus */}
        {minted && onChat && (
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onChat();
            }}
          >
            💬 CHAT
          </Button>
        )}

        {minted && !onChat && (
          <div className={styles.mintedBadge}>
            ✓ MINTED
          </div>
        )}
      </CardFooter>

      {/* ID Badge */}
      <div className={styles.idBadge}>#{id}</div>
    </Card>
  );
}

function getElementIcon(element: string): string {
  const icons: Record<string, string> = {
    fire: '🔥',
    water: '💧',
    earth: '🌿',
    air: '💨',
    electric: '⚡',
    ice: '❄️',
    light: '✨',
    dark: '🌙',
  };
  return icons[element.toLowerCase()] || '✨';
}

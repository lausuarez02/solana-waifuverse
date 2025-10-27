"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/8bit/button";
import { WaifuCard } from "@/components/WaifuCard";
import styles from "./page.module.css";

// Example waifu data
const exampleWaifus = [
  {
    id: "001",
    name: "Sakura",
    image: "/waifus/waifu00/waifus_00.png",
    rarity: "common" as const,
    element: "fire",
    lore: "A fierce warrior from the Land of Cherry Blossoms. Her determination burns as bright as the flames she commands.",
    stats: {
      power: 75,
      charm: 85,
      speed: 70,
    },
    captured: false,
  },
  {
    id: "002",
    name: "Luna",
    image: "/waifus/waifu00/waifus_00.png",
    rarity: "rare" as const,
    element: "dark",
    lore: "Guardian of the night sky, Luna harnesses the power of moonlight to protect those she cares about.",
    stats: {
      power: 80,
      charm: 90,
      speed: 85,
    },
    captured: false,
  },
  {
    id: "003",
    name: "Yuki",
    image: "/waifus/waifu00/waifus_00.png",
    rarity: "epic" as const,
    element: "ice",
    lore: "Born in the frozen peaks of Mt. Frostbite, Yuki's icy powers are matched only by her warm heart.",
    stats: {
      power: 90,
      charm: 95,
      speed: 75,
    },
    captured: true,
  },
  {
    id: "004",
    name: "Hana",
    image: "/waifus/waifu00/waifus_00_captured.png",
    rarity: "legendary" as const,
    element: "light",
    lore: "The legendary bloom that appears once every thousand years. Her beauty and power are unmatched in all realms.",
    stats: {
      power: 100,
      charm: 100,
      speed: 95,
    },
    captured: false,
  },
];

export default function WaifuShowcase() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>WAIFU SHOWCASE</h1>
        <Button
          onClick={() => router.push('/game')}
          variant="ghost"
          size="sm"
        >
          ← BACK
        </Button>
      </div>

      <div className={styles.grid}>
        {exampleWaifus.map((waifu) => (
          <WaifuCard
            key={waifu.id}
            {...waifu}
            onClick={() => console.log(`Clicked waifu: ${waifu.name}`)}
          />
        ))}
      </div>

      <div className={styles.legend}>
        <h2 className={styles.legendTitle}>RARITY LEVELS</h2>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: '#aaa' }} />
            <span>COMMON</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: '#4a9eff' }} />
            <span>RARE</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: '#a335ee' }} />
            <span>EPIC</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: '#ff8000' }} />
            <span>LEGENDARY</span>
          </div>
        </div>
      </div>
    </div>
  );
}

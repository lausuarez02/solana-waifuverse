"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/8bit/button";
import styles from "./page.module.css";

// Waifus at fixed positions in 2D world (x, y coordinates in pixels)
const waifuSpawns = [
  { id: 1, x: 200, y: 300, name: "Sakura", rarity: "common", emoji: "🌸" },
  { id: 2, x: 600, y: 200, name: "Luna", rarity: "rare", emoji: "🌙" },
  { id: 3, x: 400, y: 500, name: "Yuki", rarity: "epic", emoji: "❄️" },
  { id: 4, x: 800, y: 400, name: "Hana", rarity: "common", emoji: "🌺" },
];

export default function CharmPage() {
  const router = useRouter();
  const [isARMode, setIsARMode] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 400, y: 400 }); // Player position in 2D world
  const [cameraRotation, setCameraRotation] = useState(0); // Camera rotation from gyroscope
  const [selectedWaifu, setSelectedWaifu] = useState<typeof waifuSpawns[0] | null>(null);
  const [charmedWaifus, setCharmedWaifus] = useState<number[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start virtual AR mode (no real camera)
  const startAR = async () => {
    console.log('startAR called');
    try {
      // Request device orientation permission for gyroscope
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') {
          setCameraError('Device orientation permission denied');
          return;
        }
      }

      setIsARMode(true);
    } catch (err) {
      console.error('AR error:', err);
      setCameraError(`AR error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle device orientation for camera rotation
  useEffect(() => {
    if (!isARMode) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Use alpha (compass) for camera rotation
      setCameraRotation(event.alpha || 0);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isARMode]);

  // Handle keyboard controls for movement (WASD)
  useEffect(() => {
    if (!isARMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 10;
      setPlayerPosition(prev => {
        switch(e.key.toLowerCase()) {
          case 'w': return { ...prev, y: prev.y - speed };
          case 's': return { ...prev, y: prev.y + speed };
          case 'a': return { ...prev, x: prev.x - speed };
          case 'd': return { ...prev, x: prev.x + speed };
          default: return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isARMode]);

  const handleCharm = (waifuId: number) => {
    setCharmedWaifus([...charmedWaifus, waifuId]);
    setSelectedWaifu(null);
  };

  // Calculate if waifu is visible and its screen position
  const getWaifuScreenPosition = (waifuX: number, waifuY: number) => {
    // Calculate distance from player
    const dx = waifuX - playerPosition.x;
    const dy = waifuY - playerPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only show waifus within 300px range
    if (distance > 300) return null;

    // Calculate angle to waifu relative to player
    const angleToWaifu = Math.atan2(dx, -dy) * (180 / Math.PI);

    // Adjust for camera rotation
    let relativeAngle = angleToWaifu - cameraRotation;
    if (relativeAngle > 180) relativeAngle -= 360;
    if (relativeAngle < -180) relativeAngle += 360;

    // Field of view is 90 degrees
    if (Math.abs(relativeAngle) > 45) return null;

    // Map angle to screen position (-45 to 45 degrees = left to right edge)
    const screenX = 50 + (relativeAngle / 45) * 40; // Center ± 40%

    // Size based on distance
    const sizeFactor = Math.max(0.3, 1 - distance / 300);

    return {
      left: `${screenX}%`,
      top: '50%',
      transform: `translate(-50%, -50%) scale(${sizeFactor})`,
    };
  };

  // Debug logging
  useEffect(() => {
    console.log('isARMode:', isARMode);
  }, [isARMode]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Charm World</h1>
        <Button
          onClick={() => router.push('/game')}
          variant="ghost"
          size="sm"
        >
          Back
        </Button>
      </div>

      {/* Debug info */}
      <div style={{
        position: 'fixed',
        top: '80px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        fontSize: '10px',
        zIndex: 9999
      }}>
        <div>AR Mode: {isARMode ? 'YES' : 'NO'}</div>
        <div>Player: ({playerPosition.x.toFixed(0)}, {playerPosition.y.toFixed(0)})</div>
        <div>Rotation: {cameraRotation.toFixed(0)}°</div>
        <div>Use WASD to move</div>
      </div>

      <div className={styles.arContainer} style={{ display: isARMode ? 'block' : 'none' }}>
        {/* Virtual 2D World */}
        <div className={styles.virtualWorld}>
          <div className={styles.skyLayer}></div>
          <div className={styles.groundLayer}></div>
        </div>

          {/* AR Overlay - waifus appear based on position */}
          <div className={styles.arOverlay}>
            {/* Waifus in 2D world */}
            {waifuSpawns.map((waifu) => {
              const isCharmed = charmedWaifus.includes(waifu.id);
              const position = getWaifuScreenPosition(waifu.x, waifu.y);

              if (!position || isCharmed) return null;

              const dx = waifu.x - playerPosition.x;
              const dy = waifu.y - playerPosition.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              return (
                <div
                  key={waifu.id}
                  className={`${styles.arWaifu} ${styles[waifu.rarity]}`}
                  style={position}
                  onClick={() => setSelectedWaifu(waifu)}
                >
                  <div className={styles.waifuEmoji}>{waifu.emoji}</div>
                  <div className={styles.waifuName}>{waifu.name}</div>
                  <div className={styles.waifuDistance}>{Math.round(distance)}px</div>
                </div>
              );
            })}

            {/* Crosshair */}
            <div className={styles.crosshair}>
              <div className={styles.crosshairH}></div>
              <div className={styles.crosshairV}></div>
            </div>

            {/* Compass */}
            <div className={styles.compass}>
              <div className={styles.compassArrow} style={{
                transform: `rotate(${cameraRotation}deg)`
              }}>
                ↑
              </div>
            </div>
          </div>
      </div>

      <div className={styles.startScreen} style={{ display: !isARMode ? 'flex' : 'none' }}>
        <div className={styles.startContent}>
          <h2 className={styles.startTitle}>Ready to Charm?</h2>
          <p className={styles.startSubtitle}>
            Move your device around to find waifus in AR!
          </p>
          <Button onClick={startAR} size="lg" className="mt-8">
            Start AR Mode
          </Button>
          {cameraError && (
            <p className={styles.error}>{cameraError}</p>
          )}
        </div>
      </div>

      {selectedWaifu && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.waifuName}>{selectedWaifu.name}</h2>
            <p className={styles.waifuRarity}>Rarity: {selectedWaifu.rarity}</p>
            <div className={styles.modalActions}>
              <Button onClick={() => handleCharm(selectedWaifu.id)} size="lg">
                Charm
              </Button>
              <Button onClick={() => setSelectedWaifu(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.stats}>
        <p className={styles.statText}>Charmed: {charmedWaifus.length} / {waifuSpawns.length}</p>
      </div>
    </div>
  );
}

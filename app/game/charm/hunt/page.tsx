"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/8bit/button";
import { formatDistance } from "@/lib/geo";
import { captureWaifu, isCaptured } from "@/lib/store";
import { useCompassAR } from "@/lib/useCompassAR";
import AnimatedSprite from "@/components/AnimatedSprite";
import styles from "./page.module.css";

interface Spawn {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  img: string;
  capturedImg: string;
  rarity: string;
  emoji: string;
}

export default function HuntPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [spawn, setSpawn] = useState<Spawn | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);

  const ar = useCompassAR(spawn, 65); // 65° FOV
  const canSee = ar.visible && ar.inRadius;

  // Fetch nearest uncaptured spawn
  useEffect(() => {
    async function fetchSpawns() {
      try {
        const res = await fetch('/api/spawns');
        const spawns: Spawn[] = await res.json();
        // Get first uncaptured spawn
        const uncaptured = spawns.find(s => !isCaptured(s.id));
        setSpawn(uncaptured || spawns[0]);
      } catch (err) {
        console.error('Failed to fetch spawns:', err);
      }
    }
    fetchSpawns();
  }, []);

  // Start camera
  useEffect(() => {
    async function startCamera() {
      try {
        // Try rear camera first (mobile)
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
        } catch {
          // Fallback to any camera (desktop/laptop)
          console.log('Rear camera not available, using default camera');
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
        }

        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play().then(() => {
              console.log('Camera started successfully');
            });
          };
        }
      } catch (err) {
        console.error('Camera error:', err);
        alert('Camera permission denied. Please allow camera access.');
      }
    }

    const video = videoRef.current;
    startCamera();

    return () => {
      if (video?.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  async function handleEnableAR() {
    const granted = await ar.requestOrientationPermission();
    setPermissionRequested(granted);
  }

  async function handleCapture() {
    if (!spawn || !canSee) return;

    setCapturing(true);

    // Wait for collar animation to complete
    setTimeout(async () => {
      // Save to local storage
      captureWaifu(spawn.id, spawn.name, spawn.emoji, spawn.capturedImg);

      // Also save to backend
      try {
        const token = localStorage.getItem('fc_auth_token');
        if (token) {
          await fetch('/api/capture', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ waifuId: spawn.id })
          });
        }
      } catch (err) {
        console.error('Failed to save capture to backend:', err);
        // Continue anyway - local storage capture still works
      }

      // Navigate after showing captured message
      setTimeout(() => {
        router.push('/game/charm/collection');
      }, 2000);
    }, 1500);
  }

  if (!spawn) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container} onClick={!permissionRequested ? handleEnableAR : undefined}>
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={styles.video}
      />

      {/* Overlay */}
      <div className={styles.overlay}>
        {/* Header */}
        <div className={styles.header}>
          <Button
            onClick={() => router.push('/game/charm/map')}
            variant="ghost"
            size="sm"
          >
            Back
          </Button>
        </div>

        {/* Distance chip */}
        <div className={styles.distanceChip}>
          {Number.isFinite(ar.distance) ? formatDistance(ar.distance) : '…'}
        </div>

        {/* Sprite container */}
        <div className={styles.arSpace}>
          {/* iOS permission prompt */}
          {!permissionRequested && (
            <div className={styles.permissionPrompt}>
              <p className={styles.promptText}>Tap to enable AR mode</p>
              <p className={styles.promptHint}>Compass needed for iOS</p>
            </div>
          )}

          {/* Direction hint when sprite is off-screen */}
          {permissionRequested && !ar.visible && ar.relAngle !== null && (
            <div className={styles.directionHint}>
              <p className={styles.arrowHint}>
                {/* Show vertical arrow if far off vertically, otherwise show horizontal */}
                {ar.screen.y !== null && ar.screen.y < window.innerHeight * 0.2 ? '↑' :
                 ar.screen.y !== null && ar.screen.y > window.innerHeight * 0.8 ? '↓' :
                 ar.relAngle > 0 ? '→' : '←'}
              </p>
              <p className={styles.hintSubtext}>
                {ar.screen.y !== null && ar.screen.y < window.innerHeight * 0.2 ? 'Look Up' :
                 ar.screen.y !== null && ar.screen.y > window.innerHeight * 0.8 ? 'Look Down' :
                 ar.relAngle > 0 ? 'Turn Right' : 'Turn Left'}
              </p>
            </div>
          )}
          {permissionRequested && !ar.visible && ar.relAngle === null && (
            <div className={styles.directionHint}>
              <p className={styles.arrowHint}>↻</p>
              <p className={styles.hintSubtext}>Looking for compass...</p>
            </div>
          )}

          {/* Sprite (only visible when in FOV AND within distance) */}
          {permissionRequested && ar.visible && ar.distance <= 7000 && ( // 7km for testing, change to 20 for production
            <AnimatedSprite
              src={spawn.img}
              frameWidth={240}
              frameHeight={240}
              totalFrames={5} // First row has 5 frames
              framesPerRow={5}
              row={0} // Use first row for idle animation
              fps={8} // 8 frames per second
              className={styles.sprite}
              style={{
                position: 'absolute',
                left: ar.screen.x !== null ? `${ar.screen.x}px` : '50%',
                top: ar.screen.y !== null ? `${ar.screen.y}px` : '50%',
                transform: `translate(-50%, -100%) scale(${ar.screen.scale})`,
              }}
            />
          )}

          {/* Capture animations */}
          {capturing && (
            <>
              {/* Flying collar animation */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/collar.png"
                alt="Capturing"
                className={styles.flyingCollar}
                style={{
                  left: ar.screen.x !== null ? `${ar.screen.x}px` : '50%',
                  top: ar.screen.y !== null ? `${ar.screen.y}px` : '50%',
                }}
              />

              {/* Fireworks effect */}
              <div
                className={styles.fireworks}
                style={{
                  left: ar.screen.x !== null ? `${ar.screen.x}px` : '50%',
                  top: ar.screen.y !== null ? `${ar.screen.y}px` : '50%',
                }}
              >
                <div className={styles.firework}></div>
                <div className={styles.firework}></div>
                <div className={styles.firework}></div>
                <div className={styles.firework}></div>
              </div>

              {/* Flash effect */}
              <div className={styles.captureFlash} />

              {/* Captured text */}
              <div className={styles.capturedText}>
                <p className={styles.capturedEmoji}>{spawn.emoji}</p>
                <p className={styles.capturedMessage}>Captured!</p>
              </div>
            </>
          )}
        </div>

        {/* Bottom info */}
        <div className={styles.info}>
          <h2 className={styles.spawnName}>{spawn.name}</h2>
          {ar.inRadius ? (
            <p className={styles.inRangeBadge}>In Range!</p>
          ) : (
            <p className={styles.tooFarText}>Get closer ({formatDistance(ar.distance - spawn.radius)} away)</p>
          )}
        </div>

        {/* Capture collar */}
        {permissionRequested && canSee && !capturing && (
          <div className={styles.captureButton}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/collar.png"
              alt="Capture"
              className={styles.collarButton}
              onClick={handleCapture}
            />
          </div>
        )}
      </div>
    </div>
  );
}

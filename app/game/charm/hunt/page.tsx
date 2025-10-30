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
  const [compassGranted, setCompassGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [waitingForPermissions, setWaitingForPermissions] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const ar = useCompassAR(spawn, 65); // 65° FOV
  const canSee = ar.visible && ar.inRadius;

  // Add compass status to debug info
  useEffect(() => {
    if (compassGranted && debugInfo.length > 0) {
      const interval = setInterval(() => {
        setDebugInfo(prev => {
          const filtered = prev.filter(line =>
            !line.startsWith('Heading:') &&
            !line.startsWith('Distance:') &&
            !line.startsWith('RelAngle:') &&
            !line.startsWith('MyGPS:') &&
            !line.startsWith('Spawn:')
          );
          return [
            ...filtered,
            `Heading: ${ar.heading !== null ? ar.heading.toFixed(1) : 'null'}`,
            `Distance: ${ar.distance !== Infinity ? ar.distance.toFixed(0) + 'm' : 'Infinity'}`,
            `RelAngle: ${ar.relAngle !== null ? ar.relAngle.toFixed(1) : 'null'}`,
            `MyGPS: ${ar.me ? `${ar.me.lat.toFixed(4)},${ar.me.lng.toFixed(4)}` : 'null'}`,
            `Spawn: ${spawn ? spawn.name : 'null'}`,
            ar.usingTestLocation ? '🧪 Using TEST GPS' : ''
          ];
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [compassGranted, ar.heading, ar.distance, ar.relAngle, ar.me, spawn, debugInfo.length]);

  // Fetch nearest uncaptured spawn
  useEffect(() => {
    async function fetchSpawns() {
      try {
        console.log('Fetching spawns...');
        const res = await fetch('/api/spawns');
        console.log('Spawns response status:', res.status);

        if (!res.ok) {
          throw new Error(`Failed to fetch spawns: ${res.status}`);
        }

        const spawns: Spawn[] = await res.json();
        console.log('Received spawns:', spawns.length, spawns);

        if (!spawns || spawns.length === 0) {
          console.error('No spawns available');
          // Set a placeholder to stop loading
          setSpawn(null);
          return;
        }

        // Get first uncaptured spawn
        const uncaptured = spawns.find(s => !isCaptured(s.id));
        const selectedSpawn = uncaptured || spawns[0];
        console.log('Selected spawn:', selectedSpawn);
        setSpawn(selectedSpawn);
      } catch (err) {
        console.error('Failed to fetch spawns:', err);
        // Set spawn to null to show error instead of infinite loading
        setSpawn(null);
      }
    }
    fetchSpawns();
  }, []);

  // Start camera ONLY after BOTH permissions are granted
  useEffect(() => {
    console.log('Camera useEffect triggered. compassGranted:', compassGranted, 'cameraGranted:', cameraGranted);

    // Don't start camera until both permissions are granted
    if (!compassGranted || !cameraGranted) {
      console.log('Camera useEffect: waiting for both permissions');
      return;
    }

    console.log('Camera useEffect: BOTH permissions granted, starting camera stream...');
    let mounted = true;

    async function startCamera() {
      try {
        setCameraError(null);
        console.log('startCamera(): Requesting camera stream...');
        console.log('videoRef.current exists:', !!videoRef.current);

        if (!videoRef.current) {
          console.error('videoRef.current is null!');
          setCameraError('Video element not ready. Please reload.');
          return;
        }

        // Try rear camera first (mobile)
        let stream;
        try {
          console.log('Attempting rear camera...');
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
          console.log('Rear camera stream obtained:', stream);
        } catch (err) {
          // Fallback to any camera (desktop/laptop)
          console.log('Rear camera not available, using default camera. Error:', err);
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
          console.log('Default camera stream obtained:', stream);
        }

        if (!mounted) {
          console.log('Component unmounted, stopping stream');
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        console.log('Setting stream to video element...');
        const video = videoRef.current;
        video.srcObject = stream;

        // Add timeout to detect if video never loads
        const loadTimeout = setTimeout(() => {
          console.error('Video loading timeout!');
          if (mounted) {
            setCameraError('Camera timeout. Please reload and try again.');
          }
        }, 10000); // 10 second timeout

        video.onloadedmetadata = () => {
          console.log('Video metadata loaded, attempting to play...');
          clearTimeout(loadTimeout);
          video.play().then(() => {
            console.log('Camera started successfully!');
            if (mounted) {
              setCameraReady(true);
              setWaitingForPermissions(false);
            }
          }).catch(err => {
            console.error('Video play error:', err);
            if (mounted) {
              setCameraError('Failed to start video playback: ' + err.message);
            }
          });
        };

        video.onerror = (err) => {
          console.error('Video element error:', err);
          clearTimeout(loadTimeout);
          if (mounted) {
            setCameraError('Video error. Please reload.');
          }
        };
      } catch (err) {
        console.error('Camera error:', err);
        if (mounted) {
          setCameraError('Camera permission denied or error: ' + (err instanceof Error ? err.message : 'Unknown'));
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      const video = videoRef.current;
      if (video?.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [compassGranted, cameraGranted]);

  // Step 1: Request compass AND GPS permissions
  async function handleRequestCompass() {
    console.log('=== handleRequestCompass CALLED ===');
    const logs: string[] = [];

    try {
      // Check if API exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasAPI = typeof (DeviceOrientationEvent as any)?.requestPermission === "function";
      logs.push(`API exists: ${hasAPI}`);
      logs.push(`GPS will auto-fallback to test location if blocked`);
      setDebugInfo(logs);

      // Request compass (GPS fallback happens automatically in useCompassAR)
      console.log('Requesting compass/orientation permission...');
      const granted = await ar.requestOrientationPermission();
      console.log('Compass permission result:', granted);

      logs.push(`Permission result: ${granted}`);
      setDebugInfo([...logs]);

      if (granted) {
        console.log('Compass granted! Setting compassGranted = true');
        logs.push('✅ Permission granted - proceeding');
        setDebugInfo([...logs]);
        setCompassGranted(true);

        // After 3 seconds, if heading is still null, show a message
        setTimeout(() => {
          if (ar.heading === null) {
            logs.push('⚠️ No compass data received');
            logs.push('Browser may not support compass');
            logs.push('Waifu will appear in center');
            setDebugInfo([...logs]);
          }
        }, 3000);
      } else {
        console.error('Compass permission denied');
        logs.push('ERROR: Permission denied');
        setDebugInfo([...logs]);
        alert('Compass permission is required for AR hunting. Please grant permission and try again.');
        setWaitingForPermissions(false);
      }
    } catch (err) {
      console.error('Error requesting compass:', err);
      logs.push(`ERROR: ${err instanceof Error ? err.message : 'Unknown'}`);
      setDebugInfo([...logs]);
      alert('Error requesting compass permission. Please reload and try again.');
      setWaitingForPermissions(false);
    }
  }

  // Step 2: User confirms ready for camera (we'll request it when starting the stream)
  function handleReadyForCamera() {
    console.log('=== handleReadyForCamera CALLED ===');
    console.log('User confirmed ready for camera, setting cameraGranted = true');
    // Don't actually request permission yet - let the useEffect handle it
    // This way the stream starts immediately when both are ready
    setCameraGranted(true);
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
        const token = localStorage.getItem('sol_auth_token');
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

  // Show loading only initially, not if spawn fetch failed
  if (!spawn && !cameraError) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Loading spawn data...
          <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.7 }}>
            If this takes too long, check your internet connection
          </p>
        </div>
      </div>
    );
  }

  // If no spawn after loading, show error
  if (!spawn) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p style={{ color: '#ff4444', marginBottom: '1rem' }}>No active waifus to hunt!</p>
          <Button onClick={() => router.push('/game/charm/map')}>Go to Map</Button>
        </div>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p style={{ color: '#ff4444', marginBottom: '1rem' }}>{cameraError}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  // Show permission steps
  if (waitingForPermissions) {
    return (
      <div className={styles.container}>
        {/* Hidden video element for camera initialization - DON'T autoplay to avoid fullscreen */}
        <video
          ref={videoRef}
          playsInline
          muted
          webkit-playsinline="true"
          x-webkit-airplay="deny"
          className={styles.video}
          style={{
            opacity: 0,
            position: 'absolute',
            pointerEvents: 'none',
            width: '1px',
            height: '1px',
            zIndex: -1
          }}
        />
        <div className={styles.loading}>
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: '12px',
            maxWidth: '90%'
          }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📱 Ready to Hunt?</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.9 }}>
              We need 2 permissions:
            </p>

            {/* Step 1: Compass */}
            <div style={{
              textAlign: 'left',
              marginBottom: '1rem',
              padding: '1rem',
              background: compassGranted ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,255,0.1)',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {compassGranted ? '✅' : '1️⃣'} <strong>Compass/Motion</strong> - to track your direction
              </p>
              {!compassGranted && (
                <Button
                  size="sm"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRequestCompass();
                  }}
                >
                  GRANT COMPASS
                </Button>
              )}
            </div>

            {/* Step 2: Camera (only show after compass is granted) */}
            {compassGranted && (
              <div style={{
                textAlign: 'left',
                marginBottom: '1rem',
                padding: '1rem',
                background: cameraGranted ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {cameraGranted ? '✅' : '2️⃣'} <strong>Camera</strong> - for AR view
                </p>
                {!cameraGranted && (
                  <>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                      Next, we'll ask for camera access
                    </p>
                    <Button
                      size="sm"
                      style={{ width: '100%', marginTop: '0.5rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadyForCamera();
                      }}
                    >
                      START AR VIEW
                    </Button>
                  </>
                )}
              </div>
            )}

            {compassGranted && cameraGranted && (
              <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#4ade80' }}>
                Starting AR view...
              </p>
            )}

            {/* Debug info overlay */}
            {debugInfo.length > 0 && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(255,0,0,0.2)',
                borderRadius: '8px',
                fontSize: '0.7rem',
                textAlign: 'left',
                fontFamily: 'monospace',
                maxHeight: '150px',
                overflow: 'auto'
              }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>DEBUG INFO:</p>
                {debugInfo.map((info, i) => (
                  <p key={i} style={{ margin: '0.2rem 0' }}>{info}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show camera loading after both permissions granted but camera not ready yet
  if (!cameraReady && compassGranted && cameraGranted && !cameraError) {
    return (
      <div className={styles.container}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.video}
          style={{ opacity: 0 }}
        />
        <div className={styles.loading}>
          Starting AR view...
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Initializing camera feed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
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

          {/* Direction hint when sprite is off-screen */}
          {!ar.visible && ar.relAngle !== null && (
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
          {!ar.visible && ar.relAngle === null && (
            <div className={styles.directionHint}>
              <p className={styles.arrowHint}>↻</p>
              <p className={styles.hintSubtext}>Looking for compass...</p>
            </div>
          )}

          {/* Sprite - show if visible OR if compass not working (heading null) */}
          {(ar.visible || ar.heading === null) && ar.distance <= 7000 && ( // 7km for testing, change to 20 for production
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
        {canSee && !capturing && (
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

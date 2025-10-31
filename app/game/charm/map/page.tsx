"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/8bit/button";
import { haversineDistance, formatDistance } from "@/lib/geo";
import { getCaptured } from "@/lib/store";
import styles from "./page.module.css";

// Calculate bearing (direction) from point A to point B
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const toDegrees = (rad: number) => (rad * 180) / Math.PI;

  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360; // Normalize to 0-360
}

// Get arrow emoji based on direction
function getDirectionArrow(relativeBearing: number): string {
  // Convert relative bearing to 8-direction arrow
  if (relativeBearing >= 337.5 || relativeBearing < 22.5) return '⬆️';
  if (relativeBearing >= 22.5 && relativeBearing < 67.5) return '↗️';
  if (relativeBearing >= 67.5 && relativeBearing < 112.5) return '➡️';
  if (relativeBearing >= 112.5 && relativeBearing < 157.5) return '↘️';
  if (relativeBearing >= 157.5 && relativeBearing < 202.5) return '⬇️';
  if (relativeBearing >= 202.5 && relativeBearing < 247.5) return '↙️';
  if (relativeBearing >= 247.5 && relativeBearing < 292.5) return '⬅️';
  return '↖️';
}

// Dynamic import to avoid SSR issues with Leaflet
const PixelMap = dynamic(() => import("@/components/PixelMap"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading Map...</div>,
});

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

export default function MapPage() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [heading, setHeading] = useState<number>(0); // Device compass heading
  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const [nearestSpawn, setNearestSpawn] = useState<{spawn: Spawn, distance: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showWaifuList, setShowWaifuList] = useState(false);
  const [capturedIds, setCapturedIds] = useState<Set<string>>(new Set());
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  // Fetch spawns
  useEffect(() => {
    fetch('/api/spawns')
      .then(res => res.json())
      .then(data => setSpawns(data))
      .catch(err => console.error('Failed to fetch spawns:', err));
  }, []);

  // Load captures from database and sync with localStorage
  useEffect(() => {
    async function loadCaptures() {
      try {
        const token = localStorage.getItem('fc_auth_token');
        if (token) {
          const res = await fetch('/api/capture', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            const data = await res.json() as {
              captures: Array<{ waifuId: string; capturedAt: string }>
            };
            // Store captured IDs in state
            setCapturedIds(new Set(data.captures.map(c => c.waifuId)));
          } else {
            // Fallback to localStorage if not authenticated
            setCapturedIds(new Set(getCaptured().map(c => c.id)));
          }
        } else {
          // No token - use localStorage
          setCapturedIds(new Set(getCaptured().map(c => c.id)));
        }
      } catch (err) {
        console.error('Failed to load captures:', err);
        // Fallback to localStorage on error
        setCapturedIds(new Set(getCaptured().map(c => c.id)));
      }
    }

    loadCaptures();
  }, []);

  // Request location permission
  async function requestLocationPermission() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported on this device');
      return;
    }

    try {
      // Request location once to trigger permission prompt
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermissionGranted(true);
          setLocationError(null);
        },
        (error) => {
          setLocationError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000
        }
      );
    } catch {
      setLocationError('Failed to request location permission');
    }
  }

  // Get user location (only after permission granted)
  useEffect(() => {
    if (!locationPermissionGranted || !navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationPermissionGranted]);

  // Get device orientation (compass)
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        // alpha is the compass heading (0-360 degrees)
        // We need to invert it because CSS rotate goes clockwise, but compass goes counter-clockwise
        // Also, 0 degrees should point North (up)
        const compassHeading = 360 - event.alpha;
        setHeading(compassHeading);
      }
    };

    // Request permission for iOS 13+
    const DeviceOrientationEventTyped = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientationEventTyped.requestPermission === 'function') {
      DeviceOrientationEventTyped.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      // Non-iOS or older devices
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Calculate nearest spawn
  useEffect(() => {
    if (!userLocation || spawns.length === 0) return;

    const distances = spawns
      .filter(spawn => !capturedIds.has(spawn.id))
      .map(spawn => ({
        spawn,
        distance: haversineDistance(
          userLocation.lat,
          userLocation.lng,
          spawn.lat,
          spawn.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance);

    if (distances.length > 0) {
      setNearestSpawn(distances[0]);
    }
  }, [userLocation, spawns, capturedIds]);

  return (
    <div className={styles.fullscreenContainer}>
      {/* Back button at top */}
      <div className={styles.topBar}>
        <Button
          onClick={() => router.push('/game')}
          variant="ghost"
          size="sm"
          className={styles.backButton}
        >
          ← BACK
        </Button>
      </div>

      {/* Fullscreen Map */}
      {locationError && (
        <div className={styles.error}>
          <p>📍 Location Error</p>
          <p className={styles.errorText}>{locationError}</p>
          <p className={styles.hint}>Please enable location permissions</p>
        </div>
      )}

      {!userLocation && !locationError && !locationPermissionGranted && (
        <div className={styles.loading}>
          <p>📍 Location access required</p>
          <Button onClick={requestLocationPermission} size="lg">
            Enable Location
          </Button>
        </div>
      )}

      {!userLocation && !locationError && locationPermissionGranted && (
        <div className={styles.loading}>
          <p>📍 Getting your location...</p>
        </div>
      )}

      {userLocation && (
        <>
          <div className={styles.fullscreenMapContainer}>
            <PixelMap
              center={[userLocation.lat, userLocation.lng]}
              zoom={14}
              heading={heading}
              markers={spawns.map(spawn => {
                const distance = haversineDistance(
                  userLocation.lat,
                  userLocation.lng,
                  spawn.lat,
                  spawn.lng
                );
                const captured = capturedIds.has(spawn.id);
                return {
                  id: spawn.id,
                  position: [spawn.lat, spawn.lng] as [number, number],
                  spriteUrl: captured ? spawn.capturedImg : spawn.img,
                  inRange: distance <= spawn.radius,
                  captured,
                };
              })}
              className={styles.pixelMap}
            />
          </div>

          {/* Proximity Indicator - shows distance and direction to nearest waifu */}
          {nearestSpawn && (() => {
            // Calculate bearing to waifu
            const bearingToWaifu = calculateBearing(
              userLocation.lat,
              userLocation.lng,
              nearestSpawn.spawn.lat,
              nearestSpawn.spawn.lng
            );

            // Calculate relative bearing (direction relative to where user is facing)
            const relativeBearing = (bearingToWaifu - heading + 360) % 360;
            const directionArrow = getDirectionArrow(relativeBearing);

            return (
              <div className={`${styles.proximityIndicator} ${nearestSpawn.distance <= nearestSpawn.spawn.radius ? styles.proximityInRange : ''}`}>
                <div className={styles.proximityArrow}>{directionArrow}</div>
                <div className={styles.proximityDistance}>
                  {formatDistance(nearestSpawn.distance)}
                </div>
                <div className={styles.proximityName}>
                  {nearestSpawn.spawn.emoji} {nearestSpawn.spawn.name}
                </div>
              </div>
            );
          })()}

          {/* Bottom Controls */}
          <div className={styles.bottomControls}>
            <Button
              onClick={() => setShowWaifuList(!showWaifuList)}
              variant="secondary"
              size="lg"
              className={styles.controlButton}
            >
              📋 WAIFUS ({spawns.length})
            </Button>

            {nearestSpawn && nearestSpawn.distance <= nearestSpawn.spawn.radius && (
              <Button
                onClick={() => router.push('/game/charm/hunt')}
                size="lg"
                className={styles.controlButton}
              >
                💖 START CHARMING
              </Button>
            )}
          </div>

          {/* Sliding Waifu List */}
          {showWaifuList && (
            <div className={styles.waifuListOverlay}>
              <div className={styles.waifuListPanel}>
                <div className={styles.listHeader}>
                  <h2 className={styles.listTitle}>✧ NEARBY WAIFUS ✧</h2>
                  <button
                    className={styles.closeButton}
                    onClick={() => setShowWaifuList(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.waifuListContent}>
                  {spawns.map(spawn => {
                    const distance = haversineDistance(
                      userLocation.lat,
                      userLocation.lng,
                      spawn.lat,
                      spawn.lng
                    );
                    const captured = capturedIds.has(spawn.id);
                    const inRange = distance <= spawn.radius;

                    return (
                      <div
                        key={spawn.id}
                        className={`${styles.waifuListItem} ${captured ? styles.itemCaptured : ''} ${inRange ? styles.itemInRange : ''}`}
                      >
                        <div className={styles.itemEmoji}>{spawn.emoji}</div>
                        <div className={styles.itemInfo}>
                          <div className={styles.itemName}>{spawn.name}</div>
                          <div className={styles.itemRarity}>{spawn.rarity}</div>
                        </div>
                        <div className={styles.itemDistance}>
                          {formatDistance(distance)}
                        </div>
                        {captured && <div className={styles.itemBadge}>CAPTURED</div>}
                        {inRange && !captured && <div className={styles.itemBadgeGreen}>IN RANGE</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

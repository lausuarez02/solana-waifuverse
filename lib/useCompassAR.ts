import { useEffect, useMemo, useRef, useState } from "react";
import { haversineMeters, bearingDeg, relAngleDeg } from "./geo";

type LatLng = { lat: number; lng: number };
type Spawn = { id: string; name: string; lat: number; lng: number; radius: number; img: string; emoji: string };

export function useCompassAR(spawn: Spawn | null, fov = 65) {
  const [me, setMe] = useState<LatLng | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [pitch, setPitch] = useState<number>(0);
  const gotOrientationRef = useRef(false);
  const [useTestLocation, setUseTestLocation] = useState(false);

  // GEO
  useEffect(() => {
    console.log('🌍 Starting GPS watch...');

    // Set timeout to use test location if GPS doesn't work after 2 seconds
    const fallbackTimer = setTimeout(() => {
      if (!me && spawn) {
        console.warn('⚠️ GPS timeout - using test location near spawn');
        // Place user 100 meters from spawn for testing
        const testLat = spawn.lat + 0.0007; // ~77 meters north
        const testLng = spawn.lng + 0.0007;
        setMe({ lat: testLat, lng: testLng });
        setUseTestLocation(true);
      }
    }, 2000);

    const watch = navigator.geolocation.watchPosition(
      p => {
        console.log('✅ GPS position received:', p.coords.latitude, p.coords.longitude);
        clearTimeout(fallbackTimer);
        setMe({ lat: p.coords.latitude, lng: p.coords.longitude });
        setUseTestLocation(false);
      },
      e => {
        console.error("❌ GPS error:", e.code, e.message);
        if (e.code === 1) console.error("GPS permission denied");
        if (e.code === 2) console.error("GPS position unavailable");
        if (e.code === 3) console.error("GPS timeout");
      },
      { enableHighAccuracy: true, maximumAge: 1500, timeout: 8000 }
    );

    return () => {
      clearTimeout(fallbackTimer);
      navigator.geolocation.clearWatch(watch);
    };
  }, [spawn, me]);

  // COMPASS (ask on user tap)
  async function requestOrientationPermission() {
    console.log('=== useCompassAR: requestOrientationPermission START ===');
    console.log('DeviceOrientationEvent exists:', typeof DeviceOrientationEvent !== 'undefined');
    console.log('DeviceOrientationEvent:', DeviceOrientationEvent);

    const hasRequestPermission = typeof (DeviceOrientationEvent as any)?.requestPermission === "function";
    console.log('DeviceOrientationEvent.requestPermission exists:', hasRequestPermission);

    // iOS 13+ requires gesture + explicit permission call
    if (hasRequestPermission) {
      console.log('🍎 iOS 13+ detected - requesting DeviceOrientation permission');
      try {
        console.log('📱 Calling DeviceOrientationEvent.requestPermission()...');
        const res = await (DeviceOrientationEvent as any).requestPermission();
        console.log('📱 DeviceOrientation permission result:', res);
        if (res !== "granted") {
          console.error('❌ DeviceOrientation permission denied, result was:', res);
          alert('Compass permission denied. Please allow motion & orientation access in Settings > Safari > Motion & Orientation Access');
          return false;
        }
        console.log('✅ DeviceOrientation permission GRANTED!');
      } catch (err) {
        console.error('❌ Error requesting DeviceOrientation permission:', err);
        console.error('Error name:', err instanceof Error ? err.name : 'unknown');
        console.error('Error message:', err instanceof Error ? err.message : 'unknown');
        alert('Error requesting compass permission: ' + (err instanceof Error ? err.message : 'Unknown error'));
        return false;
      }
    } else {
      console.log('ℹ️ Not iOS 13+ or no permission API needed');
      console.log('Permission API might be auto-granted or not required on this device/browser');
    }

    if (gotOrientationRef.current) {
      console.log('Orientation listener already set up');
      return true;
    }

    console.log('Setting up deviceorientation listener');
    console.log('window.DeviceOrientationEvent exists:', 'DeviceOrientationEvent' in window);
    console.log('window.ondeviceorientation:', typeof window.ondeviceorientation);

    let eventCount = 0;
    const handler = (e: DeviceOrientationEvent) => {
      eventCount++;
      if (eventCount <= 5) {
        console.log(`✅ DeviceOrientation event #${eventCount} received:`, {
          alpha: e.alpha,
          beta: e.beta,
          gamma: e.gamma,
          absolute: e.absolute
        });
      }
      // e.alpha: 0..360 (degrees from north); may be null on desktop
      // Handle both null and actual values
      if (e.alpha !== null && typeof e.alpha === "number") {
        const newHeading = 360 - e.alpha;
        console.log('Setting heading to:', newHeading);
        setHeading(newHeading); // normalize to compass heading
      } else if (e.alpha === null && eventCount === 1) {
        console.warn('First event has null alpha - device might not have compass');
        // Set default so user can still see
        setHeading(0);
      }
      if (e.beta !== null && typeof e.beta === "number") {
        setPitch(e.beta); // -180..180 (tilt forward/back)
      }
    };

    // Try multiple ways to register the listener
    console.log('Registering deviceorientation listeners...');
    window.addEventListener("deviceorientation", handler, true);
    window.addEventListener("deviceorientation", handler, false); // Try without capture too
    window.addEventListener("deviceorientationabsolute", handler, true);

    // Also try the property assignment method
    window.ondeviceorientation = (e) => {
      console.log('ondeviceorientation property handler fired!');
      handler(e);
    };

    gotOrientationRef.current = true;
    console.log('All orientation listeners registered');

    // Fallback: if no orientation data after 2 seconds, set default heading
    setTimeout(() => {
      if (eventCount === 0) {
        console.error('❌ NO DeviceOrientation events received after 2s!');
        console.log('Browser/device might not support compass or needs different approach');
        // Set a default heading so user can at least see the waifu
        console.log('Setting fallback heading to 0');
        setHeading(0); // Point north by default
      } else {
        console.log(`✅ Received ${eventCount} orientation events - working!`);
      }
    }, 2000);

    console.log('=== useCompassAR: requestOrientationPermission END ===');
    return true;
  }

  // Derived
  const distance = useMemo(() => (me && spawn) ? haversineMeters(me, spawn) : Infinity, [me, spawn]);
  const bearing = useMemo(() => (me && spawn) ? bearingDeg(me, spawn) : null, [me, spawn]);
  const relAngle = useMemo(() => (bearing != null && heading != null) ? relAngleDeg(bearing, heading) : null, [bearing, heading]);

  const visible = useMemo(() => {
    if (relAngle == null) return false;
    return Math.abs(relAngle) <= fov / 2;
  }, [relAngle, fov]);

  const screen = useMemo(() => {
    if (relAngle == null) return { x: null, y: null, scale: 1 };
    const xNorm = (relAngle / (fov / 2)) * 0.5; // -0.5..0.5
    const x = (0.5 + xNorm) * window.innerWidth; // px
    // approximate vertical by pitch (optional)
    const pitchClamped = Math.max(-60, Math.min(60, pitch));
    const y = (0.5 - pitchClamped / 120) * window.innerHeight; // center-ish
    // distance-based scale
    const k = 45; // tweak feel
    const s = Math.max(0.45, Math.min(1, k / ((distance || 9999) + k)));
    return { x, y, scale: s };
  }, [relAngle, pitch, distance, fov]);

  const inRadius = (spawn ? distance <= spawn.radius : false);

  return {
    me,
    heading,
    distance,
    bearing,
    relAngle,
    visible,
    screen,
    inRadius,
    requestOrientationPermission,
    usingTestLocation: useTestLocation
  };
}

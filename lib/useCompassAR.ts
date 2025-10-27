import { useEffect, useMemo, useRef, useState } from "react";
import { haversineMeters, bearingDeg, relAngleDeg } from "./geo";

type LatLng = { lat: number; lng: number };
type Spawn = { id: string; name: string; lat: number; lng: number; radius: number; img: string; emoji: string };

export function useCompassAR(spawn: Spawn | null, fov = 65) {
  const [me, setMe] = useState<LatLng | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [pitch, setPitch] = useState<number>(0);
  const gotOrientationRef = useRef(false);

  // GEO
  useEffect(() => {
    const watch = navigator.geolocation.watchPosition(
      p => setMe({ lat: p.coords.latitude, lng: p.coords.longitude }),
      e => console.warn("geo", e),
      { enableHighAccuracy: true, maximumAge: 1500, timeout: 8000 }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  // COMPASS (ask on user tap)
  async function requestOrientationPermission() {
    // iOS requires gesture + explicit permission call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === "function") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res !== "granted") return false;
    }
    if (gotOrientationRef.current) return true;

    const handler = (e: DeviceOrientationEvent) => {
      // e.alpha: 0..360 (degrees from north); may be null on desktop
      if (typeof e.alpha === "number") {
        setHeading(360 - e.alpha); // normalize to compass heading
      }
      if (typeof e.beta === "number") {
        setPitch(e.beta); // -180..180 (tilt forward/back)
      }
    };

    window.addEventListener("deviceorientation", handler, true);
    gotOrientationRef.current = true;
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
    requestOrientationPermission
  };
}

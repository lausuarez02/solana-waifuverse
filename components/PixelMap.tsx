"use client";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import * as React from "react";

interface PixelMapProps {
  center: [number, number];
  zoom?: number;
  heading?: number; // Device compass heading in degrees
  markers?: Array<{
    id: string;
    position: [number, number];
    spriteUrl: string; // The sprite image path
    inRange?: boolean;
    captured?: boolean;
  }>;
  className?: string;
}

// Removed decorative objects for performance optimization

// Location drop pin icon for waifu markers
function createWaifuSpriteIcon(spriteUrl: string, inRange?: boolean, captured?: boolean) {
  const glowColor = captured ? 'rgba(241, 91, 181, 0.6)' : inRange ? 'rgba(0, 255, 0, 0.8)' : 'rgba(241, 91, 181, 0.8)';
  const opacity = captured ? '0.8' : '1';
  const animation = inRange && !captured ? 'pulse 1.5s infinite' : 'none';

  return L.divIcon({
    html: `
      <div style="
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        animation: ${animation};
      ">
        <img
          src="/location-drop.png"
          style="
            width: 40px;
            height: 40px;
            filter: drop-shadow(0 0 10px ${glowColor})
                    drop-shadow(0 0 20px ${glowColor});
            opacity: ${opacity};
          "
          alt="Waifu location"
        />
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      </style>
    `,
    className: '',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });
}

// Player icon with directional arrow
function createPlayerIcon(heading: number = 0) {
  return L.divIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        position: relative;
        pointer-events: none;
      ">
        <!-- Circle base -->
        <div style="
          position: absolute;
          top: 10px;
          left: 10px;
          width: 20px;
          height: 20px;
          background: #f15bb5;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(241, 91, 181, 0.8);
        "></div>
        <!-- Direction arrow -->
        <div style="
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%) rotate(${heading}deg);
          transform-origin: center 20px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 12px solid #fff;
          filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
        "></div>
      </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Removed createDecoIcon - not needed without decorative objects

// Component to update player position marker without forcing map view
// This allows users to freely pan the map while still tracking their location
function UpdatePlayerPosition({ center }: { center: [number, number] }) {
  const map = useMap();

  // Only set initial view on mount, don't force recenter on position updates
  useEffect(() => {
    // Check if this is the first time we're setting a valid position
    const currentCenter = map.getCenter();
    const isDefaultPosition = currentCenter.lat === 0 && currentCenter.lng === 0;

    if (isDefaultPosition) {
      map.setView(center);
    }
    // After initial load, we don't force recenter - user can pan freely
  }, [center, map]);

  return null;
}

export default function PixelMap({
  center,
  zoom = 15,
  heading = 0,
  markers = [],
  className = "",
}: PixelMapProps) {
  // Removed decorative objects to improve performance
  // Removed isLoading state - not needed

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Custom CSS for retro pink 8-bit map styling */}
      <style>{`
        /* Simplified retro game map - reduced filters for performance */
        .retro-game-tiles {
          filter: saturate(2) contrast(1.15);
          image-rendering: pixelated;
        }

        /* Simplified pink overlay */
        .leaflet-tile-pane::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 0, 200, 0.12);
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        /* Simplified font styling - removed heavy text-shadows */
        .leaflet-container {
          font-family: var(--font-press-start), monospace !important;
          font-size: 9px !important;
        }

        /* Simplified controls */
        .leaflet-control-attribution {
          font-size: 6px !important;
          background: rgba(0, 0, 0, 0.7) !important;
          color: #fff !important;
        }

        .leaflet-control-zoom a {
          background: #f15bb5 !important;
          color: white !important;
        }
      `}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className={className}
        style={{ width: "100%", height: "100%", minHeight: "600px" }}
        zoomControl={true}
        preferCanvas={true}
      >
        <UpdatePlayerPosition center={center} />

        {/* Single layer approach - OSM with custom CSS filter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={12}
          tileSize={256}
          updateWhenZooming={false}
          updateWhenIdle={true}
          keepBuffer={2}
          className="retro-game-tiles"
        />

        {/* Removed decorative objects for better performance */}

        {/* Player marker with directional arrow */}
        <Marker position={center} icon={createPlayerIcon(heading)} key={`player-${heading}`} />

        {/* Waifu markers - using actual 8-bit sprites */}
        {markers.map((marker) => (
          <div key={marker.id}>
            <Marker
              position={marker.position}
              icon={createWaifuSpriteIcon(
                marker.spriteUrl, // Use the actual sprite path
                marker.inRange,
                marker.captured
              )}
            />
            {marker.inRange && !marker.captured && (
              <Circle
                center={marker.position}
                radius={50}
                pathOptions={{
                  color: "#00ff00",
                  fillColor: "#00ff00",
                  fillOpacity: 0.2,
                  weight: 3,
                }}
              />
            )}
          </div>
        ))}
      </MapContainer>
    </div>
  );
}

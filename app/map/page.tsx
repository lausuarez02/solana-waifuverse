"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/8bit/button";

export default function MapPage() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const locations = [
    { id: "cherry-blossom", name: "Cherry Blossom Garden", color: "bg-pink-600" },
    { id: "neon-city", name: "Neon City", color: "bg-purple-600" },
    { id: "mystical-shrine", name: "Mystical Shrine", color: "bg-blue-600" },
    { id: "pixel-beach", name: "Pixel Beach", color: "bg-cyan-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ textShadow: "4px 4px 0px rgba(0,0,0,0.5)" }}>
            WAIFUVERSE MAP
          </h1>
          <p className="text-white/80">
            Welcome, Traveler! Choose your destination
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {locations.map((location) => (
            <div
              key={location.id}
              className={`${location.color} p-6 rounded-lg border-4 border-white shadow-lg cursor-pointer transform transition-transform hover:scale-105 ${
                selectedLocation === location.id ? "ring-4 ring-yellow-400" : ""
              }`}
              onClick={() => setSelectedLocation(location.id)}
            >
              <div className="bg-white/20 p-4 rounded mb-4 h-32 flex items-center justify-center">
                <span className="text-6xl">🎮</span>
              </div>
              <h3 className="text-xl font-bold text-white text-center">
                {location.name}
              </h3>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/")}
            className="flex-1"
            font="retro"
            size="lg"
            variant="outline"
          >
            ← BACK TO HOME
          </Button>
          <Button
            onClick={() => {
              if (selectedLocation) {
                alert(`Traveling to ${locations.find(l => l.id === selectedLocation)?.name}...`);
              } else {
                alert("Please select a location first!");
              }
            }}
            className="flex-1"
            font="retro"
            size="lg"
            disabled={!selectedLocation}
          >
            TRAVEL →
          </Button>
        </div>

        <div className="mt-8 bg-black/40 p-6 rounded-lg border-2 border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Your Collection</h2>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 rounded p-4 text-center">
                <div className="text-4xl mb-2">❓</div>
                <p className="text-white/60 text-sm">Locked</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

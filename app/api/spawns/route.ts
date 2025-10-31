import { NextResponse } from 'next/server';
import { db, type WaifuSpawn } from '@/lib/supabase-db';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// Initialize spawn data with supply limits and time windows
// This runs once to set up the spawns
async function initializeSpawnsIfNeeded() {
  const existing = await db.getSpawns();

  if (existing.length === 0) {
    // Calculate time windows (7 days from now for testing)
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const initialSpawns: WaifuSpawn[] = [
      {
        id: "w1",
        name: "Sakura (Sol)", // Updated name to match contract
        lat: -34.6037,
        lng: -58.3816,
        radius: 50000, // 50km radius for testing
        img: "/waifus/waifu00/waifus_00.png",
        capturedImg: "/waifus/waifu00/waifus_00_captured.png",
        rarity: "common",
        emoji: "🌸",
        max_supply: 1000, // Max 1000 mints (matches contract)
        current_supply: 0,
        spawn_start: now.toISOString(),
        spawn_end: sevenDaysLater.toISOString(),
        price: String(0.1 * LAMPORTS_PER_SOL), // 0.1 SOL in lamports (matches contract)
        contract_token_id: 1 // Contract uses ID 1 for Sol waifu (important: contract is 1-indexed!)
      },
      {
        id: "w2",
        name: "Luna",
        lat: -40.158595,
        lng: -71.352592,
        radius: 50000,
        img: "/waifus/waifu00/waifus_00.png",
        capturedImg: "/waifus/waifu00/waifus_00_captured.png",
        rarity: "rare",
        emoji: "🌙",
        max_supply: 50, // Max 50 mints (rarer)
        current_supply: 0,
        spawn_start: now.toISOString(),
        spawn_end: sevenDaysLater.toISOString(),
        price: String(0.15 * LAMPORTS_PER_SOL), // 0.15 SOL
        contract_token_id: 2 // Waifu ID 2 in contract (add this waifu to contract!)
      },
      {
        id: "w3",
        name: "Yuki",
        lat: -34.6037,
        lng: -58.3816,
        radius: 50000,
        img: "/waifus/waifu00/waifus_00.png",
        capturedImg: "/waifus/waifu00/waifus_00_captured.png",
        rarity: "epic",
        emoji: "❄️",
        max_supply: 25, // Max 25 mints (very rare)
        current_supply: 0,
        spawn_start: now.toISOString(),
        spawn_end: sevenDaysLater.toISOString(),
        price: String(0.2 * LAMPORTS_PER_SOL), // 0.2 SOL
        contract_token_id: 3 // Waifu ID 3 in contract (add this waifu to contract!)
      },
      {
        id: "w4",
        name: "Hana",
        lat: -34.842535,
        lng: -58.282251,
        radius: 50000,
        img: "/waifus/waifu00/waifus_00.png",
        capturedImg: "/waifus/waifu00/waifus_00_captured.png",
        rarity: "common",
        emoji: "🌺",
        max_supply: 100,
        current_supply: 0,
        spawn_start: now.toISOString(),
        spawn_end: sevenDaysLater.toISOString(),
        price: String(0.1 * LAMPORTS_PER_SOL), // 0.1 SOL
        contract_token_id: 4 // Waifu ID 4 in contract (add this waifu to contract!)
      }
    ];

    await db.initializeSpawns(initialSpawns);
  }
}

export async function GET(request: Request) {
  // Initialize spawns on first request
  await initializeSpawnsIfNeeded();

  // Check if the request wants all spawns or just active ones
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get('includeInactive') === 'true';

  // Return only active spawns by default (for map view)
  // or all spawns if includeInactive=true (for collection view)
  const spawns = includeInactive
    ? await db.getSpawns()
    : await db.getActiveSpawns();

  return NextResponse.json(spawns);
}

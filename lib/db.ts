import fs from 'fs/promises';
import path from 'path';

// Simple file-based storage for development
// Replace with real database (PostgreSQL, MongoDB, etc) in production

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read JSON file
async function readJSON<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

// Write JSON file
async function writeJSON<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// Data structures
export interface PlayerWallet {
  fid: number;
  walletAddress: string;
  createdAt: string;
}

export interface WaifuCapture {
  fid: number;
  waifuId: string;
  capturedAt: string;
}

export interface MintedWaifu {
  fid: number;
  waifuId: string;
  tokenId?: number;
  txHash?: string;
  mintedAt: string;
}

export interface PendingMint {
  fid: number;
  waifuId: string;
  signature: string;
  createdAt: string;
}

export interface WaifuSpawn {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  img: string;
  capturedImg: string;
  rarity: string;
  emoji: string;
  maxSupply: number; // Total mints allowed
  currentSupply: number; // Already minted
  spawnStart: string; // ISO timestamp
  spawnEnd: string; // ISO timestamp
  price: string; // In ETH
}

// Database operations
export const db = {
  // Player Wallets
  async getPlayerWallet(fid: number): Promise<PlayerWallet | null> {
    const wallets = await readJSON<PlayerWallet[]>('player_wallets.json', []);
    return wallets.find(w => w.fid === fid) || null;
  },

  async savePlayerWallet(wallet: PlayerWallet): Promise<void> {
    const wallets = await readJSON<PlayerWallet[]>('player_wallets.json', []);
    const existing = wallets.findIndex(w => w.fid === wallet.fid);
    if (existing >= 0) {
      wallets[existing] = wallet;
    } else {
      wallets.push(wallet);
    }
    await writeJSON('player_wallets.json', wallets);
  },

  // Waifu Captures
  async getCaptures(fid: number): Promise<WaifuCapture[]> {
    const captures = await readJSON<WaifuCapture[]>('waifu_captures.json', []);
    return captures.filter(c => c.fid === fid);
  },

  async hasCapture(fid: number, waifuId: string): Promise<boolean> {
    const captures = await this.getCaptures(fid);
    return captures.some(c => c.waifuId === waifuId);
  },

  async saveCapture(capture: WaifuCapture): Promise<void> {
    const captures = await readJSON<WaifuCapture[]>('waifu_captures.json', []);
    const exists = captures.some(c => c.fid === capture.fid && c.waifuId === capture.waifuId);
    if (!exists) {
      captures.push(capture);
      await writeJSON('waifu_captures.json', captures);
    }
  },

  // Minted Waifus
  async getMints(fid: number): Promise<MintedWaifu[]> {
    const mints = await readJSON<MintedWaifu[]>('minted_waifus.json', []);
    return mints.filter(m => m.fid === fid);
  },

  async hasMinted(fid: number, waifuId: string): Promise<boolean> {
    const mints = await this.getMints(fid);
    return mints.some(m => m.waifuId === waifuId);
  },

  async saveMint(mint: MintedWaifu): Promise<void> {
    const mints = await readJSON<MintedWaifu[]>('minted_waifus.json', []);
    const exists = mints.some(m => m.fid === mint.fid && m.waifuId === mint.waifuId);
    if (!exists) {
      mints.push(mint);
      await writeJSON('minted_waifus.json', mints);
    }
  },

  // Pending Mints
  async savePendingMint(pending: PendingMint): Promise<void> {
    const pendings = await readJSON<PendingMint[]>('pending_mints.json', []);
    const existing = pendings.findIndex(p => p.fid === pending.fid && p.waifuId === pending.waifuId);
    if (existing >= 0) {
      pendings[existing] = pending;
    } else {
      pendings.push(pending);
    }
    await writeJSON('pending_mints.json', pendings);
  },

  // Waifu Spawns
  async getSpawns(): Promise<WaifuSpawn[]> {
    return await readJSON<WaifuSpawn[]>('waifu_spawns.json', []);
  },

  async getActiveSpawns(): Promise<WaifuSpawn[]> {
    const spawns = await this.getSpawns();
    const now = new Date();

    return spawns.filter(spawn => {
      const start = new Date(spawn.spawnStart);
      const end = new Date(spawn.spawnEnd);
      const isInTimeWindow = now >= start && now <= end;
      const hasSupply = spawn.currentSupply < spawn.maxSupply;

      return isInTimeWindow && hasSupply;
    });
  },

  async getSpawnById(id: string): Promise<WaifuSpawn | null> {
    const spawns = await this.getSpawns();
    return spawns.find(s => s.id === id) || null;
  },

  async incrementSpawnSupply(id: string): Promise<void> {
    const spawns = await this.getSpawns();
    const spawn = spawns.find(s => s.id === id);
    if (spawn) {
      spawn.currentSupply++;
      await writeJSON('waifu_spawns.json', spawns);
    }
  },

  async initializeSpawns(spawns: WaifuSpawn[]): Promise<void> {
    await writeJSON('waifu_spawns.json', spawns);
  }
};

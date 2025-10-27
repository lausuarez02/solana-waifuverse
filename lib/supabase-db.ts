import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseKey);

// Data structures
export interface PlayerWallet {
  fid: number;
  wallet_address: string;
  created_at?: string;
}

export interface WaifuCapture {
  fid: number;
  waifu_id: string;
  captured_at?: string;
}

export interface MintedWaifu {
  fid: number;
  waifu_id: string;
  token_id?: number;
  tx_hash?: string;
  minted_at?: string;
}

export interface PendingMint {
  fid: number;
  waifu_id: string;
  signature: string;
  created_at?: string;
}

export interface WaifuSpawn {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  img: string;
  capturedImg: string; // Using camelCase to match existing code
  rarity: string;
  emoji: string;
  max_supply: number;
  current_supply: number;
  spawn_start: string;
  spawn_end: string;
  price: string;
  contract_token_id: number; // The token ID used in the smart contract
}

export const db = {
  // Player Wallets
  async getPlayerWallet(fid: number): Promise<PlayerWallet | null> {
    const { data, error } = await supabase
      .from('player_wallets')
      .select('*')
      .eq('fid', fid)
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }
    return data;
  },

  async savePlayerWallet(wallet: PlayerWallet): Promise<void> {
    const { error } = await supabase
      .from('player_wallets')
      .upsert({
        fid: wallet.fid,
        wallet_address: wallet.wallet_address,
        created_at: wallet.created_at || new Date().toISOString()
      }, {
        onConflict: 'fid'
      });

    if (error) {
      console.error('Error saving wallet:', error);
      throw error;
    }
  },

  // Waifu Captures
  async getCaptures(fid: number): Promise<WaifuCapture[]> {
    const { data, error } = await supabase
      .from('waifu_captures')
      .select('*')
      .eq('fid', fid);

    if (error) {
      console.error('Error fetching captures:', error);
      return [];
    }
    return data || [];
  },

  async hasCapture(fid: number, waifuId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('waifu_captures')
      .select('id')
      .eq('fid', fid)
      .eq('waifu_id', waifuId)
      .single();

    return !error && !!data;
  },

  async saveCapture(capture: WaifuCapture): Promise<void> {
    const { error } = await supabase
      .from('waifu_captures')
      .upsert({
        fid: capture.fid,
        waifu_id: capture.waifu_id,
        captured_at: capture.captured_at || new Date().toISOString()
      }, {
        onConflict: 'fid,waifu_id',
        ignoreDuplicates: true
      });

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      console.error('Error saving capture:', error);
      throw error;
    }
  },

  // Minted Waifus
  async getMints(fid: number): Promise<MintedWaifu[]> {
    const { data, error } = await supabase
      .from('minted_waifus')
      .select('*')
      .eq('fid', fid);

    if (error) {
      console.error('Error fetching mints:', error);
      return [];
    }
    return data || [];
  },

  async hasMinted(fid: number, waifuId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('minted_waifus')
      .select('id')
      .eq('fid', fid)
      .eq('waifu_id', waifuId)
      .single();

    return !error && !!data;
  },

  async saveMint(mint: MintedWaifu): Promise<void> {
    const { error } = await supabase
      .from('minted_waifus')
      .upsert({
        fid: mint.fid,
        waifu_id: mint.waifu_id,
        token_id: mint.token_id,
        tx_hash: mint.tx_hash,
        minted_at: mint.minted_at || new Date().toISOString()
      }, {
        onConflict: 'fid,waifu_id',
        ignoreDuplicates: true
      });

    if (error && error.code !== '23505') {
      console.error('Error saving mint:', error);
      throw error;
    }
  },

  // Pending Mints
  async savePendingMint(pending: PendingMint): Promise<void> {
    const { error } = await supabase
      .from('pending_mints')
      .upsert({
        fid: pending.fid,
        waifu_id: pending.waifu_id,
        signature: pending.signature,
        created_at: pending.created_at || new Date().toISOString()
      }, {
        onConflict: 'fid,waifu_id'
      });

    if (error) {
      console.error('Error saving pending mint:', error);
      throw error;
    }
  },

  // Waifu Spawns
  async getSpawns(): Promise<WaifuSpawn[]> {
    const { data, error } = await supabase
      .from('waifu_spawns')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching spawns:', error);
      return [];
    }

    // Convert snake_case to camelCase
    return (data || []).map((spawn) => ({
      ...spawn,
      capturedImg: spawn.captured_img
    }));
  },

  async getActiveSpawns(): Promise<WaifuSpawn[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('waifu_spawns')
      .select('*')
      .lte('spawn_start', now)
      .gte('spawn_end', now)
      .order('id');

    if (error) {
      console.error('Error fetching active spawns:', error);
      return [];
    }

    // Convert snake_case to camelCase and filter by supply
    const spawns = (data || []).map((spawn) => ({
      ...spawn,
      capturedImg: spawn.captured_img
    }));

    return spawns.filter(spawn => spawn.current_supply < spawn.max_supply);
  },

  async getSpawnById(id: string): Promise<WaifuSpawn | null> {
    const { data, error } = await supabase
      .from('waifu_spawns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching spawn:', error);
      return null;
    }

    // Convert snake_case to camelCase
    return data ? {
      ...data,
      capturedImg: data.captured_img
    } : null;
  },

  async incrementSpawnSupply(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_spawn_supply', { spawn_id: id });

    if (error) {
      console.error('Error incrementing supply:', error);
      throw error;
    }
  },

  async initializeSpawns(spawns: WaifuSpawn[]): Promise<void> {
    // Match exact database column names from schema
    const dbSpawns = spawns.map(spawn => ({
      id: spawn.id,
      name: spawn.name,
      lat: spawn.lat,
      lng: spawn.lng,
      radius: spawn.radius,
      img: spawn.img,
      capturedimg: spawn.capturedImg || spawn.img, // Database column: capturedimg (all lowercase)
      captured_img: spawn.capturedImg || spawn.img, // Also set this one
      rarity: spawn.rarity,
      emoji: spawn.emoji,
      max_supply: spawn.max_supply,
      current_supply: spawn.current_supply,
      spawn_start: spawn.spawn_start,
      spawn_end: spawn.spawn_end,
      price: spawn.price,
      contract_token_id: spawn.contract_token_id
    }));

    const { error } = await supabase
      .from('waifu_spawns')
      .upsert(dbSpawns, {
        onConflict: 'id',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('Error initializing spawns:', error);
      throw error;
    }
  }
};

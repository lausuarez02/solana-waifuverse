/**
 * Solana Waifu Mint Contract Utility Library
 *
 * This file contains helper functions for interacting with the Waifu Mint Solana program.
 * Program ID: GQaqDnGCnWCCJcx3sXYgXzVN678Aw1jPWWqYBD4esbVW (Devnet)
 *
 * PDAs (Program Derived Addresses):
 * - Game State: Derived from ["game_state"]
 * - Waifu: Derived from ["waifu", waifuId]
 * - Token Data: Derived from ["token_data", nftMint] (if implemented)
 */

import { Connection, PublicKey, Keypair, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';
import * as crypto from 'crypto';

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

/**
 * Get the Solana program ID from environment variables
 */
export function getProgramId(): PublicKey {
  const programId = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID;
  if (!programId) {
    throw new Error('NEXT_PUBLIC_SOLANA_PROGRAM_ID is not configured');
  }
  return new PublicKey(programId);
}

/**
 * Get the RPC connection
 */
export function getConnection(): Connection {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  return new Connection(rpcUrl, 'confirmed');
}

/**
 * Get the network name (for explorer links)
 */
export function getNetworkName(): 'mainnet-beta' | 'testnet' | 'devnet' {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
  if (network === 'mainnet-beta' || network === 'testnet' || network === 'devnet') {
    return network;
  }
  return 'devnet'; // Default to devnet
}

// ============================================
// ANCHOR HELPERS
// ============================================

/**
 * Get Anchor instruction discriminator
 * Anchor uses SHA256 hash of "global:{instruction_name}"
 */
function getDiscriminator(name: string): Buffer {
  const hash = crypto.createHash('sha256')
    .update(`global:${name}`)
    .digest();
  return hash.slice(0, 8);
}

// ============================================
// PDA (PROGRAM DERIVED ADDRESS) DERIVATION
// ============================================

/**
 * Derive the Game State PDA
 * Seed: ["game_state"]
 */
export function getGameStatePDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('game_state')],
    getProgramId()
  );
}

/**
 * Derive the Waifu PDA
 * Seed: ["waifu", waifuId]
 *
 * @param waifuId - The waifu ID (on-chain token ID, usually 1, 2, 3, etc.)
 */
export function getWaifuPDA(waifuId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('waifu'), Buffer.from([waifuId])],
    getProgramId()
  );
}

/**
 * Derive the Token Data PDA (if implemented in contract)
 * Seed: ["token_data", nftMint]
 *
 * @param nftMint - The NFT mint public key
 */
export function getTokenDataPDA(nftMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('token_data'), nftMint.toBuffer()],
    getProgramId()
  );
}

// ============================================
// MINT INSTRUCTION BUILDER
// ============================================

/**
 * Build a mint instruction for the Waifu contract
 *
 * Uses Anchor's discriminator system:
 * - discriminator = first 8 bytes of SHA256("global:mint")
 * - followed by instruction arguments
 *
 * @param waifuId - The waifu ID to mint
 * @param player - The player's wallet public key
 * @param nftMint - The NFT mint keypair (should be newly generated)
 * @returns Transaction instruction
 */
export async function createMintInstruction(
  waifuId: number,
  player: PublicKey,
  nftMint: Keypair
): Promise<TransactionInstruction> {
  const programId = getProgramId();
  const [gameStatePda] = getGameStatePDA();
  const [waifuPda] = getWaifuPDA(waifuId);

  // Get the user's associated token account for the NFT
  const userTokenAccount = await getAssociatedTokenAddress(
    nftMint.publicKey,
    player
  );

  // Build instruction data with Anchor discriminator
  const discriminator = getDiscriminator('mint');
  const idBuf = Buffer.from([waifuId]);
  const instructionData = Buffer.concat([discriminator, idBuf]);

  // Build the instruction
  return new TransactionInstruction({
    keys: [
      { pubkey: gameStatePda, isSigner: false, isWritable: true },
      { pubkey: waifuPda, isSigner: false, isWritable: true },
      { pubkey: nftMint.publicKey, isSigner: true, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: player, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId,
    data: instructionData
  });
}

/**
 * Build a complete mint transaction
 *
 * This creates a transaction that calls the Waifu contract's mint instruction.
 * The contract handles:
 * - Creating the NFT mint account
 * - Initializing the mint
 * - Creating the associated token account
 * - Minting 1 token to the user
 *
 * @param waifuId - The waifu ID to mint
 * @param player - The player's wallet public key
 * @param connection - Solana connection
 * @returns Object containing the transaction and nftMint keypair
 */
export async function buildMintTransaction(
  waifuId: number,
  player: PublicKey,
  connection: Connection
): Promise<{ transaction: Transaction; nftMint: Keypair }> {
  // Generate a new keypair for the NFT mint
  const nftMint = Keypair.generate();

  // Create transaction
  const transaction = new Transaction();

  // Add the mint instruction from the Waifu contract
  // The contract handles all the SPL token setup internally
  const mintInstruction = await createMintInstruction(waifuId, player, nftMint);
  transaction.add(mintInstruction);

  // Set recent blockhash and fee payer
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = player;

  return { transaction, nftMint };
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Fetch the Game State account
 */
export async function getGameState(connection: Connection) {
  const [gameStatePda] = getGameStatePDA();
  const accountInfo = await connection.getAccountInfo(gameStatePda);

  if (!accountInfo) {
    throw new Error('Game state account not found - contract may not be initialized');
  }

  // Parse the account data based on your contract's GameState structure
  // This is a placeholder - you'll need to implement proper deserialization
  return {
    address: gameStatePda.toBase58(),
    data: accountInfo.data,
    owner: accountInfo.owner.toBase58()
  };
}

/**
 * Fetch a Waifu account
 */
export async function getWaifu(waifuId: number, connection: Connection) {
  const [waifuPda] = getWaifuPDA(waifuId);
  const accountInfo = await connection.getAccountInfo(waifuPda);

  if (!accountInfo) {
    throw new Error(`Waifu ${waifuId} not found - it may not have been added to the contract yet`);
  }

  // Parse the account data based on your contract's Waifu structure
  // This is a placeholder - you'll need to implement proper deserialization
  return {
    address: waifuPda.toBase58(),
    data: accountInfo.data,
    owner: accountInfo.owner.toBase58()
  };
}

/**
 * Get all NFTs owned by a user
 * Returns token accounts that look like NFTs (decimals = 0, amount = 1)
 */
export async function getUserWaifuNFTs(userWallet: PublicKey, connection: Connection) {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    userWallet,
    { programId: TOKEN_PROGRAM_ID }
  );

  // Filter for NFTs (decimals = 0, amount = 1)
  return tokenAccounts.value
    .filter(account => {
      const { decimals, tokenAmount } = account.account.data.parsed.info;
      return decimals === 0 && tokenAmount.uiAmount === 1;
    })
    .map(account => ({
      mint: account.account.data.parsed.info.mint,
      tokenAccount: account.pubkey.toBase58()
    }));
}

// ============================================
// EXPLORER LINKS
// ============================================

/**
 * Get Solana explorer link for a transaction
 */
export function getExplorerTxLink(signature: string): string {
  const network = getNetworkName();
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

/**
 * Get Solana explorer link for an address
 */
export function getExplorerAddressLink(address: string): string {
  const network = getNetworkName();
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/address/${address}${cluster}`;
}

/**
 * Get Solscan link for a transaction
 */
export function getSolscanTxLink(signature: string): string {
  const network = getNetworkName();
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://solscan.io/tx/${signature}${cluster}`;
}

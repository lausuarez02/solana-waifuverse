// WaifuVerse Solana Program Configuration
// This file contains the configuration for the Solana NFT minting program

import { PublicKey } from "@solana/web3.js";

// Solana Program ID (replace with your deployed program address)
// For now, using a placeholder - you'll need to deploy your Solana program
export const WAIFU_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || "11111111111111111111111111111111"
);

// Collection/Authority public key (your wallet that controls the NFTs)
export const COLLECTION_AUTHORITY = new PublicKey(
  process.env.NEXT_PUBLIC_COLLECTION_AUTHORITY || "11111111111111111111111111111111"
);

// Metaplex Token Metadata Program ID (standard for Solana NFTs)
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// Metaplex Associated Token Program
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

// System Program
export const SYSTEM_PROGRAM_ID = new PublicKey(
  "11111111111111111111111111111111"
);

// Token Program
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

// Rent Program
export const RENT_PROGRAM_ID = new PublicKey(
  "SysvarRent111111111111111111111111111111111"
);

// Instruction discriminators for your custom program
// These will be defined when you create your Solana program
export const MINT_INSTRUCTION = Buffer.from([1]); // Discriminator for mint instruction

// Helper function to derive PDA (Program Derived Address) for NFT metadata
export function getMetadataPDA(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return pda;
}

// Helper function to derive master edition PDA
export function getMasterEditionPDA(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return pda;
}

// Helper function to get associated token address
export function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return pda;
}

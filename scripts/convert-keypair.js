#!/usr/bin/env node

/**
 * Convert Solana keypair JSON to base58 format for environment variables
 *
 * Usage:
 *   node scripts/convert-keypair.js path/to/keypair.json
 *
 * Example:
 *   node scripts/convert-keypair.js game-signer.json
 */

const fs = require('fs');
const bs58 = require('bs58');

// Get the file path from command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Error: Please provide the path to the keypair JSON file');
  console.log('\nUsage:');
  console.log('  node scripts/convert-keypair.js path/to/keypair.json');
  console.log('\nExample:');
  console.log('  node scripts/convert-keypair.js game-signer.json');
  process.exit(1);
}

const keypairPath = args[0];

// Check if file exists
if (!fs.existsSync(keypairPath)) {
  console.error(`Error: File not found: ${keypairPath}`);
  process.exit(1);
}

try {
  // Read the keypair file
  const keypairData = fs.readFileSync(keypairPath, 'utf8');
  const keypairArray = JSON.parse(keypairData);

  // Validate it's an array
  if (!Array.isArray(keypairArray)) {
    console.error('Error: Keypair file should contain an array of numbers');
    process.exit(1);
  }

  // Validate it has 64 bytes (Solana ed25519 keypair)
  if (keypairArray.length !== 64) {
    console.error(`Error: Keypair should be 64 bytes, got ${keypairArray.length} bytes`);
    process.exit(1);
  }

  // Convert to Uint8Array
  const keypairBytes = new Uint8Array(keypairArray);

  // Encode to base58
  const base58Key = bs58.encode(keypairBytes);

  // Display the result
  console.log('✅ Conversion successful!\n');
  console.log('Base58 Private Key (use this in .env):');
  console.log('━'.repeat(80));
  console.log(base58Key);
  console.log('━'.repeat(80));
  console.log('\nAdd this to your .env file:');
  console.log(`GAME_SIGNER_PRIVATE_KEY=${base58Key}`);
  console.log('\n⚠️  WARNING: Keep this private key secret! Never commit it to git!');

} catch (error) {
  console.error('Error processing keypair:', error.message);
  process.exit(1);
}

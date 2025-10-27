const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
    "accountAssociation": {
      "header": "eyJmaWQiOjgzMjc4MCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweEUwYzIyMDRkOGFFNzZCNzc1YjE0QzVkNEMwNzNkMTZDNWI5QTAyOGUifQ",
      "payload": "eyJkb21haW4iOiJ3YWlmdXZlcnNlLmZ1biJ9",
      "signature": "G7170rKYIXVGdLIo4htlEG3Dc4kjGhuYTyRrjc2dQj505UDtid+qE6DmQHCl6pXrnWKFL+Gt8GYe1+usCLlBDxs="
    },
  miniapp: {
    version: "1",
    name: "WaifuVerse",
    subtitle: "Your Waifu Adventure Game",
    description: "Explore the WaifuVerse",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.jpeg`],
    iconUrl: `${ROOT_URL}/blue-icon.jpeg`,
    splashImageUrl: `${ROOT_URL}/blue-hero.jpeg`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["gaming", "nft", "collectibles", "web3"],
    heroImageUrl: `${ROOT_URL}/blue-hero.jpeg`,
    tagline: "Collect your waifus",
    ogTitle: "Your Waifu Adventure",
    ogDescription: "Explore the WaifuVerse and collect unique characters",
    ogImageUrl: `${ROOT_URL}/blue-hero.jpeg`,
  },
  "baseBuilder": {
    "ownerAddress": "0x60d3285fa2937f7D0f6941f05E9F36ac0f773808"
  }
} as const;


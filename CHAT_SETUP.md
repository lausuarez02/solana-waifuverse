# Waifu Chat Feature Setup

## Overview
Users can now chat with their minted waifus using Grok AI! Each waifu has a unique personality and responds in character.

## Setup Instructions

### 1. Get Grok API Key
1. Go to https://console.x.ai/
2. Sign up or log in with your X (Twitter) account
3. Create a new API key
4. Copy the API key

### 2. Add to Environment Variables
Add this line to your `.env.local` file:

```bash
XAI_API_KEY=your-grok-api-key-here
```

### 3. Restart Development Server
```bash
pnpm dev
```

## How It Works

### Waifu Personalities

**Sakura (🌸) - Fire Element**
- Personality: Fierce, determined, passionate warrior with a soft side for cherry blossoms
- Background: Warrior from the Land of Cherry Blossoms

**Luna (🌙) - Dark Element**
- Personality: Mysterious, wise, nocturnal guardian with a playful side
- Background: Guardian of the night with lunar magic powers

**Yuki (❄️) - Ice Element**
- Personality: Cool, elegant, powerful ice mage with a warm heart
- Background: Born in frozen peaks, commands eternal winter

**Hana (🌺) - Earth Element**
- Personality: Gentle, nurturing, nature-loving soul with healing powers
- Background: Deep connection to nature and all living things

### Chat Flow

1. User captures a waifu on the map
2. User mints the waifu as an NFT (pays gas fee)
3. **MINT button switches to CHAT button** on the waifu card
4. Click CHAT to open conversation page
5. Chat interface streams responses from Grok AI
6. Each waifu stays in character with unique personality

### API Endpoints

**POST `/api/chat`**
- Handles chat messages
- Authenticates user via JWT token
- Uses Grok-2 model via OpenAI-compatible API
- Streams responses in real-time

### Files Created

1. `/app/api/chat/route.ts` - Chat API endpoint with Grok integration
2. `/app/game/charm/chat/page.tsx` - Chat UI component
3. `/app/game/charm/chat/page.module.css` - Chat styling

### Dependencies Added

```bash
pnpm add ai @ai-sdk/openai
```

- `ai` - Vercel AI SDK for streaming chat
- `@ai-sdk/openai` - OpenAI-compatible provider (works with Grok)

## Testing

1. Capture a waifu on the map
2. Go to Collection page
3. Mint the waifu (connect wallet + pay gas)
4. After successful mint, CHAT button appears
5. Click CHAT and start conversation!

## Features

- ✅ Real-time streaming responses
- ✅ Unique personality for each waifu
- ✅ Authentication required (only minted waifu owners can chat)
- ✅ Beautiful 8-bit retro UI
- ✅ Auto-scrolling messages
- ✅ Typing indicator
- ✅ Mobile responsive

## Cost

Grok API pricing: https://x.ai/pricing
- Pay-as-you-go based on tokens used
- Very affordable for chat use cases

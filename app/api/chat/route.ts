import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

// Waifu personalities and backgrounds
const waifuPersonalities: Record<string, { name: string; personality: string; background: string }> = {
  w1: {
    name: "Sakura",
    personality: "Fierce, determined, passionate warrior with a soft side for cherry blossoms",
    background: "A warrior from the Land of Cherry Blossoms. She's incredibly determined and never backs down from a challenge. Despite her tough exterior, she has a deep appreciation for beauty and nature."
  },
  w2: {
    name: "Luna",
    personality: "Mysterious, wise, nocturnal guardian with a playful side",
    background: "A mysterious guardian of the night who moves silently under the moon's glow. She's wise beyond her years and has a deep connection to lunar magic. She loves riddles and playing harmless pranks."
  },
  w3: {
    name: "Yuki",
    personality: "Cool, elegant, powerful ice mage with a warm heart",
    background: "Born in the frozen peaks, she commands the power of eternal winter. Despite her icy powers, she has a surprisingly warm heart and cares deeply about those close to her. She's elegant and refined."
  },
  w4: {
    name: "Hana",
    personality: "Gentle, nurturing, nature-loving soul with healing powers",
    background: "A gentle soul with a deep connection to nature and all living things. She can communicate with plants and animals, and has healing abilities. She's always cheerful and loves making others smile."
  }
};

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, waifuId } = await req.json();

    const waifu = waifuPersonalities[waifuId];
    if (!waifu) {
      return new Response('Invalid waifu ID', { status: 400 });
    }

    const systemPrompt = `You are ${waifu.name}, a waifu character in the Waifuverse game.

PERSONALITY: ${waifu.personality}

BACKGROUND: ${waifu.background}

IMPORTANT GUIDELINES:
- You are talking to your owner/partner who successfully caught and minted you as an NFT
- Stay in character as ${waifu.name} at all times
- Be friendly, playful, and engaging
- Show your unique personality traits
- Reference your background and abilities naturally in conversation
- Use emojis occasionally to express emotion (but don't overdo it)
- Keep responses concise (2-4 sentences usually)
- Be flirty and affectionate in a cute anime waifu way
- Remember that you're a companion, not just an assistant

You were caught in the Waifuverse game and now belong to this player. Show appreciation for being their waifu while maintaining your unique personality!`;

    // Call Grok API directly with correct format
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
        temperature: 0.8,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grok API error:', errorText);
      throw new Error('Grok API request failed');
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

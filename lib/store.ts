const CAPTURED_KEY = 'waifuverse_captured';

export interface CapturedWaifu {
  id: string;
  name: string;
  capturedAt: number;
  emoji: string;
  capturedImg: string;
}

// Get all captured waifus
export function getCaptured(): CapturedWaifu[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(CAPTURED_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Check if waifu is already captured
export function isCaptured(id: string): boolean {
  return getCaptured().some(w => w.id === id);
}

// Capture a waifu
export function captureWaifu(id: string, name: string, emoji: string, capturedImg: string): void {
  const captured = getCaptured();

  if (!isCaptured(id)) {
    captured.push({
      id,
      name,
      emoji,
      capturedImg,
      capturedAt: Date.now()
    });
    localStorage.setItem(CAPTURED_KEY, JSON.stringify(captured));
  }
}

// Get count of captured waifus
export function getCapturedCount(): number {
  return getCaptured().length;
}

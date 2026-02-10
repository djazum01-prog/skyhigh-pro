
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function generateRandomSeed(): string {
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('');
}

/**
 * Derives a crash point from a seed. 
 * This formula is public and verifiable.
 * edge: Percentage of instant 1.00x crashes (house edge)
 */
export function deriveCrashPoint(seed: string, edge: number = 3): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const r = Math.abs(hash) % 10000;
  
  // Dynamic house edge trigger
  const edgeThreshold = edge * 100;
  if (r < edgeThreshold) return 1.00;
  
  const x = (r - edgeThreshold) / (10000 - edgeThreshold);
  return Math.max(1.00, Math.floor(100 / (1 - x)) / 100);
}

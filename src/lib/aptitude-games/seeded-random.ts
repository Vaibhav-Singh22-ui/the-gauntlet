/**
 * Deterministic Pseudo-Random Generator (Mulberry32)
 * Ensures consistent, reproducible procedural puzzle generation across client & server.
 */

export class SeededRandom {
  private s: number;

  constructor(seedStr: string) {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    this.s = h >>> 0;
  }

  // Returns float in [0, 1)
  public next(): number {
    this.s = (this.s + 0x6d2b79f5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Integer in [min, max] inclusive
  public intBetween(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Pick one random item from array
  public pick<T>(arr: T[]): T {
    const idx = Math.floor(this.next() * arr.length);
    return arr[idx];
  }

  // Shuffle array deterministically (Fisher-Yates)
  public shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

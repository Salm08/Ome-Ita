import type { Gender } from "@prisma/client";

export interface QueueUser {
  socketId: string;
  gender: Gender;
  region: string;
  stato: string;
  age?: number;
  userId?: string;
  isAdmin?: boolean;
  adminGenderFilter?: Gender | null;
  detectedGender?: Gender | null;
  preferRegionMatch?: boolean;
  mode: "video" | "text";
}

/**
 * Algoritmo di matching con bias verso uomo-uomo (~65%),
 * ma con buone probabilità per donne (~25%) e coppie (~10%).
 * Bonus regione se preferRegionMatch è attivo.
 */
export function findMatch(queue: QueueUser[], seeker: QueueUser): QueueUser | null {
  const candidates = queue.filter(
    (u) =>
      u.socketId !== seeker.socketId &&
      u.mode === seeker.mode &&
      isCompatible(seeker, u)
  );

  if (candidates.length === 0) return null;

  if (seeker.isAdmin && seeker.adminGenderFilter) {
    const filtered = candidates.filter((c) => {
      const effectiveGender = c.detectedGender || c.gender;
      return effectiveGender === seeker.adminGenderFilter;
    });
    if (filtered.length > 0) {
      return filtered[Math.floor(Math.random() * filtered.length)];
    }
    return null;
  }

  const scored = candidates.map((c) => ({
    user: c,
    score: computeMatchScore(seeker, c),
  }));

  scored.sort((a, b) => b.score - a.score);

  const topScore = scored[0].score;
  const topTier = scored.filter((s) => s.score >= topScore - 5);
  return topTier[Math.floor(Math.random() * topTier.length)].user;
}

function isCompatible(a: QueueUser, b: QueueUser): boolean {
  if (b.isAdmin && b.adminGenderFilter) {
    const aEffective = a.detectedGender || a.gender;
    return aEffective === b.adminGenderFilter;
  }
  if (a.isAdmin && a.adminGenderFilter) {
    const bEffective = b.detectedGender || b.gender;
    return bEffective === a.adminGenderFilter;
  }
  return true;
}

function computeMatchScore(seeker: QueueUser, candidate: QueueUser): number {
  let score = computeGenderScore(seeker.gender, candidate.gender);

  if (seeker.preferRegionMatch && seeker.region === candidate.region) {
    score += 20;
  }
  if (candidate.preferRegionMatch && candidate.region === seeker.region) {
    score += 10;
  }

  return score;
}

function computeGenderScore(seekerGender: Gender, candidateGender: Gender): number {
  if (seekerGender === "MALE") {
    if (candidateGender === "MALE") return 65;
    if (candidateGender === "FEMALE") return 25;
    return 10;
  }
  if (seekerGender === "FEMALE") {
    if (candidateGender === "MALE") return 50;
    if (candidateGender === "FEMALE") return 30;
    return 20;
  }
  if (candidateGender === "MALE") return 40;
  if (candidateGender === "FEMALE") return 35;
  return 25;
}

// src/lib/kyc.ts
export type KycLevels = {
  level1?: { completed: boolean };
  level2?: { completed: boolean };
  level3?: { completed: boolean };
};

export function computeCompletion(levels: any, status: string): number {
  if (!levels) return 0;

  const parsedLevels = levels as KycLevels;

  let completedCount = 0;
  let total = 3;

  if (parsedLevels.level1?.completed) completedCount++;
  if (parsedLevels.level2?.completed) completedCount++;
  if (parsedLevels.level3?.completed) completedCount++;

  let completion = (completedCount / total) * 100;

  // Cap at 95% until admin confirms
  if (completion === 100 && status !== "APPROVED") {
    completion = 95;
  }

  return completion;
}
export type KycLevels = {
  level1?: { completed: boolean };
  level2?: { completed: boolean };
  level3?: { completed: boolean };
};

export function computeCompletion(levels: KycLevels | null | undefined, status: string): number {
  if (!levels) return 0;

  const parsedLevels = levels;

  let completedCount = 0;
  const total = 3; // ✅ changed from let → const

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

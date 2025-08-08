export function calculateExerciseXp(difficulty: string): number {
  switch (difficulty) {
    case 'hard':
      return 20;
    case 'medium':
      return 15;
    default:
      return 10;
  }
}

export function calculateExerciseCoins(difficulty: string): number {
  switch (difficulty) {
    case 'hard':
      return 200;
    case 'medium':
      return 150;
    default:
      return 100;
  }
}

export function calculateLessonXp(type: string): number {
  return type === 'school_work' ? 100 : 5;
}

export function calculateExerciseListXp(difficulties: string[]): number {
  const exercisesXp = difficulties.reduce(
    (sum, diff) => sum + calculateExerciseXp(diff),
    0,
  );
  return 20 + exercisesXp;
}

export function calculateExerciseListCoins(difficulties: string[]): number {
  const exercisesXp = difficulties.reduce(
    (sum, diff) => sum + calculateExerciseXp(diff),
    0,
  );
  return 100 + exercisesXp;
}

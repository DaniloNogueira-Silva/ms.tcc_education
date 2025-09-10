import { Exercise, ExerciseType } from 'src/exercise/exercise.schema';

export function calculateExerciseXp(difficulty: string): number {
  switch (difficulty) {
    case 'hard':
      return 40;
    case 'medium':
      return 30;
    default:
      return 20;
  }
}

export function calculateBaseExerciseXp(difficulty: string): number {
  return calculateExerciseXp(difficulty) * 0.5;
}

export function calculateExerciseCoins(difficulty: string): number {
  switch (difficulty) {
    case 'hard':
      return 40;
    case 'medium':
      return 30;
    default:
      return 20;
  }
}

export function calculateBaseExerciseCoins(difficulty: string): number {
  return calculateExerciseCoins(difficulty) * 0.5;
}

export function calculateAutomaticGrade(
  exercise: Exercise,
  answer: string,
): number {
  if (exercise.type === ExerciseType.MULTIPLE_CHOICE) {
    return exercise.answer === answer ? exercise.grade || 1 : 0;
  }

  if (exercise.type === ExerciseType.TRUE_FALSE) {
    const studentAnswers: boolean[] = answer.split('').map((char) => {
      return char === 'V';
    });

    const correctAnswers = exercise.true_false_options?.map((o) => o.answer);

    if (!correctAnswers || correctAnswers.length === 0) {
      return 0;
    }

    const correctCount = correctAnswers.filter(
      (ans, idx) => studentAnswers[idx] === ans,
    ).length;

    const totalGrade = exercise.grade || 1;
    const calculatedGrade = (totalGrade * correctCount) / correctAnswers.length;

    return parseFloat(calculatedGrade.toFixed(2));
  }

  return 0;
}

export function calculateLessonXp(type: string): number {
  return type === 'school_work' ? 100 : 5;
}

export function calculateExerciseListXp(difficulties: string[]): number {
  const exercisesXp = difficulties.reduce(
    (sum, diff) => sum + calculateExerciseXp(diff),
    0,
  );
  return 10 + exercisesXp;
}

export function calculateExerciseListCoins(difficulties: string[]): number {
  const exercisesCoins = difficulties.reduce(
    (sum, diff) => sum + calculateExerciseCoins(diff),
    0,
  );
  return 100 + exercisesCoins;
}

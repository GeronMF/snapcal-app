import { Gender, Goal, Meal } from '../types';

// Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
export function calculateBMR(
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: Gender
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calculate daily calorie target based on BMR and activity level
export function calculateDailyTarget(
  bmr: number,
  activityLevel: number = 1.2, // sedentary by default
  goal: Goal
): number {
  const maintenanceCalories = bmr * activityLevel;
  
  switch (goal) {
    case 'lose':
      return Math.round(maintenanceCalories * 0.8); // 20% deficit
    case 'maintain':
      return Math.round(maintenanceCalories);
    case 'gain':
      return Math.round(maintenanceCalories * 1.15); // 15% surplus
    default:
      return Math.round(maintenanceCalories);
  }
}

// Calculate calories consumed today
export function calculateCaloriesConsumed(meals: Meal[]): number {
  return meals.reduce((total, meal) => total + meal.calories, 0);
}

// Calculate remaining calories for the day
export function calculateRemainingCalories(target: number, consumed: number): number {
  return target - consumed;
}

export type Gender = 'male' | 'female';

export function calculateBasalMetabolicRate(
  age: number,
  gender: Gender,
  weight: number, // в кг
  height: number, // в см
): number {
  // Формула Миффлина-Сан Жеора
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Коэффициенты активности
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // Сидячий образ жизни
  light: 1.375, // Легкая активность (1-3 раза в неделю)
  moderate: 1.55, // Умеренная активность (3-5 раз в неделю)
  active: 1.725, // Высокая активность (6-7 раз в неделю)
  veryActive: 1.9, // Очень высокая активность (2 раза в день)
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS;

export function calculateDailyCalories(
  age: number,
  gender: Gender,
  weight: number,
  height: number,
  activityLevel: ActivityLevel,
): number {
  const bmr = calculateBasalMetabolicRate(age, gender, weight, height);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}
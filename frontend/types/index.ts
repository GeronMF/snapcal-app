import { Gender, ActivityLevel } from '../utils/calorieCalculator';

export type User = {
  id: string;
  name: string;
  email: string;
  language: Language;
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  activityLevel?: ActivityLevel;
  goal?: Goal;
};

export type Meal = {
  id: string;
  imageUri?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
  userId: string;
  date: string; // YYYY-MM-DD format
  isFavorite?: boolean;
  comment?: string;
};

export type Language = 'en' | 'ru' | 'pl' | 'uk' | 'es';

export type Goal = 'lose' | 'maintain' | 'gain';

export type OnboardingStep = 
  | 'language'
  | 'personal'
  | 'goals'
  | 'complete';

export type RootStackParamList = {
  onboarding: undefined;
  '(tabs)': undefined;
  index: undefined;
  history: undefined;
  settings: undefined;
};

export type TabParamList = {
  index: undefined;
  history: undefined;
  settings: undefined;
};

export type FormErrors = {
  [key: string]: string;
};

export interface UserContextType {
  user: User | null;
  setUserData: (data: Partial<User>) => Promise<void>;
  updateLanguage: (language: Language) => void;
  calculateTargetCalories: () => number;
}

export interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
}
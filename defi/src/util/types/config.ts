interface MealDayData {
  content: string;
  sumMicronutrients: string;
  table1: string;
  table2: string;
}

interface MealPlan {
  day: string;
  ranges: MealDayData;
}

interface ExerciseConfig {
  tabla: string;
  rangeDropdown: string[];
  intensificationTechniquesDropdown: string[];
}

interface Config {
  lastUpdate: string;
  dayConfig: MealPlan[];
  listConfig: string[];
  exerciseConfig: ExerciseConfig;
}

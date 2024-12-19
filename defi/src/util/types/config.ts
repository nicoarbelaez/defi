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

interface ExchangeConfig {
  foodCode: string;
  foodToBeExchanged: string;
  targetQuantity: string;
  equivalentFood: string;
  equivalentPortion: string;
  homeMeasurement: string;
}

interface ExerciseConfig {
  tabla: string;
  rangeDropdown: string[];
}

interface Config {
  lastUpdate: string;
  dayConfig: MealPlan[];
  listConfig: string[];
  exchangeConfig: ExchangeConfig;
  exerciseConfig: ExerciseConfig;
}

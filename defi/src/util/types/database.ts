interface ResponseDoGet {
  lastUpdate: string;
  items: ItemFood[];
  codes: string[];
  baseGrams: number;
  exerciseDatabase: ExerciseDatabase;
}

interface ItemFood {
  code: string;
  food: Micronutrients[];
}

interface Micronutrients {
  nameFood: string;
  kcal: number;
  carb: number;
  protein: number;
  fat: number;
  homeUnit: {
    value: number;
    unit: string;
  };
}

interface ExerciseDatabase {
  muscleGroups: string[];
  exercises: {
    muscleGroup: string;
    exercise: {
      name: string;
      url: string;
    }[];
  }[];
}

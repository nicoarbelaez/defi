interface ResponseDoGet {
  lastUpdate: string;
  items: Item[];
  codes: string[];
  baseGrams: number;
  exerciseDatabase: ExerciseDatabase;
}

interface Item {
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

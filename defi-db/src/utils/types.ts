interface DoGetResponse {
  lastUpdate: string; // Timestamp de cualquier actulizacion de google sheet
  items: Item[];
  codes: string[];
  baseGrams: number;
  exerciseDatabase: ExerciseDatabase;
  intensificationTechniques: IntensificationTechniques[];
}

interface Item {
  code: string;
  food: Micronutrient[];
}

interface Micronutrient {
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

interface IntensificationTechniques {
  name: string;
  url: string;
}
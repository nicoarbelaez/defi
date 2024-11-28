interface ResponseDoGet {
  lastUpdate: string;
  items: {
    code: string;
    food: Micronutrients[];
  }[];
  codes: string[];
  baseGrams: number;
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

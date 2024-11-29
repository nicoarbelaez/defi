interface Item {
  code: CellData;
  food: CellData;
  grams: Omit<CellData, "value"> & { value: { num: number; str: string } };
}

interface CellData {
  value: string;
  range: string;
  isDropDown: boolean;
}

type TotalMicronutrients = Omit<Micronutrients, "nameFood" | "homeUnit"> & {
  totalByMeal: number[];
};

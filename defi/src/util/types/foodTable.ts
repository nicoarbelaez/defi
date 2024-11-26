interface Item {
    code: CellData;
    food: CellData;
    grams: CellData;
  }
  
  interface CellData {
    value: string;
    range: string;
    isDropDown: boolean;
  }
  
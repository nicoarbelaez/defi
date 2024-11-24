class TableExchange {
    private readonly _ranges: string[];
    private readonly _sheet: GoogleAppsScript.Spreadsheet.Sheet;
    private _data: {
      foodCode: string;
      foodCurrent: string;
      grams: number;
      equivalentFood: string;
      equivalentGrams: number;
      homeUnit: string;
    };
  
    constructor(sheetName: string, ranges: string[]) {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
      this._sheet = sheet;
      this._ranges = ranges;
  
      this._data = {
        foodCode: "",
        foodCurrent: "",
        grams: 0,
        equivalentFood: "",
        equivalentGrams: 0,
        homeUnit: "",
      };
    }
  
    /**
     * Carga los datos desde las celdas especificadas.
     */
    public loadData(): void {
      const [foodCodeRange, foodCurrentRange, gramsRange, equivalentFoodRange] = this._ranges;
  
      this._data.foodCode = this._getValueFromRange(foodCodeRange);
      this._data.foodCurrent = this._getValueFromRange(foodCurrentRange);
      this._data.grams = parseInt(this._getValueFromRange(gramsRange));
      this._data.equivalentFood = this._getValueFromRange(equivalentFoodRange);
  
      if (isNaN(this._data.grams)) {
        throw new Error(`El valor de gramos no es un número válido: "${this._data.grams}"`);
      }
  
      console.log("Datos cargados:", this._data);
    }
  
    /**
     * Calcula los datos necesarios para el intercambio.
     */
    public calculateExchange(): void {
      const { foodCode, foodCurrent, grams, equivalentFood } = this._data;
  
      try {
        const item = findItemByCodeAndFood(foodCode, foodCurrent);
        const itemExchange = findItemByCodeAndFood(foodCode, equivalentFood);
  
        const itemKcal = getCalories(grams, item);
        this._data.equivalentGrams = (itemKcal * BASE_GRAMS) / itemExchange.kcal;
        this._data.homeUnit = getHomeUnit(this._data.equivalentGrams, itemExchange);
  
      } catch (error) {
        console.error("Error en el cálculo de intercambio:", error);
        this._data.equivalentGrams = 0;
        this._data.homeUnit = "";
      }
    }
  
    /**
     * Guarda los datos calculados en las celdas especificadas.
     */
    public storeData(): void {
      const [_, __, ___, equivalentGramsRange, homeUnitRange] = this._ranges;
  
      this._setValueInRange(equivalentGramsRange, this._data.equivalentGrams.toFixed(2));
      this._setValueInRange(homeUnitRange, this._data.homeUnit);
  
      console.log("Datos guardados en las celdas.");
    }
  
    /**
     * Limpia las celdas configuradas.
     */
    public clearData(): void {
      this._ranges.forEach((range) => this._setValueInRange(range, ""));
      console.log("Celdas limpiadas.");
    }
  
    /**
     * Obtiene el valor de una celda especificada.
     * @param range - Rango de la celda.
     * @returns El valor de la celda.
     */
    private _getValueFromRange(range: string): string {
      return this._sheet.getRange(range).getValue().toString().trim();
    }
  
    /**
     * Establece un valor en una celda específica.
     * @param range - Rango de la celda.
     * @param value - Valor a establecer.
     */
    private _setValueInRange(range: string, value: string | number): void {
      this._sheet.getRange(range).setValue(value);
    }
  }
  
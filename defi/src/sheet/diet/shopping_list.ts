class ShoppingList {
  private _startRow: number;
  private _startCol: LetterInteger;
  private _listLength: number;
  private _columnCount: LetterInteger[];

  constructor(
    startCol: LetterInteger,
    startRow: number,
    listLength: number,
    columnCount: LetterInteger[]
  ) {
    if (typeof startRow !== "number") {
      throw new TypeError("startRow debe ser un número.");
    }
    if (typeof listLength !== "number") {
      throw new TypeError("listLength debe ser un número.");
    }
    if (!Array.isArray(columnCount) || !columnCount.every((col) => typeof col === "number")) {
      throw new TypeError("columnCount debe ser un array de números.");
    }

    this._startCol = startCol;
    this._startRow = startRow;
    this._listLength = listLength;
    this._columnCount = columnCount;
  }

  /**
   * Crea una instancia de ShoppingList a partir de un objeto JSON.
   * @param {Object} json - El objeto JSON.
   * @returns {ShoppingList} La instancia de ShoppingList.
   */
  static fromJSON(json: any): ShoppingList {
    const { _startCol, _startRow, _listLength, _columnCount } = json;
    return new ShoppingList(_startCol, _startRow, _listLength, _columnCount);
  }

  /**
   * Carga el plan de comidas desde una fuente externa y unifica las comidas.
   * @private
   */
  private loadFoodPlan(): IngredientInput[] {
    const tableFoodRecord: TableFoodRecord = PersistentVariable.getTableFood();
    const ingredients: IngredientInput[] = [];

    for (const key in tableFoodRecord) {
      if (tableFoodRecord.hasOwnProperty(key)) {
        const tableFood = tableFoodRecord[key];
        const ingredientInputs = tableFood.loadIngredients();
        ingredients.push(...ingredientInputs);
      }
    }

    return ingredients;
  }

  /**
   * Unifica todas las comidas, sumando los gramos de las comidas repetidas.
   * @private
   * @param {IngredientInput[]} ingredients - La lista de ingredientes a unificar.
   * @returns {IngredientInput[]} La lista unificada de ingredientes.
   */
  private unifyMeals(ingredients: IngredientInput[]): IngredientInput[] {
    const unifiedList: { [key: string]: IngredientInput } = {};

    ingredients.forEach((food) => {
      const key = `${food.code}-${food.food}`;
      if (!unifiedList[key]) {
        unifiedList[key] = { ...food, grams: 0 }; // Inicializa los gramos en 0
      }
      unifiedList[key].grams += food.grams; // Suma los gramos
    });

    return Object.keys(unifiedList).map((key) => unifiedList[key]);
  }

  /**
   * Inserta la lista de compras en la hoja SHEET_DIET.
   */
  public insertShoppingList(): void {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DIET);
    const columns = this._columnCount;
    const rowCount = this._listLength;
    const ingredients = this.unifyMeals(this.loadFoodPlan());
    console.log(ingredients);

    let itemIndex = 0;

    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const column = columns[colIndex];
      for (let row = 0; row < rowCount; row++) {
        let value = "";
        if (itemIndex < ingredients.length) {
          // Corregido aquí
          const item = ingredients[itemIndex];
          let homeUnit = "";
          try {
            const ingredient = Utils.findItemByCodeAndFood(item.code, item.food);
            homeUnit = Utils.getHomeUnit(item.grams, ingredient);
          } catch (error) {
            console.error(`Error al encontrar el ítem: ${error.message}`);
          }
          value = `${item.food} \t - \t${item.grams}g${homeUnit ? ` (${homeUnit})` : ""}`;
          itemIndex++;
        }
        sheet.getRange(this._startRow + row * 2, column).setValue(value); // Usar this._startRow como base
      }
    }
  }
}

function generate() {
  const tableFoods = PersistentVariable.getTableFood();
  const shoppingList = PersistentVariable.getShoppingList();

  for (const day in tableFoods) {
    if (tableFoods.hasOwnProperty(day)) {
      tableFoods[day].updateGramsCells();
    }
  }

  shoppingList.insertShoppingList();

  // Mostrar mensaje tipo "toast"
  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Se ha generado la lista de compra y se han actualizado las celdas de gramos con sus unidades caseras de medida.",
    "Operación Completa"
  );
}

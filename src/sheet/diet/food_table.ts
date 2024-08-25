const SHEET_DIET = "Dieta";

/**
 * Interfaz para la configuración inicial y limpieza de datos.
 */
interface SetUp {
  /**
   * Inicializa la configuración.
   */
  init(): void;

  /**
   * Limpia los datos y la configuración.
   */
  clean(): void;
}

interface IngredientInput {
  code: string;
  food: string;
  grams: number;
}

interface SubTableRange {
  codeCol: LetterString;
  foodCol: LetterString;
  gramsCol: LetterString;
  range: string;
}

class TableFood implements SetUp {
  private _day: string;
  private _tableStartCol: LetterInteger;
  private _tableStartRow: number;
  private _range1: string;
  private _range2: string;
  private _totalKcal: number;
  private _totalCarbs: number;
  private _totalProteins: number;
  private _totalFats: number;
  private _subTableRanges: SubTableRange[];
  private _mealCalories: number[];

  private static readonly PREFIX_NAMERANGE = "DB_FOOD_BOARD";
  private static readonly TABLE_ROW_INCREMENT = 10;
  private static readonly SUB_TABLE_COUNT = 3;
  private static readonly ROW_SPAN = 6;
  private static readonly COLUMN_SPAN = 8;

  constructor(tableStartCol: LetterInteger, tableStartRow: number, day: DaysOfWeek) {
    this._day = day;
    this._tableStartCol = tableStartCol;
    this._tableStartRow = tableStartRow;
    this._range1 = this.getDietSheetRange(tableStartCol, tableStartRow, 1);
    this._range2 = this.getDietSheetRange(tableStartCol, tableStartRow, 2);
    this._totalKcal = 0;
    this._totalCarbs = 0;
    this._totalProteins = 0;
    this._totalFats = 0;
    this._subTableRanges = this.getSubTableRanges(tableStartRow, tableStartCol);
    this._mealCalories = [];
  }

  /**
   * Crea una instancia de TableFood a partir de un objeto JSON.
   * @param {Object} json - El objeto JSON.
   * @returns {TableFood} La instancia de TableFood.
   */
  static fromJSON(json: any): TableFood {
    const instance = new TableFood(json._tableStartCol, json._tableStartRow, json._day);
    instance._totalKcal = json._totalKcal;
    instance._totalCarbs = json._totalCarbs;
    instance._totalProteins = json._totalProteins;
    instance._totalFats = json._totalFats;
    instance._mealCalories = json._mealCalories;
    return instance;
  }

  /**
   * Obtiene los rangos de cada instancia de TableFood.
   * @param {TableFoodRecord} tableFood - Un objeto con las instancias de TableFood.
   * @returns {string[]} Un array de strings con los valores de _range1 y _range2.
   */
  static foodTableRanges(tableFood: TableFoodRecord): string[] {
    const ranges: string[] = [];
    for (const day in tableFood) {
      if (tableFood.hasOwnProperty(day)) {
        const table = tableFood[day];
        ranges.push(table._range1, table._range2);
      }
    }
    return ranges;
  }

  /**
   * Busca un objeto TableFood que contenga la celda especificada en range1 o range2.
   * @param {TableFoodRecord} tableFoods - Un objeto con las instancias de TableFood.
   * @param {string} cell - La celda a buscar.
   * @returns {TableFood | null} El objeto TableFood que contiene la celda, o null si no se encuentra.
   */
  static findTableFoodByCell(tableFoods: TableFoodRecord, cell: string): TableFood | null {
    for (const key in tableFoods) {
      if (tableFoods.hasOwnProperty(key)) {
        const tableFood = tableFoods[key];
        if (
          Utils.isCellInRange(cell, tableFood._range1) ||
          Utils.isCellInRange(cell, tableFood._range2)
        ) {
          return tableFood;
        }
      }
    }
    return null;
  }

  /**
   * Obtiene el rango de la hoja de dieta para una tabla específica.
   * @param {number} startCol - La columna de inicio de la tabla.
   * @param {number} startRow - La fila de inicio de la tabla.
   * @param {number} tableNumber - El número de la tabla (1 o 2).
   * @returns {string} El rango de la hoja de dieta.
   */
  private getDietSheetRange(startCol: number, startRow: number, tableNumber: number): string {
    const lettersStartCell = Utils.getLetter(startCol);
    const lettersEndCell = Utils.getLetter(startCol + TableFood.COLUMN_SPAN);

    if (tableNumber === 2) {
      startRow += TableFood.TABLE_ROW_INCREMENT;
    }

    return `${lettersStartCell}${startRow}:${lettersEndCell}${startRow + TableFood.ROW_SPAN}`;
  }

  /**
   * Obtiene los rangos completos de las subtablas.
   * @param {number} startRow - La fila de inicio de la tabla.
   * @param {number} startCol - La columna de inicio de la tabla.
   * @returns {Array<SubTableRange>} Un array con los rangos completos de las subtablas.
   */
  private getSubTableRanges(startRow: number, startCol: number): SubTableRange[] {
    const subTableRanges: SubTableRange[] = [];
    subTableRanges.push(...this.generateSubTableRanges(startRow, startCol));
    subTableRanges.push(
      ...this.generateSubTableRanges(startRow + TableFood.TABLE_ROW_INCREMENT, startCol)
    );
    return subTableRanges;
  }

  /**
   * Genera los rangos completos de las subtablas.
   * @param {number} startRow - La fila de inicio de la tabla.
   * @param {number} startCol - La columna de inicio de la tabla.
   * @returns {Array<SubTableRange>} Un array con los rangos completos de las subtablas.
   */
  private generateSubTableRanges(startRow: number, startCol: number): SubTableRange[] {
    const subTableRanges: SubTableRange[] = [];
    for (let i = 0; i < TableFood.SUB_TABLE_COUNT; i++) {
      const startColLetter = Utils.getLetter(startCol);
      const endColLetter = Utils.getLetter(startCol + 2);
      subTableRanges.push({
        codeCol: Utils.getLetter(startCol),
        foodCol: Utils.getLetter(startCol + 1),
        gramsCol: Utils.getLetter(startCol + 2),
        range: `${startColLetter}${startRow}:${endColLetter}${startRow + TableFood.ROW_SPAN}`,
      });
      startCol += TableFood.SUB_TABLE_COUNT;
    }
    return subTableRanges;
  }

  private manageNamedRange(action: "create" | "delete", range: string, index: number): void {
    const name = `${TableFood.PREFIX_NAMERANGE}_${index}_${this._day.toUpperCase()}`;
    if (action === "create") {
      Utils.createNamedRange(range, name, SHEET_DIET);
      Utils.showToast(`${this._day} #${index}`, "Rango con nombre creado", 5);
    } else if (action === "delete") {
      Utils.deleteNamedRange(name, SHEET_DIET);
      Utils.showToast(`${this._day} #${index}`, "Rango con nombre eliminado", 5);
    }
  }

  /**
   * Obtiene los rangos de la primera columna de las subtablas.
   * @param {SubTableRange[]} ranges - Un array de objetos SubTableRange.
   * @returns {string[]} Un array de rangos de la primera columna.
   */
  private getFirstColumnRanges(ranges: SubTableRange[]): string[] {
    return ranges.map((subTableRange) => {
      const { codeCol, range } = subTableRange;
      const [start, end] = range.split(":");
      const startRow = start.replace(/[A-Z]/g, "");
      const endRow = end.replace(/[A-Z]/g, "");
      return `${codeCol}${startRow}:${codeCol}${endRow}`;
    });
  }

  private getSubTableRangeForCell(cell: string): SubTableRange | null {
    return (
      this._subTableRanges.find((subTableRange) =>
        Utils.isCellInRange(cell, subTableRange.range)
      ) || null
    );
  }

  private isCellInColumn(cell: string, column: string): boolean {
    return cell.replace(/[0-9]/g, "") === column;
  }

  private getAdjacentCell(cell: string, column: string): string {
    const row = cell.replace(/[A-Z]/g, "");
    return `${column}${row}`;
  }

  private createDropdownValidation(cell: string, namedRange: string): void {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(SpreadsheetApp.getActiveSpreadsheet().getRangeByName(namedRange))
      .build();
    Utils.createValidations([cell], rule, SHEET_DIET);
  }

  /**
   * Parsea una fila y extrae el código, nombre del alimento y gramos.
   * @param {any[]} row - La fila a parsear.
   * @returns {Object} Un objeto con las propiedades code, food y grams.
   */
  private parseRow(row: any[]): IngredientInput {
    const stringRow: string[] = row.map((cell) => cell.toString());

    // Verificar si todas las columnas de la fila tienen información
    if (!stringRow.every((cell) => cell && cell.trim() !== "")) {
      return { code: "", food: "", grams: 0 };
    }

    const code = stringRow[IndexColSubTable.code];
    const food = stringRow[IndexColSubTable.food];
    const gramsAndHomeUnit = stringRow[IndexColSubTable.grams];
    let grams: number | null = null;

    // Validar y convertir el valor de grams
    if (typeof gramsAndHomeUnit === "string") {
      const numericPart = gramsAndHomeUnit.match(/^\d+/);
      if (numericPart) {
        grams = parseFloat(numericPart[0]);
      }
    } else if (typeof gramsAndHomeUnit === "number") {
      grams = parseFloat(gramsAndHomeUnit);
    }

    return { code, food, grams };
  }

  /**
   * Carga los ingredientes desde las subtablas.
   * @returns {IngredientInput[]} La lista de ingredientes.
   */
  public loadIngredients(): IngredientInput[] {
    const ingredients: IngredientInput[] = [];

    this._subTableRanges.forEach((subTableRange) => {
      const rangeValues = SpreadsheetApp.getActiveSpreadsheet()
        .getRange(subTableRange.range)
        .getValues();

      rangeValues.forEach((row) => {
        const ingredient = this.parseRow(row);
        if (ingredient.code && ingredient.food && ingredient.grams > 0) {
          try {
            const foundIngredient = Utils.findItemByCodeAndFood(ingredient.code, ingredient.food);
            if (foundIngredient) {
              ingredients.push(ingredient);
            }
          } catch (error) {
            console.error(`Error al encontrar el ítem: ${error.message}`);
          }
        }
      });
    });

    return ingredients;
  }

  /**
   * Calcula los nutrientes de un ingrediente.
   * @param {number} grams - La cantidad en gramos.
   * @param {Ingredient} ingredient - El ingrediente.
   * @returns {Object} Un objeto con las propiedades carbs, proteins, fats y kcal.
   */
  private calculateNutrients(
    grams: number,
    ingredient: Ingredient
  ): { carbs: number; proteins: number; fats: number; kcal: number } {
    const carbs = Utils.getCarbs(grams, ingredient);
    const proteins = Utils.getProteins(grams, ingredient);
    const fats = Utils.getFats(grams, ingredient);
    const kcal = Utils.getCalories(grams, ingredient);

    return { carbs, proteins, fats, kcal };
  }
  /**
   * Agrega una lista desplegable en la columna "food" de la fila modificada.
   * @param {string} cell - La celda editada en formato A1 (por ejemplo, "B2").
   */
  public addDropdownFood(cell: string): void {
    if (!this.isCellInRange(cell)) {
      return;
    }

    const subTableRange = this.getSubTableRangeForCell(cell);
    if (!subTableRange || !this.isCellInColumn(cell, subTableRange.codeCol)) {
      return;
    }

    const code: string = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_DIET)
      .getRange(cell)
      .getValue();
    const namedRange = `${PREFIX_CODE_FOOD}_${code}`;
    const namedRangeExists = !!SpreadsheetApp.getActiveSpreadsheet().getRangeByName(namedRange);

    const foodCell = this.getAdjacentCell(cell, subTableRange.foodCol);
    if (namedRangeExists) {
      this.createDropdownValidation(foodCell, namedRange);
    } else {
      Utils.deleteValidations([foodCell], SHEET_DIET);
    }
  }
  /**
   * Calcula las sumatorias de carbohidratos, proteínas, grasas y calorías para todos los rangos en _subTableRanges.
   */
  public calculateNutritionalTotals(): void {
    this._totalKcal = 0;
    this._totalCarbs = 0;
    this._totalProteins = 0;
    this._totalFats = 0;
    this._mealCalories = [];

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DIET);

    this._subTableRanges.forEach((subTableRange, mealIndex) => {
      const range = sheet.getRange(subTableRange.range);
      const values = range.getValues();
      let mealKcal = 0;

      values.forEach((row) => {
        const { code, food, grams } = this.parseRow(row);
        if (!(code && food && grams !== null)) {
          return;
        }

        try {
          const ingredient = Utils.findItemByCodeAndFood(code, food);
          const { carbs, proteins, fats, kcal } = this.calculateNutrients(grams, ingredient);

          this._totalCarbs += carbs;
          this._totalProteins += proteins;
          this._totalFats += fats;
          this._totalKcal += kcal;
          mealKcal += kcal;
        } catch (error) {
          // console.error(error.message);
        }
      });

      this._mealCalories[mealIndex] = mealKcal;
    });

    console.log(`Sumatoria: ${JSON.stringify(this, null, 2)}`);
  }

  /**
   * Actualiza todas las celdas de gramos en los rangos de _subTableRanges.
   */
  public updateGramsCells() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DIET);
    this._subTableRanges.forEach((subTableRange) => {
      const range = sheet.getRange(subTableRange.range);
      const values = range.getValues();

      values.forEach((row, rowIndex) => {
        const { code, food, grams } = this.parseRow(row);
        if (!(code && food && grams !== null)) {
          return;
        }

        try {
          const ingredient = Utils.findItemByCodeAndFood(code, food);
          const homeUnit = Utils.getHomeUnit(grams, ingredient);
          const newGramsValue = homeUnit ? `${grams} (${homeUnit})` : `${grams}`;

          // Verificar si newGramsValue es solo números
          if (!isNaN(parseFloat(newGramsValue)) && isFinite(newGramsValue as any)) {
            return;
          }

          // Actualizar la celda de gramos
          sheet
            .getRange(range.getRow() + rowIndex, Utils.getColumnIndex(subTableRange.gramsCol))
            .setValue(newGramsValue);
          Logger.log(`Updated grams for ${food} to ${newGramsValue}`);
        } catch (error) {
          console.error(`Error al actualizar gramos para ${food}: ${error.message}`);
        }
      });
    });
  }

  /**
   * Inserta los datos nutricionales en la hoja de dieta.
   */
  public insertNutritionalData() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DIET);

    // Insertar los totales en la columna E, n filas arriba del inicio de _range1
    const startRow = this._tableStartRow - 7;
    const column = this._tableStartCol + 4;

    sheet.getRange(startRow, column).setValue(this._totalKcal);
    sheet.getRange(startRow + 1, column).setValue(this._totalCarbs);
    sheet.getRange(startRow + 2, column).setValue(this._totalProteins);
    sheet.getRange(startRow + 3, column).setValue(this._totalFats);

    // Insertar las calorías de cada comida en las subtablas
    this._subTableRanges.forEach((subTableRange, index) => {
      if (index < this._mealCalories.length) {
        const range = sheet.getRange(subTableRange.range);
        const lastRow = range.getLastRow();
        const lastColumn = range.getLastColumn();
        sheet.getRange(lastRow + 1, lastColumn).setValue(this._mealCalories[index]);

        Logger.log(`Insert ${this._mealCalories[index]} en ${range.getA1Notation()}`);
      }
    });
  }

  /**
   * Verifica si una celda está dentro de _range1 o _range2.
   * @param {string} cell - El rango de la celda en formato A1 (por ejemplo, "B2").
   * @returns {boolean} - Verdadero si la celda está dentro de _range1 o _range2, falso en caso contrario.
   */
  public isCellInRange(cell: string): boolean {
    return Utils.isCellInRange(cell, this._range1) || Utils.isCellInRange(cell, this._range2);
  }

  public init(): void {
    this.manageNamedRange("create", this._range1, 1);
    this.manageNamedRange("create", this._range2, 2);

    const dbCodesRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(TABLE_CODES);
    if (!dbCodesRange) {
      Logger.log(`Named range "${TABLE_CODES}" not found.`);
      return;
    }

    const rule = SpreadsheetApp.newDataValidation().requireValueInRange(dbCodesRange).build();
    Utils.createValidations(this.getFirstColumnRanges(this._subTableRanges), rule, SHEET_DIET);
  }

  public clean(): void {
    this.manageNamedRange("delete", this._range1, 1);
    this.manageNamedRange("delete", this._range2, 2);

    Utils.deleteValidations(this.getFirstColumnRanges(this._subTableRanges), SHEET_DIET);
  }
}
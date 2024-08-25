class Utils {
  public static readonly BASE_GRAMS: number = 100;
  public static readonly SUB_TABLE_COUNT: number = 3;
  public static readonly TABLE_ROW_SPAN: number = 10;

  /**
   * Separa los gramos de las unidades caseras.
   * @param {string|number} gramsAndUnit - La cadena o número que contiene los gramos y las unidades caseras.
   * @returns {Object} Un objeto con los gramos y las unidades caseras.
   * @throws {TypeError} Si el parámetro no es un string o un número.
   */
  static parseGramsAndHomeUnit(gramsAndUnit: string | number): { grams: number; homeUnit: string } {
    if (typeof gramsAndUnit === "number") {
      return {
        grams: gramsAndUnit,
        homeUnit: "",
      };
    }

    if (typeof gramsAndUnit === "string") {
      const split: string[] = gramsAndUnit.split(" (");
      if (split.length > 1) {
        const grams: number = parseInt(split[0], 10);
        if (isNaN(grams)) {
          throw new Error("El valor de gramos no es un número válido.");
        }
        return {
          grams: grams,
          homeUnit: split[1].replace(")", "") || "",
        };
      }
      return {
        grams: parseInt(gramsAndUnit, 10),
        homeUnit: "",
      };
    }

    throw new TypeError("El parámetro debe ser un string o un número.");
  }

  /**
   * Genera las celdas de inicio de las subtablas.
   * @param {number} startRow - La fila de inicio de la tabla.
   * @param {number} startCol - La columna de inicio de la tabla.
   * @returns {Array<string>} Un array con los rangos de inicio de las subtablas.
   */
  static generateSubTableStartCells(startRow: number, startCol: number): Array<string> {
    const subTableStartCells: string[] = [];
    for (let i: number = 0; i < this.SUB_TABLE_COUNT; i++) {
      subTableStartCells.push(
        `${this.getLetter(startCol)}${startRow}:${this.getLetter(startCol + 2)}${
          startRow + this.TABLE_ROW_SPAN
        }`
      );
      startCol += this.SUB_TABLE_COUNT;
    }
    return subTableStartCells;
  }

  /**
   * Obtiene la notación A1 de un rango nombrado en la hoja de cálculo activa.
   * @param {string} rangeName - El nombre del rango a buscar.
   * @returns {string} La notación A1 del rango si se encuentra, de lo contrario una cadena vacía.
   */
  static getA1AnotationByRangeName(rangeName: string): string {
    const range: GoogleAppsScript.Spreadsheet.Range =
      SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName);
    if (!range) {
      return "";
    }

    return range.getA1Notation();
  }

  /**
   * Obtiene los carbohidratos de un alimento.
   * @param {number} grams - La cantidad en gramos.
   * @param {Ingredient} ingredient - El objeto ingrediente.
   * @returns {number} La cantidad de carbohidratos.
   */
  static getCarbs(grams: number, ingredient: Ingredient): number {
    return (grams * ingredient.carb) / this.BASE_GRAMS;
  }

  /**
   * Obtiene las proteínas de un alimento.
   * @param {number} grams - La cantidad en gramos.
   * @param {Ingredient} ingredient - El objeto ingrediente.
   * @returns {number} La cantidad de proteínas.
   */
  static getProteins(grams: number, ingredient: Ingredient): number {
    return (grams * ingredient.protein) / this.BASE_GRAMS;
  }

  /**
   * Obtiene las grasas de un alimento.
   * @param {number} grams - La cantidad en gramos.
   * @param {Ingredient} ingredient - El objeto ingrediente.
   * @returns {number} La cantidad de grasas.
   */
  static getFats(grams: number, ingredient: Ingredient): number {
    return (grams * ingredient.fat) / this.BASE_GRAMS;
  }

  /**
   * Obtiene las calorías de un alimento.
   * @param {number} grams - La cantidad en gramos.
   * @param {Ingredient} ingredient - El objeto ingrediente.
   * @returns {number} La cantidad de calorías.
   */
  static getCalories(grams: number, ingredient: Ingredient): number {
    console.log(ingredient);
    console.log(`Grams: ${grams} | Kcal ${ingredient.kcal}`);
    return (grams * ingredient.kcal) / this.BASE_GRAMS;
  }
  /**
   * Obtiene la unidad casera de un alimento.
   * @param {number} grams - La cantidad en gramos.
   * @param {Ingredient} ingredient - El objeto ingrediente.
   * @returns {string} La unidad casera proporcional.
   */
  static getHomeUnit(grams: number, ingredient: Ingredient): string {
    if (!ingredient.homeUnit) {
      return "";
    }

    const homeUnitParts: string[] = ingredient.homeUnit.trim().split(" ");
    if (homeUnitParts.length > 1) {
      const quantity: number = parseFloat(homeUnitParts[0].replace(",", ".")); // Cantidad numérica
      const unit: string = homeUnitParts.slice(1).join(" "); // Unidad de medida
      const proportionalValue: number = (grams * quantity) / this.BASE_GRAMS;
      const formattedValue: string = proportionalValue.toFixed(2); // Asegura al menos dos decimales
      return `${formattedValue} ${unit}`;
    }

    return "";
  }

  /**
   * Encuentra un ítem por su código y nombre de alimento en el mapa de datos.
   * @param {string} code - El código del alimento.
   * @param {string} food - El nombre del alimento.
   * @returns {Ingredient} El ítem encontrado.
   * @throws {Error} Si no se encuentra el ítem.
   */
  static findItemByCodeAndFood(code: string, food: string): Ingredient {
    const dataFood: JSONIngredient = FoodDataCache.getJsonFromCache();
    const items: Ingredient[] = dataFood[code];
    if (items) {
      const item: Ingredient = items.find((item: Ingredient) => item.food === food);
      if (item) {
        return item;
      }
    }
    throw new Error(`Item with code ${code} and food ${food} not found.`);
  }

  /**
   * Verifica si una celda está dentro de un rango especificado.
   * @param {string} cell - La celda en formato A1 (por ejemplo, "B2").
   * @param {string} range - El rango en formato A1 (por ejemplo, "A1:C10").
   * @returns {boolean} Verdadero si la celda está dentro del rango, falso en caso contrario.
   */
  static isCellInRange(cell: string, range: string): boolean {
    const [start, end]: string[] = range.split(":");
    const startCol: string = start.replace(/[0-9]/g, "");
    const startRow: number = parseInt(start.replace(/[A-Z]/g, ""), 10);
    const endCol: string = end.replace(/[0-9]/g, "");
    const endRow: number = parseInt(end.replace(/[A-Z]/g, ""), 10);

    const cellCol: string = cell.replace(/[0-9]/g, "");
    const cellRow: number = parseInt(cell.replace(/[A-Z]/g, ""), 10);

    return cellCol >= startCol && cellCol <= endCol && cellRow >= startRow && cellRow <= endRow;
  }

  /**
   * Parsea un rango en formato "A1:B10" y retorna un objeto con las propiedades startcol, startrow, endcol y endrow.
   * @param {string} range - El rango en formato "A1:B10".
   * @returns {Object} Un objeto con las propiedades startcol, startrow, endcol y endrow.
   */
  static parseRange(range: string): {
    startcol: LetterString;
    startrow: LetterInteger;
    endcol: LetterString;
    endrow: LetterInteger;
  } {
    const rangeParts: string[] = range.split(":");
    const start: string = rangeParts[0];
    const end: string = rangeParts[1];

    const startCol: LetterString = start.match(/[A-Z]+/)[0] as LetterString;
    const startRow: number = parseInt(start.match(/[0-9]+/)[0], 10) as LetterInteger;
    const endCol: LetterString = end.match(/[A-Z]+/)[0] as LetterString;
    const endRow: number = parseInt(end.match(/[0-9]+/)[0], 10) as LetterInteger;

    return {
      startcol: startCol,
      startrow: startRow,
      endcol: endCol,
      endrow: endRow,
    };
  }

  /**
   * Convierte un índice de columna en su correspondiente letra.
   * @param {LetterInteger} columnIndex - El índice de la columna.
   * @returns {LetterString} - La letra de la columna.
   */
  public static getLetter(columnIndex: LetterInteger): LetterString {
    return String.fromCharCode(64 + columnIndex) as LetterString;
  }

  /**
   * Convierte una letra de columna en su correspondiente índice.
   * @param {LetterString} columnLetter - La letra de la columna.
   * @returns {LetterInteger} - El índice de la columna.
   */
  public static getColumnIndex(columnLetter: LetterString): number {
    return columnLetter.charCodeAt(0) - 64;
  }

  /**
   * Crea un rango con nombre en una hoja específica.
   * @param {string} range - El rango en formato string (e.g., "A1:B2").
   * @param {string} name - El nombre del rango.
   * @param {string} sheetName - El nombre de la hoja donde se creará el rango.
   */
  static createNamedRange(range: string, name: string, sheetName: string): void {
    const sheet: GoogleAppsScript.Spreadsheet.Sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet) {
      SpreadsheetApp.getActiveSpreadsheet().setNamedRange(name, sheet.getRange(range));
    } else {
      throw new Error(`Sheet with name ${sheetName} not found.`);
    }
  }

  /**
   * Elimina un rango con nombre en una hoja específica.
   * @param {string} name - El nombre del rango.
   * @param {string} sheetName - El nombre de la hoja donde se eliminará el rango.
   */
  static deleteNamedRange(name: string, sheetName: string): void {
    const sheet: GoogleAppsScript.Spreadsheet.Sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet) {
      const namedRanges: GoogleAppsScript.Spreadsheet.NamedRange[] = sheet.getNamedRanges();
      const namedRange: GoogleAppsScript.Spreadsheet.NamedRange = namedRanges.find(
        (range: GoogleAppsScript.Spreadsheet.NamedRange) => range.getName() === name
      );
      if (namedRange) {
        namedRange.remove();
      } else {
        // throw new Error(`Named range ${name} not found in sheet ${sheetName}.`);
      }
    } else {
      throw new Error(`Sheet with name ${sheetName} not found.`);
    }
  }

  /**
   * Crea validaciones en las celdas especificadas.
   * @param {Array<string>} ranges - Un arreglo con los rangos de las celdas (e.g., ["A1", "B2"]).
   * @param {any} validation - La validación a aplicar.
   * @param {string} sheetName - El nombre de la hoja donde se aplicarán las validaciones.
   */
  static createValidations(
    ranges: string[],
    validation: GoogleAppsScript.Spreadsheet.DataValidation,
    sheetName: string
  ): void {
    const sheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet) {
      ranges.forEach((range: string) => {
        const cell: GoogleAppsScript.Spreadsheet.Range = sheet.getRange(range);
        cell.clearDataValidations(); // Elimina cualquier validación existente
        cell.setDataValidation(validation);
      });
    } else {
      throw new Error(`Sheet with name ${sheetName} not found.`);
    }
  }

  /**
   * Elimina validaciones en las celdas especificadas.
   * @param {Array<string>} ranges - Un arreglo con los rangos de las celdas (e.g., ["A1", "B2"]).
   * @param {string} sheetName - El nombre de la hoja donde se eliminarán las validaciones.
   */
  static deleteValidations(ranges: string[], sheetName: string): void {
    const sheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet) {
      ranges.forEach((range: string) => {
        const cell: GoogleAppsScript.Spreadsheet.Range = sheet.getRange(range);
        cell.clearDataValidations(); // Elimina cualquier validación existente
      });
    } else {
      throw new Error(`Sheet with name ${sheetName} not found.`);
    }
  }

  /**
   * Muestra un toast en la hoja de cálculo activa.
   * @param {string} msg - El mensaje a mostrar en el toast.
   * @param {string} title - El título del toast.
   * @param {number} timeoutSeconds - La duración del toast en segundos.
   */
  static showToast(msg: string, title: string, timeoutSeconds: number): void {
    SpreadsheetApp.getActiveSpreadsheet().toast(msg, title, timeoutSeconds);
  }
}

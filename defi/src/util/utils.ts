class Utils {
  public static readonly BASE_GRAMS = 100;
  public static readonly SUB_TABLE_COUNT = 3;
  public static readonly TABLE_ROW_SPAN = 10;

  static validateHomeUnit(homeUnit: { value: number; unit: string }): boolean {
    if (homeUnit.value !== 0 && (!homeUnit.unit || homeUnit.unit.trim() === "")) {
      throw new Error("Si 'value' es diferente de 0, 'unit' no puede estar vacío.");
    }
    return true;
  }

  static getCarbs(grams: number, ingredient: Micronutrients): number {
    this.validateHomeUnit(ingredient.homeUnit); // Validación de homeUnit
    return (grams * ingredient.carb) / this.BASE_GRAMS;
  }

  static getProteins(grams: number, ingredient: Micronutrients): number {
    this.validateHomeUnit(ingredient.homeUnit); // Validación de homeUnit
    return (grams * ingredient.protein) / this.BASE_GRAMS;
  }

  static getFats(grams: number, ingredient: Micronutrients): number {
    this.validateHomeUnit(ingredient.homeUnit); // Validación de homeUnit
    return (grams * ingredient.fat) / this.BASE_GRAMS;
  }

  static getCalories(grams: number, ingredient: Micronutrients): number {
    this.validateHomeUnit(ingredient.homeUnit); // Validación de homeUnit
    return (grams * ingredient.kcal) / this.BASE_GRAMS;
  }

  static getHomeUnit(grams: number, ingredient: Micronutrients): string {
    this.validateHomeUnit(ingredient.homeUnit); // Validación de homeUnit
    if (!ingredient.homeUnit || ingredient.homeUnit.value === 0) {
      return "";
    }

    const unit = ingredient.homeUnit.unit;
    const quantity = ingredient.homeUnit.value;
    const proportionalValue = (grams * quantity) / this.BASE_GRAMS;
    return `${proportionalValue.toFixed(2).replace(".", ",")} ${unit}`;
  }

  static findItemByCodeAndFood(code: string, food: string): Micronutrients {
    const dataFood = getDataBase();
    const foods = dataFood.items.find((item) => item.code === code).food;
    if (foods) {
      const item = foods.find((item: Micronutrients) => item.nameFood === food);
      if (item) {
        return item;
      }
    }
    throw new Error(`Item with code ${code} and food ${food} not found.`);
  }

  /**
   * Valida si un rango está en el formato A1 válido (por ejemplo, "A1:C10" o "B2").
   * @param {string} range - El rango a validar.
   * @returns {boolean} - Verdadero si el rango es válido, falso en caso contrario.
   */
  static isValidRange(value: string): boolean {
    const rangePattern = /^[A-Za-z]+\d+(:[A-Za-z]+\d+)?$/;
    return rangePattern.test(value);
  }

  /**
   * Parsear una celda en formato A1 (por ejemplo "B2") a columna y fila.
   * @param {string} cell - La celda en formato A1.
   * @returns {Object} Un objeto con las propiedades "column" y "row".
   */
  private static parseCell = (cell: string): { column: string; row: number } => {
    const column = cell.replace(/[0-9]/g, ""); // Parte de la columna (letras)
    const row = parseInt(cell.replace(/[A-Z]/gi, ""), 10); // Parte de la fila (números)

    if (isNaN(row)) {
      throw new Error(`Fila no válida en la celda: ${cell}`);
    }

    return { column, row };
  };

  /**
   * Verifica si una celda está dentro de un rango especificado.
   * @param {string} cell - La celda a verificar (por ejemplo, "B2").
   * @param {string} range - El rango a comparar (por ejemplo, "A1:C10" o "B2").
   * @returns {boolean} - Verdadero si la celda está dentro del rango, falso en caso contrario.
   */
  static isCellInRange = (cell: string, range: string): boolean => {
    // Validar el formato del rango
    if (!this.isValidRange(range)) {
      throw new Error(`El rango no es válido: ${range}`);
    }

    // Si el rango es una sola celda, ajustamos el rango para que sea válido
    const [start, end] = range.includes(":") ? range.split(":") : [range, range];

    // Parseamos las celdas del rango y la celda a verificar
    const { column: startCol, row: startRow } = this.parseCell(start);
    const { column: endCol, row: endRow } = this.parseCell(end);
    const { column: cellCol, row: cellRow } = this.parseCell(cell);

    // Verificar si la celda está dentro del rango
    const columnInRange = cellCol >= startCol && cellCol <= endCol;
    const rowInRange = cellRow >= startRow && cellRow <= endRow;

    return columnInRange && rowInRange;
  };

  /**
   * Convierte un número de columna en una letra (A, B, C...).
   * @param {number} col - Número de columna.
   * @returns {string} - Letra correspondiente a la columna.
   */
  static getColumnLetter(col: number): string {
    let letter = "";
    while (col > 0) {
      const mod = (col - 1) % 26;
      letter = String.fromCharCode(65 + mod) + letter;
      col = Math.floor((col - 1) / 26);
    }
    return letter;
  }

  /**
   * Crea un rango con nombre en una hoja específica.
   * @param {string} range - El rango en formato string (e.g., "A1:B2").
   * @param {string} name - El nombre del rango.
   * @param {string} sheetName - El nombre de la hoja donde se creará el rango.
   */
  static createNamedRange(range: string, name: string, sheetName: string): void {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet) {
      const namedRanges = sheet.getNamedRanges();
      const namedRange = namedRanges.find((range) => range.getName() === name);
      if (namedRange) {
        namedRange.remove();
      } else {
        // throw new Error(`Named range ${name} not found in sheet ${sheetName}.`);
      }
    } else {
      throw new Error(`Sheet with name ${sheetName} not found.`);
    }
  }

  static adjustRangeForTable(range: string): string {
    const [start, end] = range.split(":");
    const startCell = start.slice(0, 1) + (parseInt(start.slice(1)) + 2);
    const endCell = end.slice(0, 1) + (parseInt(end.slice(1)) - 1);
    return `${startCell}:${endCell}`;
  }

  static getCellA1Notation(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    col: number,
    row: number
  ): string {
    return sheet.getRange(row, col).getA1Notation();
  }

  static showToast = (message: string, title: string = "ℹ️ Información"): void => {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    spreadsheet.toast(message, title);
  };

  static showAlert(
    titleAlert: string | null,
    message: string,
    type: "info" | "warning" | "error" = "info"
  ): void {
    let title = "";
    switch (type) {
      case "info":
        title = "ℹ️ Información";
        break;
      case "warning":
        title = "⚠️ Advertencia";
        break;
      case "error":
        title = "🔴 Error";
        break;
      default:
        title = "ℹ️ Información";
    }

    if (titleAlert) {
      title += " | " + titleAlert;
    }

    const ui = SpreadsheetApp.getUi();
    ui.alert(title, message, ui.ButtonSet.OK);
  }
}

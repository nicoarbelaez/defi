class DropDownUtil {
  /**
   * Crea o reemplaza un dropdown en una celda específica de una hoja de cálculo.
   * Si el rango con nombre no existe o ocurre un error, elimina el dropdown existente.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Hoja donde se insertará el dropdown.
   * @param {string} rangeName - Nombre del rango con nombre que se utilizará como fuente de datos.
   * @param {string} cellRange - El rango de la celda donde se insertará el dropdown (por ejemplo, "B2").
   */
  static createDropDown(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    rangeName: string,
    cellRange: string
  ): void {
    try {
      // Intentar obtener el rango con nombre
      const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName);
      if (!range) {
        throw new Error(`El rango con nombre "${rangeName}" no existe.`);
      }

      // Crear regla de validación de datos con el rango obtenido
      const rule = SpreadsheetApp.newDataValidation().requireValueInRange(range, true).build();

      // Establecer la regla en el rango de celdas especificado
      const cell = sheet.getRange(cellRange);
      cell.setDataValidation(rule);
    } catch (error) {
      console.warn(
        `Error creando dropdown para ${cellRange} con el rango "${rangeName}": ${error.message}`
      );

      // Eliminar dropdown existente si ocurre un error
      this.removeDropDown(sheet, cellRange);
    }
  }

  /**
   * Comprueba si una celda tiene un dropdown (validación de datos).
   * @param {string} sheetName - Nombre de la hoja donde se encuentra la celda.
   * @param {string} cellRange - El rango de la celda donde se desea comprobar si existe un dropdown (por ejemplo, "B2").
   * @returns {boolean} - Devuelve true si la celda tiene un dropdown, false si no lo tiene.
   */
  static hasDropDown(sheet: GoogleAppsScript.Spreadsheet.Sheet, cellRange: string): boolean {
    const cell = sheet.getRange(cellRange);
    const validation = cell.getDataValidation();

    // Comprobar si la celda tiene una validación de datos
    return (
      validation != null &&
      validation.getCriteriaType() === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE
    );
  }

  /**
   * Elimina cualquier validación de datos existente en un rango específico.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Hoja de cálculo.
   * @param {string} cellRange - Rango de la celda donde se eliminará la validación de datos.
   */
  static removeDropDown(sheet: GoogleAppsScript.Spreadsheet.Sheet, cellRange: string): void {
    try {
      const cell = sheet.getRange(cellRange);
      cell.clearDataValidations();
    } catch (error) {
      console.error(`Error eliminando dropdown en el rango ${cellRange}: ${error.message}`);
    }
  }
}

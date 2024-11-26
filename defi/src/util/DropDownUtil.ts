class DropDownUtil {
  /**
   * Crea o reemplaza un dropdown en una celda específica de una hoja de cálculo.
   * @param {string} sheetName - Nombre de la hoja donde se agregará el dropdown.
   * @param {string} rangeName - Nombre del rango con nombre que se utilizará como fuente de datos.
   * @param {string} cellRange - El rango de la celda donde se insertará el dropdown (por ejemplo, "B2").
   */
  static createDropDown(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    rangeName: string,
    cellRange: string
  ): void {
    // Obtener el rango con nombre que contiene las opciones
    const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName);
    if (!range) {
      this.removeDropDown(sheet, cellRange);
      throw new Error(`El rango con nombre ${rangeName} no existe.`);
    }

    const rule = SpreadsheetApp.newDataValidation().requireValueInRange(range, true).build();

    // Establecer la regla de validación de datos en la celda especificada
    const cell = sheet.getRange(cellRange);
    cell.setDataValidation(rule);
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
   * Elimina el dropdown (validación de datos) de una celda específica.
   * @param {string} sheetName - Nombre de la hoja donde se encuentra la celda.
   * @param {string} cellRange - El rango de la celda de donde se eliminará el dropdown (por ejemplo, "B2").
   */
  static removeDropDown(sheet: GoogleAppsScript.Spreadsheet.Sheet, cellRange: string): void {
    const cell = sheet.getRange(cellRange);
    cell.clearDataValidations(); // Eliminar la validación de datos (dropdown)
  }
}

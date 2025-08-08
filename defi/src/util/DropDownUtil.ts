class DropDownUtil {
  /**
   * Crea o reemplaza dropdowns en múltiples celdas de una hoja de cálculo.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Hoja donde se insertarán los dropdowns.
   * @param {string} rangeName - Nombre del rango con nombre que se utilizará como fuente de datos.
   * @param {string[]} cellRanges - Array de rangos donde se insertarán los dropdowns.
   */
  static createDropDown(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    rangeName: string,
    cellRanges: string[]
  ): void {
    try {
      // Intentar obtener el rango con nombre
      const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName);
      if (!range) {
        throw new Error(`El rango con nombre "${rangeName}" no existe.`);
      }

      // Crear regla de validación de datos con el rango obtenido
      const rule = SpreadsheetApp.newDataValidation().requireValueInRange(range, true).build();

      // Si solo hay un rango, procesarlo directamente
      if (cellRanges.length === 1) {
        sheet.getRange(cellRanges[0]).setDataValidation(rule);
        return;
      }

      // Para múltiples rangos, combinarlos en una única operación
      const mergedRange = sheet.getRangeList(cellRanges);
      if (mergedRange) {
        // RangeList does not have setDataValidation, so apply to each range
        mergedRange.getRanges().forEach((range) => range.setDataValidation(rule));
      }
    } catch (error) {
      console.warn(
        `Error creando dropdowns para rangos [${cellRanges.join(
          ", "
        )}] con el rango "${rangeName}": ${error.message}`
      );

      // Eliminar dropdowns existentes si ocurre un error
      cellRanges.forEach((cellRange) => this.removeDropDown(sheet, cellRange));
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

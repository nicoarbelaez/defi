/**
 * Crea validaciones en las celdas especificadas.
 * @param {Array<string>} ranges - Un arreglo con los rangos de las celdas (e.g., ["A1", "B2"]).
 * @param {any} validation - La validación a aplicar.
 * @param {string} sheetName - El nombre de la hoja donde se aplicarán las validaciones.
 */
function createValidations(
  ranges: string[],
  validation: GoogleAppsScript.Spreadsheet.DataValidation,
  sheetName: string
): void {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (sheet) {
    ranges.forEach((range) => {
      const cell = sheet.getRange(range);
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
function deleteValidations(ranges: string[], sheetName: string): void {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (sheet) {
    ranges.forEach((range) => {
      const cell = sheet.getRange(range);
      cell.clearDataValidations(); // Elimina cualquier validación existente
    });
  } else {
    throw new Error(`Sheet with name ${sheetName} not found.`);
  }
}

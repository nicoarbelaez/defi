/**
 * Crea un rango con nombre en una hoja específica.
 * @param {string} range - El rango en formato string (e.g., "A1:B2").
 * @param {string} name - El nombre del rango.
 * @param {string} sheetName - El nombre de la hoja donde se creará el rango.
 */
function createNamedRange(range: string, name: string, sheetName: string): void {
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
function deleteNamedRange(name: string, sheetName: string): void {
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

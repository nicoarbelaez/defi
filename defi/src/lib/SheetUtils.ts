class SheetUtils {
  static getSheetByName(sheetName: string): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`La hoja "${sheetName}" no existe.`);
    }
    return sheet;
  }

  static clearRangeFromCell(startCell: string, sheetName: string): void {
    const sheet = this.getSheetByName(sheetName);
    const startRange = sheet.getRange(startCell);
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    sheet
      .getRange(
        startRange.getRow(),
        startRange.getColumn(),
        lastRow - startRange.getRow() + 1,
        lastColumn - startRange.getColumn() + 1
      )
      .clearContent();
  }
}

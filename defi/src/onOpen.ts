function onOpenHandler() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = sheet.getSheetByName(VariableConst.SHEET_CONFIG);
  const existeConfig: boolean = DocumentPropertiesService.getProperty(VariableConst.CONFIG_KEY);

  if (!configSheet) {
    createConfigurationSheet(sheet);
    checkAndCreateConfig();
  } else {
    existeConfig ?? checkAndCreateConfig();
  }
  insertDataToSheet();

  addDropDowns(sheet);

  createTrigger("onOpenHandler", "onOpen");
  createTrigger("onEditHandler", "onEdit");
}

/**
 * Agrega los dropdowns si no existen en las celdas especificadas.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} sheet - La hoja activa donde se agregarán los dropdowns.
 */
function addDropDowns(sheet: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
  const config = getConfig();

  // Combinar las celdas de todas las tablas de los días
  const allDayCells = config.dayConfig.flatMap((day) => {
    const table1Cells = TableFood.processRangeToUniqueCells(day.ranges.table1);
    const table2Cells = TableFood.processRangeToUniqueCells(day.ranges.table2);
    return [...table1Cells, ...table2Cells];
  });

  const dropdowns = [
    {
      sheetName: VariableConst.SHEET_EXCHANGES,
      rangeName: VariableConst.TABLE_CODES,
      cellRanges: [config.exchangeConfig.foodCode],
    },
    {
      sheetName: VariableConst.SHEET_DIET,
      rangeName: VariableConst.TABLE_CODES,
      cellRanges: allDayCells,
    },
  ];

  dropdowns.forEach((dropdown) => {
    const { sheetName, rangeName, cellRanges } = dropdown;
    const dropdownSheet = SheetUtils.getSheetByName(sheetName);

    if (cellRanges && cellRanges.length > 0) {
      cellRanges.forEach((range) => {
        DropDownUtil.createDropDown(dropdownSheet, rangeName, range);
      });
    }
  });
}
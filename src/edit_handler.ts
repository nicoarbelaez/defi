/**
 * Función que se ejecuta automáticamente cuando se edita la hoja de cálculo.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e - El evento de edición.
 */
function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void {
  handleEdit(e);
}

/**
 * Maneja la lógica de redirección según las necesidades.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e - El evento de edición.
 */
function handleEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  const cellRange = e.range;
  const cellA1 = cellRange.getA1Notation();
  const sheet = cellRange.getSheet();
  const sheetName = sheet.getName();
  const column = cellRange.getColumn();

  interface AllowedRange {
    columns?: LetterInteger[];
    range?: string[];
    functions: Function[];
  }

  interface AllowedRanges {
    [key: string]: AllowedRange;
  }

  const tableFoods: TableFoodRecord = PersistentVariable.getTableFood();

  const allowedRanges: AllowedRanges = {
    [SHEET_TCA]: {
      range: [Utils.getA1AnotationByRangeName(TABLE_TCA)],
      functions: [onEditApi, FoodDataCache.updateCacheOnSheetChange],
    },
    [SHEET_DIET]: {
      range: TableFood.foodTableRanges(tableFoods),
      functions: [handleDietEdit],
    },
    [SHEET_EXCHANGES]: {
      columns: [LetterInteger.C],
      functions: [handleExchangeEdit],
    },
  };

  const allowedRange = allowedRanges[sheetName];
  if (!allowedRange) {
    return;
  }

  const isInRange =
    allowedRange.range &&
    allowedRange.range.some((namedRange) => Utils.isCellInRange(cellA1, namedRange));
  const isInColumn = allowedRange.columns && isWithinColumns(allowedRange.columns, column);

  if (isInRange || isInColumn) {
    allowedRange.functions.forEach((func) => func(e));
  }
}

/**
 * Maneja las ediciones en la hoja de dieta.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e - El evento de edición.
 */
function handleDietEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  const cellRange = e.range;
  const cellA1 = cellRange.getA1Notation();
  const tableFoods: TableFoodRecord = PersistentVariable.getTableFood();

  const tableFood = TableFood.findTableFoodByCell(tableFoods, cellA1);
  if (tableFood) {
    tableFood.addDropdownFood(cellA1);
    tableFood.calculateNutritionalTotals();
    tableFood.insertNutritionalData();
  }

  // Guardar las modificaciones de instancia
  PersistentVariable.setVariable(PERSISTENT_TABLE_FOOD, tableFoods);
}

/**
 * Maneja las ediciones en la hoja de dieta.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e - El evento de edición.
 */
function handleExchangeEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  const cellRange = e.range;
  const cellA1 = cellRange.getA1Notation();
  const tableExchange: TableExchange = PersistentVariable.getTableExchange();

  tableExchange.dropdown(cellA1);
  tableExchange.loadData();
  tableExchange.calculateData();
  tableExchange.storeData();
  
  PersistentVariable.setVariable(PERSISTENT_TABLE_EXCHANGE, tableExchange);
}

/**
 * Verifica si una celda está dentro de las columnas permitidas.
 * @param {number[]} allowedColumns - Las columnas permitidas.
 * @param {number} column - La columna de la celda editada.
 * @returns {boolean} - Verdadero si la celda está dentro de las columnas permitidas, falso en caso contrario.
 */
function isWithinColumns(allowedColumns: number[], column: number): boolean {
  if (!Array.isArray(allowedColumns)) {
    throw new Error("allowedColumns debe ser un array.");
  }
  
  for (let i = 0; i < allowedColumns.length; i++) {
    if (allowedColumns[i] === column) {
      return true;
    }
  }
  
  return false;
}


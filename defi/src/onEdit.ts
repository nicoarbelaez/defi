function onEditHandler(e) {
    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();
    const editedRange = e.range;
  
    // Configuración de hojas y rangos permitidos
    const config = {
      "Hoja 1": {
        rangesFunctionMap: [
          { ranges: ["A1:B2", "B213:Z23"], action: executeFunctionX },
          { ranges: ["Z123:N123"], action: executeFunctionY },
        ],
      },
      "Hoja 2": {
        rangesFunctionMap: [
          { ranges: ["A1:A10"], action: executeFunctionZ },
        ],
      },
    };
  
    // Validación de existencia de configuración para la hoja actual
    if (!config[sheetName]) return;
  
    // Validación de intersección de rangos en la configuración
    if (!validateNonOverlappingRanges(config[sheetName].rangesFunctionMap)) {
      throw new Error(`Los rangos en "${sheetName}" tienen intersección.`);
    }
  
    // Verificar si la celda editada pertenece a un rango permitido y ejecutar la acción correspondiente
    const rangeFunctionMap = config[sheetName].rangesFunctionMap;
    for (const { ranges, action } of rangeFunctionMap) {
      if (isCellInRanges(editedRange, ranges)) {
        action(sheet, editedRange); // Ejecutar la acción asociada
        break;
      }
    }
  }
  
  /**
   * Verifica si una celda pertenece a alguno de los rangos definidos.
   * @param {GoogleAppsScript.Spreadsheet.Range} cellRange - Rango de la celda editada.
   * @param {string[]} ranges - Lista de rangos en notación A1.
   * @returns {boolean} - Verdadero si la celda pertenece a algún rango.
   */
  function isCellInRanges(cellRange, ranges) {
    const editedRow = cellRange.getRow();
    const editedCol = cellRange.getColumn();
  
    return ranges.some((range) => {
      const { startRow, startCol, endRow, endCol } = getRangeBounds(range);
      return (
        editedRow >= startRow &&
        editedRow <= endRow &&
        editedCol >= startCol &&
        editedCol <= endCol
      );
    });
  }
  
  /**
   * Valida que los rangos de cada conjunto no se superpongan.
   * @param {Array} rangesFunctionMap - Configuración de rangos y acciones.
   * @returns {boolean} - Verdadero si no hay intersección de rangos.
   */
  function validateNonOverlappingRanges(rangesFunctionMap) {
    const allRanges = rangesFunctionMap.flatMap(({ ranges }) => ranges);
    for (let i = 0; i < allRanges.length; i++) {
      for (let j = i + 1; j < allRanges.length; j++) {
        if (rangesIntersect(allRanges[i], allRanges[j])) return false;
      }
    }
    return true;
  }
  
  /**
   * Determina si dos rangos en notación A1 se interceptan.
   * @param {string} rangeA - Primer rango.
   * @param {string} rangeB - Segundo rango.
   * @returns {boolean} - Verdadero si los rangos se interceptan.
   */
  function rangesIntersect(rangeA, rangeB) {
    const rectA = getRangeBounds(rangeA);
    const rectB = getRangeBounds(rangeB);
  
    return !(
      rectA.endRow < rectB.startRow ||
      rectA.startRow > rectB.endRow ||
      rectA.endCol < rectB.startCol ||
      rectA.startCol > rectB.endCol
    );
  }
  
  /**
   * Obtiene los límites (fila/columna inicial y final) de un rango en notación A1.
   * @param {string} range - El rango en notación A1.
   * @returns {Object} - Límites del rango.
   */
  function getRangeBounds(range) {
    const [startCell, endCell] = range.split(":");
    const startRange = SpreadsheetApp.getActiveSpreadsheet().getRange(startCell);
    const endRange = endCell
      ? SpreadsheetApp.getActiveSpreadsheet().getRange(endCell)
      : startRange; // Si no hay un rango final, es una sola celda
  
    return {
      startRow: startRange.getRow(),
      startCol: startRange.getColumn(),
      endRow: endRange.getRow(),
      endCol: endRange.getColumn(),
    };
  }
  
  /**
   * Función X de ejemplo.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Hoja activa.
   * @param {GoogleAppsScript.Spreadsheet.Range} range - Celda editada.
   */
  function executeFunctionX(sheet, range) {
    console.log(`Ejecutando función X en la hoja "${sheet.getName()}" para el rango ${range.getA1Notation()}.`);
    // Implementar lógica específica aquí
  }
  
  /**
   * Función Y de ejemplo.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Hoja activa.
   * @param {GoogleAppsScript.Spreadsheet.Range} range - Celda editada.
   */
  function executeFunctionY(sheet, range) {
    console.log(`Ejecutando función Y en la hoja "${sheet.getName()}" para el rango ${range.getA1Notation()}.`);
    // Implementar lógica específica aquí
  }
  
  /**
   * Función Z de ejemplo.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Hoja activa.
   * @param {GoogleAppsScript.Spreadsheet.Range} range - Celda editada.
   */
  function executeFunctionZ(sheet, range) {
    console.log(`Ejecutando función Z en la hoja "${sheet.getName()}" para el rango ${range.getA1Notation()}.`);
    // Implementar lógica específica aquí
  }
  
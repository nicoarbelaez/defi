class TableFood {
  /**
   * Método de utilidad para procesar un rango y generar un array de celdas únicas ajustadas según la lógica descrita.
   * @param {string} range - Rango de celdas en formato "A1:B1".
   * @returns {string[]} - Array de celdas únicas ajustadas según la lógica.
   */
  static processRangeToUniqueCells(range: string): string[] {
    const processedCells: string[] = [];
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const cells = sheet.getRange(range);

    // Obtener las filas y columnas iniciales y finales del rango
    const startRow = cells.getRow();
    const startColumn = cells.getColumn();

    // Ajustar filas (dos filas más abajo desde el inicio)
    const adjustedStartRow = startRow + 2;
    const adjustedEndRow = cells.getLastRow() - 1;

    // Generar las celdas ajustadas
    for (let colOffset = 0; colOffset < 3; colOffset++) {
      const adjustedStartColumn = startColumn + colOffset * 3;
      const adjustedEndColumn = adjustedStartColumn;

      // Crear el rango ajustado para cada desplazamiento
      const adjustedRange = `${Utils.getColumnLetter(
        adjustedStartColumn
      )}${adjustedStartRow}:${Utils.getColumnLetter(adjustedEndColumn)}${adjustedEndRow}`;
      processedCells.push(adjustedRange);
    }

    return processedCells;
  }

  static calculateTotalMicronutrients(
    editedDayItems: Item[]
  ): Omit<Micronutrients, "nameFood" | "homeUnit"> {
    const totalMicronutrients: Omit<Micronutrients, "nameFood" | "homeUnit"> = {
      kcal: 0,
      carb: 0,
      protein: 0,
      fat: 0,
    };

    editedDayItems.forEach((item) => {
      try {
        const micronutrient = Utils.findItemByCodeAndFood(item.code.value, item.food.value);

        if (!micronutrient) {
          console.warn(
            `Micronutriente no encontrado para el alimento: ${item.food.value} con código: ${item.code.value}`
          );
          return;
        }

        const grams = parseFloat(item.grams.value) || 0;

        totalMicronutrients.kcal += Utils.getCalories(grams, micronutrient);
        totalMicronutrients.carb += Utils.getCarbs(grams, micronutrient);
        totalMicronutrients.protein += Utils.getProteins(grams, micronutrient);
        totalMicronutrients.fat += Utils.getFats(grams, micronutrient);
      } catch (error) {
        console.error(
          `Error al procesar el alimento ${item.food.value} con código ${item.code.value}:`,
          error
        );
      }
    });

    return totalMicronutrients;
  }

  static extractTableData(sheet: GoogleAppsScript.Spreadsheet.Sheet, range: string): Item[] {
    const adjustedRange = Utils.adjustRangeForTable(range);
    const rangeData = sheet.getRange(adjustedRange).getValues();
    const firstColumn = sheet.getRange(adjustedRange).getColumn();
    const startRow = sheet.getRange(adjustedRange).getRow();

    const items: Item[] = [];
    rangeData.forEach((rowData, rowIndex) => {
      for (let colOffset = 0; colOffset < 3; colOffset++) {
        const baseCol = firstColumn + colOffset * 3;
        const rowNum = startRow + rowIndex;

        items.push({
          code: {
            value: rowData[colOffset * 3] || "",
            range: Utils.getCellA1Notation(sheet, baseCol, rowNum),
            isDropDown: DropDownUtil.hasDropDown(
              sheet,
              Utils.getCellA1Notation(sheet, baseCol, rowNum)
            ),
          },
          food: {
            value: rowData[colOffset * 3 + 1] || "",
            range: Utils.getCellA1Notation(sheet, baseCol + 1, rowNum),
            isDropDown: DropDownUtil.hasDropDown(
              sheet,
              Utils.getCellA1Notation(sheet, baseCol + 1, rowNum)
            ),
          },
          grams: {
            value: rowData[colOffset * 3 + 2] || "",
            range: Utils.getCellA1Notation(sheet, baseCol + 2, rowNum),
            isDropDown: false, // Asumimos que `grams` no tiene validación
          },
        });
      }
    });

    return items;
  }

  static filterCompleteItems(itemsByDay: Record<string, Item[]>): Record<string, Item[]> {
    const filtered: Record<string, Item[]> = {};

    for (const day in itemsByDay) {
      filtered[day] = itemsByDay[day].filter(
        (item) => item.code.value && item.food.value && item.grams.value
      );
    }

    return filtered;
  }

  static combineDuplicateItems(completeItems: Record<string, Item[]>): Item[] {
    const uniqueItemsMap = new Map<string, Item>();

    for (const day in completeItems) {
      completeItems[day].forEach((item) => {
        const uniqueKey = `${item.code.value}|${item.food.value}`; // Crear clave única basada en `code` y `food`

        if (uniqueItemsMap.has(uniqueKey)) {
          // Si ya existe, suma los gramos
          const existingItem = uniqueItemsMap.get(uniqueKey)!;
          existingItem.grams.value = (
            parseFloat(existingItem.grams.value) + parseFloat(item.grams.value)
          ).toString();
        } else {
          // Si no existe, agrégalo al mapa
          uniqueItemsMap.set(uniqueKey, { ...item });
        }
      });
    }

    // Convertir el mapa a un array y retornarlo
    return Array.from(uniqueItemsMap.values());
  }
}

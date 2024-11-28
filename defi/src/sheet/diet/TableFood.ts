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
          return;
        }

        const grams = item.grams.value.num || 0;

        totalMicronutrients.kcal += Utils.getCalories(grams, micronutrient);
        totalMicronutrients.carb += Utils.getCarbs(grams, micronutrient);
        totalMicronutrients.protein += Utils.getProteins(grams, micronutrient);
        totalMicronutrients.fat += Utils.getFats(grams, micronutrient);

        // Actualizar grams.str con el home unit
        const homeUnit = Utils.getHomeUnit(grams, micronutrient);
        item.grams.value.str = homeUnit ? `${grams}g (${homeUnit})` : `${grams}g`;
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

        const rawGrams = rowData[colOffset * 3 + 2]?.toString() || "";
        const { num, str } = Utils.parseGramsValue(rawGrams);

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
            value: { num, str },
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

        // Aseguramos de hacer una copia profunda del item
        const itemCopy = this.deepClone(item);

        if (!uniqueItemsMap.has(uniqueKey)) {
          // Si no existe, agregar la copia
          uniqueItemsMap.set(uniqueKey, itemCopy);
          return;
        }

        const existingItem = uniqueItemsMap.get(uniqueKey)!;

        // Hacemos una copia del ítem existente antes de modificarlo
        const updatedItem = this.deepClone(existingItem);

        // Realizar la suma de los valores en la copia
        updatedItem.grams.value.num = existingItem.grams.value.num + itemCopy.grams.value.num;

        // Actualizar el mapa con el ítem modificado
        uniqueItemsMap.set(uniqueKey, updatedItem);
      });
    }

    // Convertir el mapa a un array y retornarlo
    return Array.from(uniqueItemsMap.values());
  }

  static deepClone(item: Item): Item {
    // Clonamos el objeto `item` de manera profunda
    return {
      code: { ...item.code }, // Copia superficial de `code`
      food: { ...item.food }, // Copia superficial de `food`
      grams: {
        ...item.grams, // Copia superficial de `grams`
        value: {
          num: item.grams.value.num, // Copia del número de gramos
          str: item.grams.value.str, // Copia del texto de los gramos
        },
      },
    };
  }

  static getItemsByDay(
    config: Config,
    sheet: GoogleAppsScript.Spreadsheet.Sheet
  ): Record<string, Item[]> {
    const itemsByDay: Record<string, Item[]> = {};

    config.dayConfig.forEach((day) => {
      const dayItems: Item[] = [];
      ["table1", "table2"].forEach((tableKey) => {
        const tableRange = day.ranges[tableKey as keyof MealDayData];
        const tableData = TableFood.extractTableData(sheet, tableRange);
        dayItems.push(...tableData);
      });

      itemsByDay[day.day] = dayItems;
    });

    return itemsByDay;
  }
}

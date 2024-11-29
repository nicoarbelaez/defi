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

  static calculateTotalMicronutrients(editedDayItems: Item[][]): TotalMicronutrients {
    const totalMicronutrients: TotalMicronutrients = {
      totalByMeal: [],
      kcal: 0,
      carb: 0,
      protein: 0,
      fat: 0,
    };

    editedDayItems.forEach((meal) => {
      let mealCalories = 0;
      if (meal.length === 0) {
        totalMicronutrients.totalByMeal.push(mealCalories);
        return;
      }
      meal.forEach((item) => {
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

          mealCalories += Utils.getCalories(grams, micronutrient);

          const homeUnit = Utils.getHomeUnit(grams, micronutrient);
          item.grams.value.str = homeUnit ? `${grams}g (${homeUnit})` : `${grams}g`;
        } catch (error) {
          console.error(
            `Error al procesar el alimento ${item.food.value} con código ${item.code.value}:`,
            error
          );
        }
      });
      totalMicronutrients.totalByMeal.push(mealCalories);
    });

    return totalMicronutrients;
  }

  static combineDuplicateItems(completeItems: Record<string, Item[][]>): Item[] {
    const uniqueItemsMap = new Map<string, Item>();

    // Iterar sobre los días y las comidas
    for (const day in completeItems) {
      completeItems[day].forEach((mealItems) => {
        mealItems.forEach((item) => {
          const uniqueKey = `${item.code.value}|${item.food.value}`;

          // Si el ítem no existe, agregarlo
          if (!uniqueItemsMap.has(uniqueKey)) {
            uniqueItemsMap.set(uniqueKey, this.deepClone(item));
          } else {
            // Si existe, acumular los gramos
            const existingItem = uniqueItemsMap.get(uniqueKey)!;
            existingItem.grams.value.num += item.grams.value.num;
          }
        });
      });
    }

    return Array.from(uniqueItemsMap.values());
  }

  static deepClone(item: Item): Item {
    return {
      code: { ...item.code },
      food: { ...item.food },
      grams: {
        ...item.grams,
        value: { ...item.grams.value },
      },
    };
  }

  static filterCompleteItems(itemsByDay: Record<string, Item[][]>): Record<string, Item[][]> {
    const filtered: Record<string, Item[][]> = {};

    for (const day in itemsByDay) {
      filtered[day] = itemsByDay[day].map((mealItems) => {
        return mealItems.filter(
          (item) => item.code.value && item.food.value && item.grams.value.num
        );
      });
    }

    return filtered;
  }

  static getItemsByDay(
    config: Config,
    sheet: GoogleAppsScript.Spreadsheet.Sheet
  ): Record<string, Item[][]> {
    const itemsByDay: Record<string, Item[][]> = {};

    config.dayConfig.forEach((day) => {
      const dayItems: Item[][] = [];
      ["table1", "table2"].forEach((tableKey) => {
        const tableRange = day.ranges[tableKey as keyof MealDayData];
        const tableData = TableFood.extractTableData(sheet, tableRange);

        // Agregar los items de cada comida
        dayItems.push(...tableData);
      });

      itemsByDay[day.day] = dayItems;
    });

    return itemsByDay;
  }

  private static extractTableData(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    range: string
  ): Item[][] {
    // Retornamos un arreglo de arreglos (comidas)
    const adjustedRange = Utils.adjustRangeForTable(range);
    const rangeData = sheet.getRange(adjustedRange).getValues();
    const firstColumn = sheet.getRange(adjustedRange).getColumn();
    const startRow = sheet.getRange(adjustedRange).getRow();

    // Inicializamos tres arreglos vacíos para cada comida
    const meal1: Item[] = [];
    const meal2: Item[] = [];
    const meal3: Item[] = [];

    // Iteramos por cada fila de la tabla
    rangeData.forEach((rowData, rowIndex) => {
      for (let colOffset = 0; colOffset < 3; colOffset++) {
        const baseCol = firstColumn + colOffset * 3; // Calculamos la columna base
        const rowNum = startRow + rowIndex; // Calculamos la fila

        const rawGrams = rowData[colOffset * 3 + 2]?.toString() || "";
        const { num, str } = Utils.parseGramsValue(rawGrams);

        const item: Item = {
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
        };

        // Asignamos el ítem al arreglo correspondiente según la columna
        if (colOffset === 0) {
          meal1.push(item); // Columna A, B, C (comida 1)
        } else if (colOffset === 1) {
          meal2.push(item); // Columna D, E, F (comida 2)
        } else {
          meal3.push(item); // Columna G, H, I (comida 3)
        }
      }
    });

    // Retornamos los tres arreglos como un arreglo de comidas
    return [meal1, meal2, meal3];
  }
}

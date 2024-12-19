const DATE_NOW = Date.now();
function onEditHandler(e: GoogleAppsScript.Events.SheetsOnEdit) {
  DocumentPropertiesService.setProperty(VariableConst.TIME_ONEDIT_KEY, DATE_NOW);
  const cellRange = e.range;
  const cellA1 = cellRange.getA1Notation();
  const sheet = cellRange.getSheet();
  const sheetName = sheet.getName();
  const config = getConfig();

  const rangeConfig = defaultConfig.map((e) => {
    const firstRange = e.content[0].range;
    const lastRange = e.content[e.content.length - 1].range;

    return `${firstRange}:${lastRange}`;
  });

  const allowedRanges = {
    [VariableConst.SHEET_DIET]: {
      range: config.dayConfig.flatMap((day) => [day.ranges.table1, day.ranges.table2]),
      functions: [handleDietEdit],
    },
    [VariableConst.SHEET_EXCHANGES]: {
      range: Object.values(config.exchangeConfig),
      functions: [handleExchangeEdit],
    },
    [VariableConst.SHEET_CONFIG]: {
      range: rangeConfig,
      functions: [handleConfigEdit],
    },
    [VariableConst.SHEET_EXERCISE]: {
      range: extendAndShiftRanges(config.exerciseConfig.rangeDropdown),
      functions: [handleExerciseEdit],
    },
  };

  const allowedRange = allowedRanges[sheetName];
  if (!allowedRange) return;

  if (
    allowedRange.range &&
    allowedRange.range.some((namedRange) => Utils.isCellInRange(cellA1, namedRange))
  ) {
    allowedRange.functions.forEach((func) => func(cellA1));
  }
}

/**
 * Duplica y desplaza un conjunto de rangos hacia la derecha.
 * @param ranges Rango original, por ejemplo ["A1:A5", "C3:C7"].
 * @returns Arreglo extendido y desplazado, por ejemplo ["A1:A5", "C3:C7", "B1:B5", "D3:D7"].
 */
function extendAndShiftRanges(ranges: string[]): string[] {
  const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_EXERCISE);
  const newRanges: string[] = [];

  ranges.forEach((range) => {
    newRanges.push(range); // Mantener el rango original
    const originalRange = sheet.getRange(range);
    const startRow = originalRange.getRow();
    const endRow = originalRange.getLastRow();
    const startCol = originalRange.getColumn();
    const newCol = startCol + 1;

    const shiftedRange = sheet.getRange(startRow, newCol, endRow - startRow + 1, 1).getA1Notation();
    newRanges.push(shiftedRange); // Agregar el rango desplazado
  });

  return newRanges;
}

function handleExerciseEdit(cellA1: string): void {
  const config = getConfig();
  const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_EXERCISE);
  const cellRange = sheet.getRange(cellA1);

  // Verificar si la celda pertenece a un rango de dropdown
  const dropdownRanges = config.exerciseConfig.rangeDropdown;
  const isDropdownCell = dropdownRanges.some((range) => Utils.isCellInRange(cellA1, range));

  if (isDropdownCell) {
    // Crear un dropdown en la celda a la derecha de la editada
    const cellValue = cellRange.getValue();
    if (!cellValue) {
      console.warn(`La celda ${cellA1} está vacía, no se puede crear un dropdown.`);
      return;
    }

    const rangeName = `${VariableConst.PREFIX_EXERCISE_GROUP}_${cellValue
      .toString()
      .toUpperCase()}`;
    const nextColumn = cellRange.getColumn() + 1;
    const nextCell = sheet.getRange(cellRange.getRow(), nextColumn);

    DropDownUtil.createDropDown(sheet, rangeName, nextCell.getA1Notation());
    console.log(`Dropdown creado en ${nextCell.getA1Notation()} con rango ${rangeName}`);
  } else {
    // Obtener el valor de la celda a la izquierda de la editada
    const leftCell = sheet.getRange(cellRange.getRow(), cellRange.getColumn() - 1);
    const leftCellValue = leftCell.getValue();

    if (!leftCellValue) {
      console.warn(`La celda a la izquierda de ${cellA1} está vacía, no se puede procesar.`);
      return;
    }

    const namedRangeValuesName = `${VariableConst.PREFIX_EXERCISE_GROUP}_${leftCellValue
      .toString()
      .toUpperCase()}`;

    try {
      // Obtener valores del rango con nombre asociado a la celda editada
      console.log(namedRangeValuesName);
      const valuesRange = sheet.getRange(namedRangeValuesName).getValues().flat();

      // Buscar el índice basado en el valor de la celda actual
      const cellValue = cellRange.getValue();
      const index = valuesRange.findIndex((value) => value.toString() === cellValue.toString());

      if (index === -1) {
        console.warn(`El valor "${cellValue}" no se encontró en el rango ${namedRangeValuesName}.`);
        return;
      }

      console.log(`El índice del valor "${cellValue}" es ${index}.`);

      // Obtener la URL del rango con nombre
      const namedRangeURLName = `${namedRangeValuesName}_URL`;
      console.log(namedRangeURLName);
      const urlsRange = sheet.getRange(namedRangeURLName).getValues().flat();
      const url = urlsRange[index];

      if (!url) {
        console.warn(
          `No se encontró una URL en el índice ${index} del rango ${namedRangeURLName}.`
        );
        return;
      }

      if (url) {
        const richValue = SpreadsheetApp.newRichTextValue()
          .setText(cellValue.toString()) // Texto de la celda editada
          .setLinkUrl(url) // URL obtenida
          .build();

        cellRange.setRichTextValue(richValue);
        console.log(`Hipervínculo añadido a ${cellA1} con la URL: ${url}`);
      } else {
        const plainText = SpreadsheetApp.newTextStyle()
        .setUnderline(false)
        .setForegroundColor("#000000")
        .build();
        cellRange.setTextStyle(plainText)
      }
    } catch (error) {
      console.error(`Error al procesar ${cellA1}: ${error.message}`);
    }
  }
}

function handleDietEdit(cellA1: string): void {
  const config = getConfig();
  const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_DIET);

  // Obtener el día relacionado con el rango editado
  Utils.showToast("🔍 Analizando", `Buscando coincidencias con el rango editado (${cellA1})`);
  const matchingDay = config.dayConfig.find((day) =>
    Utils.isCellInRange(cellA1, day.ranges.content)
  );
  if (!matchingDay) return;

  Utils.showToast("📋 Procesando tablas", `Recopilando ítems del día ${matchingDay.day}`);
  const allItems = TableFood.getItemsByDay(config, sheet);

  const editedDayItems = allItems[matchingDay.day];

  const completeItems = TableFood.filterCompleteItems(allItems);

  Utils.showToast("📦 Generando listas desplegables", `Día ${matchingDay.day}`);
  const itemsMissingCodeDropdown: Item[][] = editedDayItems.map((mealItems) => {
    return mealItems.filter((item) => !item.code.isDropDown);
  });

  const itemsWithCodeButMissingFoodDropdown: Item[][] = editedDayItems.map((mealItems) => {
    return mealItems.filter((item) => item.code.value);
  });

  itemsWithCodeButMissingFoodDropdown.forEach((mealItems) => {
    mealItems.forEach((item) => {
      const rangeName = `${VariableConst.PREFIX_CODE_FOOD}_${item.code.value}`;
      DropDownUtil.createDropDown(sheet, rangeName, item.food.range);
    });
  });

  Utils.showToast("📦 Agregando listas desplegables de códigos", `Día ${matchingDay.day}`);
  itemsMissingCodeDropdown.forEach((mealItems) => {
    mealItems.forEach((item) => {
      const rangeName = `${VariableConst.TABLE_CODES}_${item.code.value}`;
      DropDownUtil.createDropDown(sheet, rangeName, item.code.range);
    });
  });

  // Deboncue
  const executionTime = DocumentPropertiesService.getProperty(VariableConst.TIME_ONEDIT_KEY);
  if (executionTime != DATE_NOW) {
    // Utils.showToast(`🕒️ Tiempo de espera ${executionTime} = ${DATE_NOW}`);
    return;
  }
  // Utils.showAlert("✅ Ejecutando...", `${executionTime} = ${DATE_NOW}`);
  // Deboncue

  Utils.showToast("📊 Calculando micronutrientes", `Día ${matchingDay.day}`);
  const totalMicronutrients = TableFood.calculateTotalMicronutrients(
    completeItems[matchingDay.day]
  );

  Utils.showToast("✏️ Agregando valores procesados en el día", `Día ${matchingDay.day}`);
  completeItems[matchingDay.day].forEach((mealItems) => {
    mealItems.forEach((item) => {
      if (item.grams.value.num) {
        const grams = item.grams.value.str;
        sheet.getRange(item.grams.range).setValue(grams);
      }
    });
  });

  const micronutrientCell = sheet.getRange(matchingDay.ranges.sumMicronutrients);
  const micronutrientRow = micronutrientCell.getRow();
  const micronutrientCol = micronutrientCell.getColumn();

  sheet.getRange(micronutrientRow, micronutrientCol).setValue(totalMicronutrients.kcal);
  sheet.getRange(micronutrientRow + 1, micronutrientCol).setValue(totalMicronutrients.carb);
  sheet.getRange(micronutrientRow + 2, micronutrientCol).setValue(totalMicronutrients.protein);
  sheet.getRange(micronutrientRow + 3, micronutrientCol).setValue(totalMicronutrients.fat);

  let totalByMealIndex = 0;
  const mealDay = config.dayConfig.find((day) => day.day === matchingDay.day);
  ["table1", "table2"].forEach((tableKey, i) => {
    const tableRange = mealDay.ranges[tableKey as keyof MealDayData];
    if (!tableRange) {
      console.warn(`No se encontró el rango para ${tableKey}`);
      return;
    }

    const rangeCells = sheet.getRange(tableRange);
    const startCol = rangeCells.getColumn() + 2;
    const lastCol = rangeCells.getLastColumn();
    const lastRow = rangeCells.getLastRow();
    for (let col = startCol; col <= lastCol; col += 3) {
      sheet.getRange(lastRow, col).setValue(totalMicronutrients.totalByMeal[totalByMealIndex]);
      totalByMealIndex++;
    }
  });

  const uniqueCombinedItems = TableFood.combineDuplicateItems(completeItems);

  Utils.showToast("✏️ Actualizando listas", `Insertando ítems en las listas de compras`);
  let itemIndex = 0;
  config.listConfig.forEach((range) => {
    const rangeCells = sheet.getRange(range);
    const rangeRows = rangeCells.getNumRows();
    const startRow = rangeCells.getRow();
    const startCol = rangeCells.getColumn();
    const endRow = startRow + rangeRows - 1;

    // Iterar sobre las celdas del rango cada dos filas
    for (let row = startRow; row <= endRow; row += 2) {
      if (itemIndex < uniqueCombinedItems.length) {
        // Si aún hay items, insertar el valor en la celda actual
        const item = uniqueCombinedItems[itemIndex];
        const micronutrient = Utils.findItemByCodeAndFood(item.code.value, item.food.value);
        if (!micronutrient) {
          itemIndex++;
          continue;
        }
        const homeUnit = Utils.getHomeUnit(item.grams.value.num, micronutrient);

        // Construir el valor de forma condicional
        const value = `${item.food.value} ${item.grams.value.num}g${
          homeUnit ? ` (${homeUnit})` : ""
        }`;
        sheet.getRange(row, startCol).setValue(value);

        itemIndex++;
      } else {
        // Limpiar celdas sobrantes si no hay más items
        sheet.getRange(row, startCol).clearContent();
      }
    }
  });
}

function handleExchangeEdit(cellEdit: string) {
  const config = getConfig().exchangeConfig;
  const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_EXCHANGES);

  if (getCellValues(sheet, config.foodCode)[0] !== "") {
    Utils.showToast("Cargando alimentos.", "🛜 Cargando...");
  }

  if (config.foodCode === cellEdit) {
    Object.keys(config)
      .filter((key) => key !== "foodCode")
      .forEach((key) => clearCellValue(sheet, config[key]));

    TableExchange.insertDropdown();
    return;
  }

  const result = TableExchange.calculateExchange();
  if (result) TableExchange.insertData(result);
}

function handleConfigEdit(cellA1: string): void {
  const isConfigValid = checkAndCreateConfig();

  if (isConfigValid) {
    const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_CONFIG);
    sheet.getRange("A2").setValue(Date.now()); // Actualizar A2 solo si la configuración es válida
  }
}

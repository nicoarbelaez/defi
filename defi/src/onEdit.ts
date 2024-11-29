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

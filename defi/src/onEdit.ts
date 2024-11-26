function onEditHandler(e: GoogleAppsScript.Events.SheetsOnEdit) {
  const cellRange = e.range;
  const cellA1 = cellRange.getA1Notation();
  const sheet = cellRange.getSheet();
  const sheetName = sheet.getName();
  const config = getConfig();

  const allowedRanges = {
    [VariableConst.SHEET_DIET]: {
      range: config.dayConfig.flatMap((day) => [day.ranges.table1, day.ranges.table2]),
      functions: [handleDietEdit],
    },
    [VariableConst.SHEET_EXCHANGES]: {
      range: Object.values(config.exchangeConfig),
      functions: [handleExchangeEdit],
    },
  };

  const allowedRange = allowedRanges[sheetName];
  if (!allowedRange) return;

  if (
    allowedRange.range &&
    allowedRange.range.some((namedRange) => Utils.isCellInRange(cellA1, namedRange))
  ) {
    allowedRange.functions.forEach((func) => func(e, cellA1));
  }
}

function handleDietEdit(e: GoogleAppsScript.Events.SheetsOnEdit, cellA1: string): void {
  const config = getConfig();
  const cellRange = e.range;
  const sheet = cellRange.getSheet();

  // Obtener el día relacionado con el rango editado
  const matchingDay = config.dayConfig.find((day) =>
    Utils.isCellInRange(cellA1, day.ranges.content)
  );
  if (!matchingDay) return;

  // Procesar datos de las tablas para todos los días
  const allItems = getItemsByDay(config, sheet);

  // Determinar el día editado y procesar sus tablas
  const editedDayItems = allItems[matchingDay.day];

  // Filtrar ítems incompletos (sin `code`, `food` o `grams`)
  const completeItems = TableFood.filterCompleteItems(allItems);

  // Crear un array único combinando ítems duplicados en todos los días
  const uniqueCombinedItems = TableFood.combineDuplicateItems(completeItems);

  // Crear objetos filtrados para el día editado
  const itemsMissingCodeDropdown = editedDayItems.filter((item) => !item.code.isDropDown);
  const itemsWithCodeButMissingFoodDropdown = editedDayItems.filter(
    (item) => item.code.value && !item.food.isDropDown
  );

  const totalMicronutrients = TableFood.calculateTotalMicronutrients(
    completeItems[matchingDay.day]
  );

  // Imprimir resultados en consola
  // console.log(JSON.stringify(allItems, null, 1));
  console.log(JSON.stringify(completeItems, null, 1));
  console.log(JSON.stringify(uniqueCombinedItems, null, 1));
  console.log(JSON.stringify(itemsMissingCodeDropdown, null, 1));
  console.log(JSON.stringify(itemsWithCodeButMissingFoodDropdown, null, 1));
  console.log({ totalMicronutrients });
}

function getItemsByDay(
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

function handleExchangeEdit(e: GoogleAppsScript.Events.SheetsOnEdit, cellEdit: string) {
  const config = getConfig().exchangeConfig;
  const sheet = e.source.getActiveSheet();

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

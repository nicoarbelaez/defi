const insertDataToSheet = (): void => {
  const CONFIG_SHEET_NAME = "Configuración";
  const START_CELL = "H2";
    // SheetUtils.clearRangeFromCell(START_CELL, CONFIG_SHEET_NAME);
  const db = getDataBase(); // Obtener datos de la base de datos

  const sheet = SheetUtils.getSheetByName(CONFIG_SHEET_NAME);

  // Insertar `codes`
  const codesRange = sheet.getRange(START_CELL);
  codesRange.setValue("codes");
  const codes = db.codes;
  const codesRangeData = sheet.getRange(
    codesRange.getRow() + 1,
    codesRange.getColumn(),
    codes.length,
    1
  );
  codesRangeData.setValues(codes.map((code) => [code]));

  const codesRangeAddress = `${codesRangeData.getA1Notation()}`;
  createNamedRange(codesRangeAddress, "codes", CONFIG_SHEET_NAME);

  // Insertar `items`
  db.items.forEach((item, index) => {
    const columnOffset = codesRange.getColumn() + index + 1;
    const headerRange = sheet.getRange(codesRange.getRow(), columnOffset);
    headerRange.setValue(item.code);

    const dataRange = sheet.getRange(codesRange.getRow() + 1, columnOffset, item.food.length, 1);
    const foodNames = item.food.map((food) => [food.nameFood]);
    dataRange.setValues(foodNames);

    const itemRangeAddress = `${dataRange.getA1Notation()}`;
    createNamedRange(itemRangeAddress, item.code, CONFIG_SHEET_NAME);
  });
};

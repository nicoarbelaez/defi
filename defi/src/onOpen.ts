function onOpen() {
  const ui = SpreadsheetApp.getUi(); // Obtener la UI de la hoja de cálculo.

  // Verificar si el proyecto ha sido inicializado utilizando propiedades del documento
  const isInitialized = DocumentPropertiesService.getProperty("projectInitialized");

  if (!isInitialized) {
    Utils.showAlert(
      "🚀 Proyecto no inicializado",
      "🔴 Estado: No se han inicializado los triggers necesarios.\n\n" +
        "👉 Sigue estos pasos para inicializar el proyecto:\n\n" +
        "1️⃣ Presiona: `Ctrl + Alt + Shift + 1`\n" +
        "   o\n" +
        "2️⃣ Activa el macro manualmente:\n" +
        "   - Ve a Extensiones (en la barra superior).\n" +
        "   - Selecciona Macros.\n" +
        "   - Haz clic en Iniciar triggers.\n\n" +
        "⚠️ Importante: Sin estos triggers, el proyecto no funcionará.",
      "info"
    );
  }
}

/**
 * Inicializa el proyecto creando los triggers necesarios y marcándolo como inicializado.
 */
function initializeProject() {
  try {
    // Crear los triggers
    createTrigger("onOpenHandler", "onOpen");
    createTrigger("onEditHandler", "onEdit");

    // Marcar el proyecto como inicializado
    DocumentPropertiesService.setProperty("projectInitialized", true);

    // Confirmación visual
    Utils.showToast("✅ Proyecto inicializado correctamente.", "Éxito");
  } catch (error) {
    Utils.showToast(`❌ Error al inicializar el proyecto: ${error.message}`, "Error");
    throw error;
  }
}

/**
 * Elimina la marca de inicialización y limpia los triggers.
 */
function resetInitialization() {
  // Eliminar triggers
  deleteTrigger("onOpenHandler", "onOpen");
  deleteTrigger("onEditHandler", "onEdit");

  // Quitar la propiedad de inicialización
  DocumentPropertiesService.deleteProperty("projectInitialized");

  // Confirmación visual
  Utils.showToast("🗑️ Inicialización del proyecto restablecida.", "Info");
}

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
      sheetName: VariableConst.SHEET_EXERCISE,
      rangeName: VariableConst.MUSCLE_GROUP_RANGE,
      cellRanges: config.exerciseConfig.rangeDropdown,
    },
    {
      sheetName: VariableConst.SHEET_EXERCISE.replace("1", "2"),
      rangeName: VariableConst.MUSCLE_GROUP_RANGE,
      cellRanges: config.exerciseConfig.rangeDropdown,
    },
    {
      sheetName: VariableConst.SHEET_EXERCISE.replace("1", "3"),
      rangeName: VariableConst.MUSCLE_GROUP_RANGE,
      cellRanges: config.exerciseConfig.rangeDropdown,
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

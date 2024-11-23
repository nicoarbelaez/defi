function onOpenHandler() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = sheet.getSheetByName("Configuración");
  const existeConfig: boolean = DocumentPropertiesService.getProperty("config");

  if (!configSheet) {
    createConfigurationSheet(sheet);
    checkAndCreateConfig();
    insertDataToSheet();
  } else {
    existeConfig ?? checkAndCreateConfig();
  }
}

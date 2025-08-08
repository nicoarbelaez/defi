function generateResponse(): string {
  const { items, codes } = getItemsAndCodes();
  const exerciseDatabase = getExerciseDatabase();
  const intensificationTechniques = getIntensificationTechniques();
  const lastUpdate = new Date().toISOString();

  const response: DoGetResponse = {
    lastUpdate,
    items,
    codes,
    baseGrams: 100,
    exerciseDatabase,
    intensificationTechniques,
  };

  PropertiesService.getDocumentProperties().setProperty("lastUpdate", lastUpdate);

  // Escribimos en la hoja "db" la última modificación
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("db");
  if (sh) {
    sh.getRange("A1").setValue(lastUpdate);
  } else {
    console.warn("Hoja 'db' no encontrada, no se puede escribir última actualización.");
  }

  return JSON.stringify(response);
}

function getResponse(): string {
  const documentProperties = PropertiesService.getDocumentProperties();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("db");

  // Obtener valor en A1 (si la hoja existe)
  const sheetTimestamp = sheet ? sheet.getRange("A1").getValue().toString() : null;

  let cachedData = documentProperties.getProperty("cachedData");
  let needsUpdate = false;

  if (!cachedData) {
    // No hay cache → generar totalmente
    needsUpdate = true;
  } else {
    try {
      const parsed = JSON.parse(cachedData);
      const lastUpdate = parsed.lastUpdate;
      // Compara valor de hoja con el último update guardado
      if (sheetTimestamp !== lastUpdate) {
        needsUpdate = true;
      }
    } catch (err) {
      // JSON inválido → regenerar
      needsUpdate = true;
    }
  }

  if (needsUpdate) {
    cachedData = generateResponse(); // también actualiza A1
    documentProperties.setProperty("cachedData", cachedData);
  }

  return cachedData;
}

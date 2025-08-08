function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  const jsonResponse = getResponse();
  return ContentService.createTextOutput(jsonResponse).setMimeType(ContentService.MimeType.JSON);
}

function updateDataAndModel(): void {
  const newResponse = generateResponse();
  PropertiesService.getDocumentProperties().setProperty("cachedData", newResponse);

  SpreadsheetApp.getActive().toast(`Datos guardados correctamente`, "✅ ¡Guardado con éxito!");

  createEntityRelationshipModel();
}

function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void {
  const sheetName = e.source.getActiveSheet().getName();
  // Eliminar "db" de las hojas a observar
  const sheetsToWatch = ["#Ejercicios", "Enlaces"];

  if (sheetsToWatch.includes(sheetName)) {
    const debouncedFunction = debounce("updateData", updateDataAndModel, 3500);

    debouncedFunction(e);
  }
}

function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  const jsonResponse = getResponse();
  return ContentService.createTextOutput(jsonResponse).setMimeType(ContentService.MimeType.JSON);
}

function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void {
  const sheetName = e.source.getActiveSheet().getName();
  const sheetsToWatch = ["db", "Ejercicios"];

  if (sheetsToWatch.includes(sheetName)) {
    const debouncedFunction = debounce(
      "updateData",
      () => {
        const newResponse = generateResponse();
        PropertiesService.getDocumentProperties().setProperty("cachedData", newResponse);

        SpreadsheetApp.getActive().toast(
          `Datos guardados correctamente`,
          "✅ ¡Guardado con éxito!"
        );
      },
      2000
    );

    debouncedFunction(e);
  }
}

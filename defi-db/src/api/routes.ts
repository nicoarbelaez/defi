function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  const jsonResponse = getResponse();
  return ContentService.createTextOutput(jsonResponse).setMimeType(ContentService.MimeType.JSON);
}

function onEdit(e): void {
  const sheetName = e.source.getActiveSheet().getName();

  if (sheetName === "db") {
    const debouncedFunction = debounce(
      "updateData",
      () => {
        const data = getDataFromSheet();
        updatePropertiesService(data);
      },
      2000
    );

    debouncedFunction(e);
  }
}

function doGet(e): GoogleAppsScript.Content.TextOutput {
  const jsonResponse = getResponse();
  return ContentService.createTextOutput(jsonResponse).setMimeType(ContentService.MimeType.JSON);
}

function onEdit(e): void {
  const sheetName = e.source.getActiveSheet().getName();

  if (sheetName === "db") {
    debounce(
      "updateData",
      () => {
        const data = getDataFromSheet();
        updatePropertiesService(data);
      },
      1000
    )(e);
  }
}

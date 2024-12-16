function generateResponse(): string {
  const { items, codes } = getItemsAndCodes();
  const exerciseDatabase = getExerciseDatabase();

  const response: DoGetResponse = {
    lastUpdate: new Date().toISOString(),
    items,
    codes,
    baseGrams: 100,
    exerciseDatabase,
  };

  return JSON.stringify(response);
}

function getResponse(): string {
  const documentProperties = PropertiesService.getDocumentProperties();
  let cachedData = documentProperties.getProperty("cachedData");

  if (!cachedData) {
    cachedData = generateResponse();
    documentProperties.setProperty("cachedData", cachedData);
  }

  return cachedData;
}

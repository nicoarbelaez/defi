function getResponse(): string {
  const documentProperties = PropertiesService.getDocumentProperties();
  let data = documentProperties.getProperty("cachedData");

  if (!data) {
    data = getDataFromSheet();
    updatePropertiesService(data);
  }

  return data;
}

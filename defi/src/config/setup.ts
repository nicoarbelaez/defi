function createConfigurationSheet(sheet: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
  const configSheet = sheet.insertSheet("Configuración");
  if (!configSheet) throw new Error("No se pudo crear la hoja de configuración.");

  const processCell = (cell: Cell): void => {
    setCellValue(configSheet, cell.range, cell.value);
    setCellAlignment(configSheet, cell.range, cell.styles?.alignment);
    setCellBackground(configSheet, cell.range, cell.styles?.background);
    setCellBorders(configSheet, cell.range, cell.styles?.border);
  };

  defaultConfig.forEach((section) => {
    processCell(section.title); // Procesar título
    section.subtitle.forEach(processCell); // Procesar subtítulos
    section.content.forEach(processCell); // Procesar contenido
  });

  showToast("✅ Configuración completada.");
}

const checkAndCreateConfig = (): void => {
  const invalidFields: { name: string; range: string }[] = [];

  const config = getConfig();

  config.forEach((section) => {
    section.content.forEach((content) => {
      if (content.modifiable && !isValidRange(joinCellValue(content))) {
        const fieldName = content.value ? joinCellValue(content) : "Campo sin nombre ";
        invalidFields.push({
          name: fieldName,
          range: content.range,
        });
      }
    });
  });

  if (invalidFields.length > 0) {
    let invalidDetails = invalidFields
      .map((field) => `• El rango "${field.name}" en la celda (${field.range})`)
      .join("\n")
      .concat(
        "\n\nRevise la configuración e intente nuevamente o elimine la hoja de configuración y recargue la página."
      );
    showAlert("Configuraicón invalida", invalidDetails, "error");
    DocumentPropertiesService.deleteProperty("config");
  } else {
    DocumentPropertiesService.setProperty("config", config);
    showToast(
      "✅ La configuración es correcta",
      "La configuración se ha guardado correctamente en el documento."
    );
  }
};

const getConfig = (): Config => {
  const configSheet = SheetUtils.getSheetByName("Configuración");

  const updatedConfig: Config = defaultConfig.map((section) => {
    // Procesar títulos
    const updatedTitle: Cell = {
      ...section.title,
      value: [{ text: configSheet.getRange(section.title.range).getValue() }],
    };

    // Procesar subtítulos
    const updatedSubtitle: Cell[] = section.subtitle.map((subtitle) => ({
      ...subtitle,
      value: [{ text: configSheet.getRange(subtitle.range).getValue() }],
    }));

    // Procesar contenido
    const updatedContent: Cell[] = section.content.map((content) => ({
      ...content,
      value: [{ text: configSheet.getRange(content.range).getValue() }],
    }));

    // Construir sección actualizada
    return {
      ...section,
      title: updatedTitle,
      subtitle: updatedSubtitle,
      content: updatedContent,
    };
  });

  return updatedConfig;
};

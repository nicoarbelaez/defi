function createConfigurationSheet(sheet: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
  try {
    Utils.showToast("⚙️ Iniciando creación de hoja de configuración", "Por favor espera...");

    const configSheet = sheet.insertSheet(VariableConst.SHEET_CONFIG);
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

    Utils.showToast("✅ Hoja de configuración creada correctamente.", "Operación exitosa.");
  } catch (error) {
    Utils.showAlert("❌ Error al crear configuración", error.message, "error");
    throw error;
  }
}

function checkAndCreateConfig(): boolean {
  try {
    Utils.showToast("🔍 Verificando configuración", "Validando integridad de los datos...");

    const config = getConfig();

    validateConfig(config);

    Utils.showToast(
      "✅ Configuración verificada",
      "La configuración es válida y está actualizada."
    );

    return true;
  } catch (error) {
    Utils.showAlert("❌ Configuración inválida", error.message, "error");
    DocumentPropertiesService.deleteProperty(VariableConst.CONFIG_KEY);

    return false;
  }
}

/**
 * Valida la configuración completa según la interfaz Config.
 * @param {Config} config - La configuración a validar.
 * @throws {Error} - Lanza un error con detalles si la configuración es inválida.
 */
const validateConfig = (config: Config): void => {
  const invalidFields: string[] = [];

  // Validar dayConfig (MealPlan[])
  config.dayConfig.forEach((dayPlan, index) => {
    const ranges = dayPlan.ranges;
    if (!ranges || typeof ranges !== "object") {
      invalidFields.push(`${dayPlan.day}.ranges: debe ser un objeto válido`);
    } else {
      // Validar el formato de los valores de cada rango usando Utils.isValidRange
      const rangeKeys = ["content", "sumMicronutrients", "table1", "table2"];
      rangeKeys.forEach((key) => {
        if (ranges[key] && !Utils.isValidRange(ranges[key])) {
          invalidFields.push(
            `${dayPlan.day}.ranges.${key} [${ranges[key]}]: debe tener un formato de celda válido`
          );
        }
      });
    }
  });

  // Validar listConfig (string[])
  if (!Array.isArray(config.listConfig)) {
    invalidFields.push("listConfig: debe ser un array de strings");
  } else {
    config.listConfig.forEach((item, index) => {
      if (!item || !Utils.isValidRange(item)) {
        invalidFields.push(`listConfig[${index + 1}]: debe tener un formato de celda válido`);
      }
    });
  }

  // Validar exchangeConfig (ExchangeConfig)
  const exchange = config.exchangeConfig;
  if (!exchange || typeof exchange !== "object") {
    invalidFields.push("exchangeConfig: debe ser un objeto válido");
  } else {
    const exchangeKeys = [
      "foodCode",
      "foodToBeExchanged",
      "targetQuantity",
      "equivalentFood",
      "equivalentPortion",
      "homeMeasurement",
    ];

    exchangeKeys.forEach((key) => {
      if (exchange[key] && !Utils.isValidRange(exchange[key])) {
        invalidFields.push(`exchangeConfig.${key}: debe tener un formato de celda válido`);
      }
    });
  }

  // Si hay campos inválidos, lanza un error con los detalles
  if (invalidFields.length > 0) {
    const errorMessage = `❌ La configuración contiene errores:\n\n${invalidFields.join("\n")}`;
    throw new Error(errorMessage);
  }
};

function getConfig(): Config {
  const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_CONFIG);
  const lastUpdateFromSheet = sheet.getRange("A2").getValue();

  let config: Config = DocumentPropertiesService.getProperty(VariableConst.CONFIG_KEY);

  if (config?.lastUpdate === lastUpdateFromSheet) {
    return config;
  }

  config = {
    dayConfig: [],
    listConfig: [],
    exchangeConfig: {
      foodCode: "",
      foodToBeExchanged: "",
      targetQuantity: "",
      equivalentFood: "",
      equivalentPortion: "",
      homeMeasurement: "",
    },
    lastUpdate: lastUpdateFromSheet,
    exerciseConfig: {
      tabla: "",
      rangeDropdown: [],
    },
  };

  const sheetConfig: ConfigTable = defaultConfig.map(generateUpdatedConfigSection);

  sheetConfig.forEach((section) => {
    switch (section.name) {
      case "day-config":
        config.dayConfig = processDayConfig(section.content);
        break;
      case "list-config":
        config.listConfig = processListConfig(section.content);
        break;
      case "exchange-config":
        config.exchangeConfig = processExchangeConfig(section.content);
        break;
      case "exercise-config":
        config.exerciseConfig = processExerciseConfig(section.content);
        break;
    }
  });

  DocumentPropertiesService.setProperty(VariableConst.CONFIG_KEY, JSON.stringify(config));

  return config;
}

/**
 * Procesa la configuración
 * @param content Lista de celdas con los valores de la configuración.
 * @returns Un array de objetos `MealPlan`.
 */
const processDayConfig = (content: Cell[]): MealPlan[] => {
  const mealPlanArray: MealPlan[] = [];
  let mealPlan: MealPlan = {
    day: "",
    ranges: { content: "", sumMicronutrients: "", table1: "", table2: "" },
  };

  let currentRangeIndex = 0;
  const rangeKeys = ["content", "sumMicronutrients", "table1", "table2"] as const;

  content.forEach((cell) => {
    if (!cell.modifiable && mealPlan.day === "") {
      mealPlan.day = joinCellValue(cell);
      currentRangeIndex = 0;
    } else {
      const key = rangeKeys[currentRangeIndex];
      mealPlan.ranges[key] = joinCellValue(cell);
      currentRangeIndex++;

      if (currentRangeIndex === rangeKeys.length) {
        mealPlanArray.push(mealPlan);
        mealPlan = {
          day: "",
          ranges: { content: "", sumMicronutrients: "", table1: "", table2: "" },
        };
        currentRangeIndex = 0;
      }
    }
  });

  if (mealPlan.day !== "" || currentRangeIndex > 0) {
    mealPlanArray.push(mealPlan);
  }

  return mealPlanArray;
};

/**
 * Procesa la configuración de listas de compras.
 * @param content Lista de celdas con los valores de la configuración de listas.
 * @returns Un array de strings representando los ítems de la lista.
 */
const processListConfig = (content: Cell[]): string[] => {
  return content.filter((cell) => cell.modifiable).map((cell) => joinCellValue(cell));
};

/**
 * Procesa la configuración de intercambios.
 * @param content Lista de celdas con los valores de la configuración de intercambios.
 * @returns Un objeto `ExchangeConfig` con los valores asignados.
 */
const processExchangeConfig = (content: Cell[]): ExchangeConfig => {
  const exchangeConfig: ExchangeConfig = {
    foodCode: "",
    foodToBeExchanged: "",
    targetQuantity: "",
    equivalentFood: "",
    equivalentPortion: "",
    homeMeasurement: "",
  };

  const keys: (keyof ExchangeConfig)[] = Object.keys(exchangeConfig) as (keyof ExchangeConfig)[];

  // Contador manual para recorrer los keys
  let keyIndex = 0;

  content.forEach((cell) => {
    if (keyIndex < keys.length && cell.modifiable) {
      const key = keys[keyIndex];
      const value = joinCellValue(cell);

      // Solo asignamos si la celda tiene un valor
      if (value) {
        exchangeConfig[key] = value;
        keyIndex++; // Solo aumentamos el índice cuando un campo es llenado
      }
    }
  });

  // Verificación para asegurarse de que todos los campos hayan sido llenados correctamente
  for (const key of keys) {
    if (!exchangeConfig[key]) {
      console.warn(`El campo ${key} no ha sido completado correctamente.`);
    }
  }

  return exchangeConfig;
};

/**
 * Procesa la configuración de ejercicios.
 * @param content Lista de celdas con los valores de la configuración de ejercicios.
 * @returns Un objeto con los valores de la tabla y el rango del dropdown.
 */
const processExerciseConfig = (content: Cell[]): { tabla: string; rangeDropdown: string[] } => {
  const exerciseConfig = {
    tabla: "",
    rangeDropdown: [] as string[],
  };

  content.forEach((cell) => {
    if (cell.modifiable) {
      const value = joinCellValue(cell);

      exerciseConfig.tabla = value; // Rango de la tabla, por ejemplo "B3:W16"
      exerciseConfig.rangeDropdown = generateDropdownRange(value); // Genera el rango para dropdown
    }
  });

  return exerciseConfig;
};

/**
 * Genera el rango para el dropdown basado en el rango de la tabla.
 * @param tableRange El rango de la tabla, por ejemplo "B3:W16".
 * @returns El rango para el dropdown, por ejemplo "B7:B14".
 */
const generateDropdownRange = (tableRange: string): string[] => {
  const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_CONFIG);

  const range = sheet.getRange(tableRange);

  const startRow = range.getRow();
  const startColumn = range.getColumn();
  const lastRow = range.getLastRow();

  const dropdownStartRow = startRow + 4;
  const dropdownEndRow = lastRow - 2;

  const dropdownCells: string[] = [];

  for (let row = dropdownStartRow; row <= dropdownEndRow; row++) {
    const cell = `${sheet.getRange(row, startColumn).getA1Notation()}`;
    dropdownCells.push(cell);
  }

  return dropdownCells;
};

/**
 * Genera un nuevo objeto ConfigTableSection con valores actualizados desde la hoja de cálculo.
 * @param {ConfigTableSection} configSection - El objeto de configuración original.
 * @param {GoogleSheet} sheet - Hoja de cálculo para obtener los valores.
 * @returns {ConfigTableSection} - El nuevo objeto con valores actualizados.
 */
function generateUpdatedConfigSection(configSection: ConfigTableSection): ConfigTableSection {
  const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_CONFIG);
  // Crear una copia profunda del objeto original para no modificarlo directamente
  const newConfigSection: ConfigTableSection = JSON.parse(JSON.stringify(configSection));

  // Iterar sobre el contenido del objeto
  newConfigSection.content = configSection.content.map((item) => {
    if (item.modifiable) {
      // Obtener el nuevo valor desde la hoja de cálculo usando el rango
      const newValue = sheet.getRange(item.range).getValue();
      return {
        ...item,
        value: [{ text: newValue }],
      };
    }
    return item; // Retornar el item sin modificar si no es modificable
  });

  return newConfigSection;
}

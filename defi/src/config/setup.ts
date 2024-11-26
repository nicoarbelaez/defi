function createConfigurationSheet(sheet: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
  try {
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

    Utils.showToast("✅ Configuración completada.");
  } catch (error) {
    Utils.showAlert("Error al crear configuración", error.message, "error");
    throw error; // Propagar el error para manejarlo más arriba si es necesario
  }
}

const checkAndCreateConfig = (): void => {
  try {
    const config = getConfig();

    // Validar la configuración obtenida
    validateConfig(config);

    // Si la configuración es válida, la guardamos
    DocumentPropertiesService.setProperty("config", JSON.stringify(config));
    Utils.showToast(
      "✅ La configuración es correcta",
      "La configuración se ha guardado correctamente en el documento."
    );
  } catch (error) {
    // Si hay un error (por ejemplo, validación fallida), mostramos el detalle
    Utils.showAlert("Configuración inválida", error.message, "error");
    DocumentPropertiesService.deleteProperty("config");
  }
};

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
            `${dayPlan.day}.ranges.${key} ${ranges[key]}: debe tener un formato de celda válido`
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

// Modificar
function getConfig(): Config {
  const config: Config = {
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
  };

  defaultConfig.forEach((section) => {
    const nameConfig = section.name;
    const content = section.content;

    if (nameConfig === "day-config") {
      config.dayConfig = processDayConfig(content);
    } else if (nameConfig === "list-config") {
      config.listConfig = processListConfig(content);
    } else if (nameConfig === "exchange-config") {
      config.exchangeConfig = processExchangeConfig(content);
    }
  });
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

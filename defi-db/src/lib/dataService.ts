function getDataFromSheet(): string {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("db");
    if (!sheet) {
      throw new Error("La hoja 'db' no existe. Verifique el archivo.");
    }

    const data = sheet.getDataRange().getValues();
    if (!data || data.length <= 1) {
      throw new Error("La hoja 'db' no contiene datos o está vacía.");
    }

    const response: ResponseDoGet = {
      lastUpdate: Date.now().toString(),
      baseGrams: 100,
      codes: [],
      items: [],
    };

    data.slice(1).forEach((row, index) => {
      try {
        const code: string = row[0]?.toString().trim();
        if (!code || ["Código", "", "1"].includes(code)) {
          return;
        }

        const homeUnitParts: string[] = row[6]?.toString().split(" ");
        const homeUnitValue = parseFloat(homeUnitParts[0]?.replace(",", ".") || "0");
        const homeUnitString = homeUnitParts.slice(1).join(" ") || "";

        const micronutrients: Micronutrients = {
          nameFood: row[1],
          kcal: row[2],
          carb: row[3],
          protein: row[4],
          fat: row[5],
          homeUnit: {
            value: homeUnitValue,
            unit: homeUnitString,
          },
        };

        if (!response.codes.includes(code)) {
          response.codes.push(code);
        }

        let item = response.items.find((item) => item.code === code);
        if (item) {
          item.food.push(micronutrients);
        } else {
          response.items.push({
            code,
            food: [micronutrients],
          });
        }
      } catch (innerError) {
        Logger.log(`Error procesando fila ${index + 2}: ${innerError.message}`);
      }
    });

    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
    SpreadsheetApp.getActive().toast(
      `Datos guardados correctamente el ${formattedDate}`,
      "✅ ¡Guardado con éxito!"
    );

    return JSON.stringify(response);
  } catch (error) {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      "⚠️ Error al cargar datos",
      `Hubo un problema cargando los datos de la hoja "db". Por favor contacte al administrador.\n\nError: ${error.message}`,
      ui.ButtonSet.OK
    );
    throw error;
  }
}

function updatePropertiesService(data: string): void {
  const documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty("cachedData", data);
}

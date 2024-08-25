const TABLE_TCA = "DB_TCA";
const CACHE_DB = "DB_TCA_JSON";
const SHEET_TCA = "TCA";

enum Letters {
  A = 0,
  B,
  C,
  D,
  E,
  F,
  G,
}

interface Ingredient {
  code: string;
  food: string;
  kcal: number;
  carb: number;
  protein: number;
  fat: number;
  homeUnit: string;
};

// /**
//  * Función que se ejecuta cuando se edita una celda en la hoja de cálculo.
//  * @param {GoogleAppsScript.Events.SheetsOnEdit} e - Evento de edición.
//  */
// function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void {
//   const sheet = e.source.getActiveSheet();
//   if (sheet.getName() === SHEET_TCA) {
//     const jsonData = getDataAsJson();
//     setDataJsonToCache(jsonData);
//     SpreadsheetApp.getActiveSpreadsheet().toast(
//       "Datos cargados al caché",
//       "Actualización de Caché",
//       5
//     );
//   }
// }

/**
 * Sin API
 */
function onEditApi(e: GoogleAppsScript.Events.SheetsOnEdit): void {
  const sheet = e.source.getActiveSheet();
  if (sheet.getName() === SHEET_TCA) {
    const jsonData = getDataAsJson();
    setDataJsonToCache(jsonData);
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Datos cargados al caché",
      "Actualización de Caché",
      5
    );
  }
}

// /**
//  * Función para manejar solicitudes GET y devolver el JSON generado.
//  * @return {GoogleAppsScript.Content.TextOutput} - Salida HTML con el JSON.
//  */
// function doGet(): GoogleAppsScript.Content.TextOutput {
//   try {
//     const jsonData = getOrCreateDataJson();
//     const jsonOutput = JSON.stringify(jsonData, null, 2);
//     return ContentService.createTextOutput(jsonOutput).setMimeType(ContentService.MimeType.JSON);
//   } catch (error) {
//     return ContentService.createTextOutput(JSON.stringify({ error: error.message })).setMimeType(
//       ContentService.MimeType.JSON
//     );
//   }
// }

/**
 * Sin API
 */
function doGetApi(): { [key: string]: Ingredient[] } {
  const jsonData = getOrCreateDataJson();
  return jsonData;
}

/**
 * Obtiene el JSON de la base de datos desde el caché, o lo crea si no existe o está vacío.
 * @return {Object} - Objeto JSON con los datos de la hoja de cálculo.
 */
function getOrCreateDataJson(): { [key: string]: Ingredient[] } {
  let jsonData = getDataJsonFromCache();
  if (!jsonData || Object.keys(jsonData).length === 0) {
    jsonData = getDataAsJson();
    setDataJsonToCache(jsonData);
  }
  return jsonData;
}

/**
 * Obtiene el JSON de la base de datos desde el caché, si existe.
 * @return {Object|null} - Objeto JSON con los datos de la hoja de cálculo o null si no existe en el caché.
 */
function getDataJsonFromCache(): { [key: string]: Ingredient[] } | null {
  const cache = CacheService.getScriptCache();
  const jsonString = cache.get(CACHE_DB);

  if (!jsonString) {
    return null;
  }

  return JSON.parse(jsonString);
}

/**
 * Guarda el JSON de la base de datos en el caché.
 * @param {Object} jsonData - Objeto JSON con los datos de la hoja de cálculo.
 */
function setDataJsonToCache(jsonData: { [key: string]: Ingredient[] }): void {
  const cache = CacheService.getScriptCache();
  const jsonString = JSON.stringify(jsonData);
  cache.put(CACHE_DB, jsonString, 21600); // 6 horas de caché
}

/**
 * Obtiene los datos de la hoja de cálculo y los convierte en JSON.
 * @return {Object} - Objeto JSON con los datos de la hoja de cálculo.
 */
function getDataAsJson(): { [key: string]: Ingredient[] } {
  const namedRange = getNamedRange(TABLE_TCA);
  const dataValues = namedRange.getValues();
  const filteredValues = filterDataValues(dataValues);

  const { validData, invalidData } = convertToFoodDataJson(filteredValues);
  if (Object.keys(invalidData).length > 0) {
    Logger.log(`Ingredientes no válidos: ${JSON.stringify(invalidData, null, 2)}`);
  }

  return validData;
}

/**
 * Convierte los valores filtrados en un objeto JSON.
 * @param {any[][]} filteredValues - Valores filtrados de la hoja de cálculo.
 * @return {Object} - Objeto JSON con los datos de la hoja de cálculo.
 */
function convertToFoodDataJson(filteredValues: any[][]): {
  validData: { [key: string]: Ingredient[] };
  invalidData: { [key: string]: any[] };
} {
  const validData: { [key: string]: Ingredient[] } = {};
  const invalidData: { [key: string]: any[] } = {};

  filteredValues.forEach((row) => {
    const code = row[Letters.A];
    const ingredient: Ingredient = {
      code: code,
      food: row[Letters.B],
      kcal: parseFloat(row[Letters.C]),
      carb: parseFloat(row[Letters.D]),
      protein: parseFloat(row[Letters.E]),
      fat: parseFloat(row[Letters.F]),
      homeUnit: row[Letters.G],
    };

    if (isValidIngredient(ingredient)) {
      if (!validData[code]) {
        validData[code] = [];
      }
      validData[code].push(ingredient);
    } else {
      if (!invalidData[code]) {
        invalidData[code] = [];
      }
      invalidData[code].push(row);
    }
  });

  return { validData, invalidData };
}

/**
 * Verifica si un ingrediente es válido según su tipo.
 * @param {Ingredient} ingredient - Ingrediente a verificar.
 * @return {boolean} - Verdadero si el ingrediente es válido, falso si no.
 */
function isValidIngredient(ingredient: Ingredient): boolean {
  return (
    typeof ingredient.code === "string" &&
    typeof ingredient.food === "string" &&
    !isNaN(ingredient.kcal) &&
    !isNaN(ingredient.carb) &&
    !isNaN(ingredient.protein) &&
    !isNaN(ingredient.fat) &&
    typeof ingredient.homeUnit === "string"
  );
}

/**
 * Obtiene el rango nombrado de la hoja de cálculo.
 * @param {string} rangeName - Nombre del rango.
 * @return {GoogleAppsScript.Spreadsheet.Range} - Rango nombrado.
 * @throws {Error} - Si no se encuentra el rango.
 */
function getNamedRange(rangeName: string): GoogleAppsScript.Spreadsheet.Range {
  const namedRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName);
  if (!namedRange) {
    throw new Error(`No se ha encontrado el rango: ${rangeName}`);
  }
  return namedRange;
}

/**
 * Filtra los valores de los datos para excluir filas no deseadas.
 * @param {any[][]} dataValues - Valores de los datos de la hoja de cálculo.
 * @return {any[][]} - Valores filtrados.
 */
function filterDataValues(dataValues: any[][]): any[][] {
  return dataValues.filter((row) => {
    return row[Letters.A] !== "" && row[Letters.A] !== "Código" && row[Letters.A] !== 1;
  });
}

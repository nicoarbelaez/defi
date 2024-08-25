const TABLE_CODES = "DB_CODES";
const PREFIX_CODE_FOOD = "DB_FOOD";

/**
 * Clase para gestionar el caché de datos de alimentos.
 * @implements {SetUp}
 */
class FoodDataCache implements SetUp {
  private static readonly CACHE_TABLE_TCA = "FOOD_DATA_JSON";
  private static SHEET_DB = "db_interactions";
  private static readonly URL_API =
    "https://script.google.com/macros/s/AKfycbwmp74xvrAmRXLqv0s6LdvOQNLqCGJj9Drrh0DI4H2ieaaCtAMUyH0T6LNcgK_dI9gO/exec";

  constructor() {
    FoodDataCache.updateCacheOnSheetChange();
  }

  /**
   * Obtiene el JSON del caché o de la API si no está en el caché.
   * @returns {{ [key: string]: Ingredient[] }} - Objeto JSON del caché o de la API.
   */
  public static getJsonFromCache(): { [key: string]: Ingredient[] } {
    const cache = CacheService.getScriptCache();
    let jsonString = cache.get(FoodDataCache.CACHE_TABLE_TCA);

    if (!jsonString) {
      const jsonData = FoodDataCache.fetchApiData();
      FoodDataCache.cacheJsonData(jsonData);
      jsonString = JSON.stringify(jsonData);
    }

    return JSON.parse(jsonString) as { [key: string]: Ingredient[] };
  }

  /**
   * Actualiza el caché si se actualiza la hoja de cálculo.
   */
  public static updateCacheOnSheetChange(): void {
    SpreadsheetApp.getActiveSpreadsheet().toast("Actualizando caché de datos", "Actualización", 5);
    const jsonData = FoodDataCache.fetchApiData();
    FoodDataCache.cacheJsonData(jsonData);
    FoodDataCache.loadDataFromApi(jsonData);
  }

  /**
   * Sube el JSON al caché.
   * @param {Object} jsonData - Objeto JSON a almacenar en el caché.
   */
  private static cacheJsonData(jsonData: { [key: string]: Ingredient[] }): void {
    Logger.log("Caching JSON data");
    const cache = CacheService.getScriptCache();
    const jsonString = JSON.stringify(jsonData);
    cache.put(FoodDataCache.CACHE_TABLE_TCA, jsonString, 21600); // 6 horas
  }

  /**
   * Función principal para cargar datos desde la API y escribirlos en la hoja de cálculo.
   * @param {Object} dataTCA - Los datos obtenidos de la API.
   */
  private static loadDataFromApi(dataTCA: { [key: string]: Ingredient[] }): void {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FoodDataCache.SHEET_DB);
    if (!sheet) throw new Error(`Sheet ${FoodDataCache.SHEET_DB} not found`);

    // Limpiar toda la información anterior de la hoja
    sheet.clearContents();

    const codes = Object.keys(dataTCA);
    FoodDataCache.addDataToColumn(LetterString.A, "codes", codes);

    let columnIndex: LetterInteger = LetterInteger.B;
    codes.forEach((code) => {
      const data = dataTCA[code].map((item: Ingredient) => item.food);
      FoodDataCache.addDataToColumn(Utils.getLetter(columnIndex), code, data);
      columnIndex++;
    });

    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Datos de la API cargados correctamente.",
      "Carga de datos",
      5
    );
  }

  /**
   * Llama a la API y obtiene los datos en formato JSON.
   * @returns {{ [key: string]: Ingredient[] } | null} - Los datos obtenidos de la API o null en caso de error.
   */
  private static fetchApiData(): { [key: string]: Ingredient[] } | null {
    let response = doGetApi(); // TODO: Eliminar para habilitar el uso de la API
    return response;
    try {
      const response = UrlFetchApp.fetch(FoodDataCache.URL_API);
      const contentType = response.getHeaders()["Content-Type"];

      if (contentType && contentType.includes("application/json")) {
        return JSON.parse(response.getContentText()) as { [key: string]: Ingredient[] };
      } else {
        Logger.log("El contenido recibido no es JSON.");
        return null;
      }
    } catch (error) {
      Logger.log("Error al llamar a la API: " + error);
      return null;
    }
  } 

  /**
   * Añade datos a una columna específica en la hoja de cálculo.
   * @param {LetterString} column - La columna a la que se añadirán los datos.
   * @param {string} header - El encabezado de la columna.
   * @param {Array<any>} data - Los datos a añadir.
   */
  private static addDataToColumn(column: LetterString, header: string, data: Array<any>): void {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FoodDataCache.SHEET_DB);
    sheet.getRange(`${column}1`).setValue(header);
    sheet.getRange(`${column}2:${column}${data.length + 1}`).setValues(data.map((item) => [item]));
  }

  /**
   * Inicializa los rangos con nombre en la hoja de cálculo.
   */
  init(): void {
    const sheetDB = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FoodDataCache.SHEET_DB);
    if (!sheetDB) throw new Error(`Sheet ${FoodDataCache.SHEET_DB} not found`);
    
    const lastRow = sheetDB.getLastRow();
    Utils.createNamedRange(`A2:A${lastRow}`, TABLE_CODES, FoodDataCache.SHEET_DB);
    
    const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(TABLE_CODES);
    const codes = range.getValues().filter(row => row[0]).map(row => row[0]);
    
    let columnIndex = LetterInteger.B;
    codes.forEach((code) => {
      const namedRange = `${PREFIX_CODE_FOOD}_${code}`;
      const range = `${Utils.getLetter(columnIndex)}2:${Utils.getLetter(columnIndex)}${lastRow}`;
      Utils.createNamedRange(range, namedRange, FoodDataCache.SHEET_DB);
      columnIndex++;
    });

    SpreadsheetApp.getActiveSpreadsheet().toast("Rangos creados correctamente.", "Creación de rangos", 5);
  }

  /**
   * Elimina los rangos con nombre en la hoja de cálculo.
   */
  clean(): void {
    const sheetDB = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FoodDataCache.SHEET_DB);
    if (!sheetDB) throw new Error(`Sheet ${FoodDataCache.SHEET_DB} not found`);

    const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(TABLE_CODES);
    const codes = range.getValues().filter(row => row[0]).map(row => row[0]);

    Utils.deleteNamedRange(TABLE_CODES, FoodDataCache.SHEET_DB);

    let columnIndex = LetterInteger.B;
    codes.forEach((code) => {
      const namedRange = `${PREFIX_CODE_FOOD}_${code}`;
      Utils.deleteNamedRange(namedRange, FoodDataCache.SHEET_DB);
      columnIndex++;
    });

    SpreadsheetApp.getActiveSpreadsheet().toast("Rangos eliminados correctamente.", "Eliminación de rangos", 5);
  }
}

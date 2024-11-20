// Compiled using defi 1.0.0 (TypeScript 4.9.5)
const TABLE_CODES = "DB_CODES";
const PREFIX_CODE_FOOD = "DB_FOOD";
/**
 * Clase para gestionar el caché de datos de alimentos.
 * @implements {SetUp}
 */
class FoodDataCache {
    constructor() {
        FoodDataCache.updateCacheOnSheetChange();
    }
    /**
     * Obtiene el JSON del caché o de la API si no está en el caché.
     * @returns {{ [key: string]: Ingredient[] }} - Objeto JSON del caché o de la API.
     */
    static getJsonFromCache() {
        const cache = CacheService.getScriptCache();
        let jsonString = cache.get(FoodDataCache.CACHE_TABLE_TCA);
        if (!jsonString) {
            const jsonData = FoodDataCache.fetchApiData();
            FoodDataCache.cacheJsonData(jsonData);
            jsonString = JSON.stringify(jsonData);
        }
        return JSON.parse(jsonString);
    }
    /**
     * Actualiza el caché si se actualiza la hoja de cálculo.
     */
    static updateCacheOnSheetChange() {
        SpreadsheetApp.getActiveSpreadsheet().toast("Actualizando caché de datos", "Actualización", 5);
        const sheetDB = FoodDataCache.getSheetDB();
        const oldCodes = FoodDataCache.getCodesFromRange(TABLE_CODES);
        const jsonData = FoodDataCache.fetchApiData();
        FoodDataCache.cacheJsonData(jsonData);
        FoodDataCache.loadDataFromApi(jsonData);
        const newCodes = FoodDataCache.getCodesFromRange(TABLE_CODES);
        const codesAdded = newCodes.filter(code => oldCodes.indexOf(code) === -1);
        const codesRemoved = oldCodes.filter(code => newCodes.indexOf(code) === -1);
        if (codesAdded.length > 0 && codesRemoved.length > 0) {
            FoodDataCache.deleteNonExistentNamedRanges();
            FoodDataCache.createNamedRanges(sheetDB, sheetDB.getLastRow());
        }
        else if (codesAdded.length > 0) {
            FoodDataCache.createNamedRanges(sheetDB, sheetDB.getLastRow());
        }
        else if (codesRemoved.length > 0) {
            FoodDataCache.deleteNonExistentNamedRanges();
        }
    }
    /**
     * Crea los rangos con nombre en la hoja de cálculo, excepto TABLE_CODE.
     * @param {GoogleAppsScript.Spreadsheet.Sheet} sheetDB - La hoja de cálculo.
     * @param {number} lastRow - La última fila con datos.
     */
    static createNamedRanges(sheetDB, lastRow) {
        const codes = FoodDataCache.getCodesFromRange(TABLE_CODES);
        let columnIndex = LetterInteger.B;
        codes.forEach((code) => {
            const namedRange = `${PREFIX_CODE_FOOD}_${code}`;
            const range = `${Utils.getLetter(columnIndex)}2:${Utils.getLetter(columnIndex)}${lastRow}`;
            Utils.createNamedRange(range, namedRange, FoodDataCache.SHEET_DB);
            columnIndex++;
        });
    }
    /**
     * Borra los rangos con nombre de códigos que ya no existen.
     */
    static deleteNonExistentNamedRanges() {
        const sheetDB = FoodDataCache.getSheetDB();
        const existingCodes = FoodDataCache.getCodesFromRange(TABLE_CODES);
        const namedRanges = sheetDB.getNamedRanges().map(range => range.getName());
        const prefixLength = PREFIX_CODE_FOOD.length + 1;
        namedRanges.forEach(namedRange => {
            if (namedRange.startsWith(PREFIX_CODE_FOOD)) {
                const code = namedRange.substring(prefixLength);
                if (existingCodes.indexOf(code) === -1) {
                    Utils.deleteNamedRange(namedRange, FoodDataCache.SHEET_DB);
                }
            }
        });
    }
    /**
     * Obtiene la hoja de cálculo de la base de datos.
     * @returns {GoogleAppsScript.Spreadsheet.Sheet} - La hoja de cálculo.
     */
    static getSheetDB() {
        const sheetDB = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FoodDataCache.SHEET_DB);
        if (!sheetDB)
            throw new Error(`Sheet ${FoodDataCache.SHEET_DB} not found`);
        return sheetDB;
    }
    /**
     * Obtiene los códigos de un rango con nombre.
     * @param {string} rangeName - El nombre del rango.
     * @returns {string[]} - Los códigos obtenidos del rango.
     */
    static getCodesFromRange(rangeName) {
        const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName);
        return range.getValues().filter(row => row[0]).map(row => row[0]);
    }
    /**
     * Llama a la API y obtiene los datos en formato JSON.
     * @returns {{ [key: string]: Ingredient[] } | null} - Los datos obtenidos de la API o null en caso de error.
     */
    static fetchApiData() {
        let response = doGetApi(); // TODO: Eliminar para habilitar el uso de la API
        return response;
        try {
            const response = UrlFetchApp.fetch(FoodDataCache.URL_API);
            const contentType = response.getHeaders()["Content-Type"];
            if (contentType && contentType.includes("application/json")) {
                return JSON.parse(response.getContentText());
            }
            else {
                Logger.log("El contenido recibido no es JSON.");
                return null;
            }
        }
        catch (error) {
            Logger.log("Error al llamar a la API: " + error);
            return null;
        }
    }
    /**
     * Sube el JSON al caché.
     * @param {Object} jsonData - Objeto JSON a almacenar en el caché.
     */
    static cacheJsonData(jsonData) {
        Logger.log("Caching JSON data");
        const cache = CacheService.getScriptCache();
        const jsonString = JSON.stringify(jsonData);
        cache.put(FoodDataCache.CACHE_TABLE_TCA, jsonString, 21600); // 6 horas
    }
    /**
     * Función principal para cargar datos desde la API y escribirlos en la hoja de cálculo.
     * @param {Object} dataTCA - Los datos obtenidos de la API.
     */
    static loadDataFromApi(dataTCA) {
        const sheet = FoodDataCache.getSheetDB();
        sheet.clearContents();
        const codes = Object.keys(dataTCA);
        FoodDataCache.addDataToColumn(LetterString.A, "codes", codes);
        let columnIndex = LetterInteger.B;
        codes.forEach((code) => {
            const data = dataTCA[code].map((item) => item.food);
            FoodDataCache.addDataToColumn(Utils.getLetter(columnIndex), code, data);
            columnIndex++;
        });
        SpreadsheetApp.getActiveSpreadsheet().toast("Datos de la API cargados correctamente.", "Carga de datos", 5);
    }
    /**
     * Añade datos a una columna específica en la hoja de cálculo.
     * @param {LetterString} column - La columna a la que se añadirán los datos.
     * @param {string} header - El encabezado de la columna.
     * @param {Array<any>} data - Los datos a añadir.
     */
    static addDataToColumn(column, header, data) {
        const sheet = FoodDataCache.getSheetDB();
        sheet.getRange(`${column}1`).setValue(header);
        sheet.getRange(`${column}2:${column}${data.length + 1}`).setValues(data.map((item) => [item]));
    }
    /**
     * Inicializa los rangos con nombre en la hoja de cálculo.
     */
    init() {
        const sheetDB = FoodDataCache.getSheetDB();
        const lastRow = sheetDB.getLastRow();
        Utils.createNamedRange(`A2:A${lastRow}`, TABLE_CODES, FoodDataCache.SHEET_DB);
        FoodDataCache.createNamedRanges(sheetDB, lastRow);
        SpreadsheetApp.getActiveSpreadsheet().toast("Rangos creados correctamente.", "Creación de rangos", 5);
    }
    /**
     * Elimina los rangos con nombre en la hoja de cálculo.
     */
    clean() {
        const codes = FoodDataCache.getCodesFromRange(TABLE_CODES);
        Utils.deleteNamedRange(TABLE_CODES, FoodDataCache.SHEET_DB);
        codes.forEach((code) => {
            const namedRange = `${PREFIX_CODE_FOOD}_${code}`;
            Utils.deleteNamedRange(namedRange, FoodDataCache.SHEET_DB);
        });
        SpreadsheetApp.getActiveSpreadsheet().toast("Rangos eliminados correctamente.", "Eliminación de rangos", 5);
    }
}
FoodDataCache.CACHE_TABLE_TCA = "FOOD_DATA_JSON";
FoodDataCache.SHEET_DB = "db_interactions";
FoodDataCache.URL_API = "https://script.google.com/macros/s/AKfycbwmp74xvrAmRXLqv0s6LdvOQNLqCGJj9Drrh0DI4H2ieaaCtAMUyH0T6LNcgK_dI9gO/exec";

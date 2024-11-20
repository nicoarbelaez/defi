// Compiled using defi 1.0.0 (TypeScript 4.9.5)
const SHEET_EXCHANGES = "INTERCAMBIOS";
class TableExchange {
    constructor(startCol, startRow) {
        this._startCol = startCol;
        this._startRow = startRow;
        this._cellCode = { row: startRow, col: startCol };
        this._cellFood = { row: startRow + 1, col: startCol };
        this._cellGrams = { row: startRow + 2, col: startCol };
        this._cellFoodExchange = { row: startRow + 3, col: startCol };
        this._cellGramsExchange = { row: startRow + 4, col: startCol };
        this._cellHomeUnit = { row: startRow + 5, col: startCol };
    }
    /**
     * Crea una instancia de TableExchange a partir de un objeto JSON.
     * @param {Object} json - El objeto JSON.
     * @returns {TableExchange} La instancia de TableExchange.
     */
    static fromJSON(json) {
        const instance = new TableExchange(json._startCol, json._startRow);
        instance._code = json._code;
        instance._food = json._food;
        instance._grams = json._grams;
        instance._foodExchange = json._foodExchange;
        instance._gramsExchange = json._gramsExchange;
        instance._homeUnit = json._homeUnit;
        return instance;
    }
    /**
     * Limpia las celdas especificadas en la hoja de cálculo.
     */
    clearCells() {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_EXCHANGES);
        if (!sheet)
            throw new Error(`Sheet ${SHEET_EXCHANGES} not found`);
        sheet.getRange(this._cellFood.row, this._cellFood.col).setValue("");
        sheet.getRange(this._cellGrams.row, this._cellGrams.col).setValue("");
        sheet.getRange(this._cellFoodExchange.row, this._cellFoodExchange.col).setValue("");
        sheet.getRange(this._cellGramsExchange.row, this._cellGramsExchange.col).setValue("");
        sheet.getRange(this._cellHomeUnit.row, this._cellHomeUnit.col).setValue("");
    }
    /**
     * Carga los datos desde la hoja de cálculo.
     */
    loadData() {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_EXCHANGES);
        if (!sheet)
            throw new Error(`Sheet ${SHEET_EXCHANGES} not found`);
        this._code = sheet.getRange(this._cellCode.row, this._cellCode.col).getValue();
        this._food = sheet.getRange(this._cellFood.row, this._cellFood.col).getValue();
        this._grams = sheet.getRange(this._cellGrams.row, this._cellGrams.col).getValue();
        this._foodExchange = sheet
            .getRange(this._cellFoodExchange.row, this._cellFoodExchange.col)
            .getValue();
        console.log(`loadData: ${JSON.stringify(this)}`);
    }
    /**
     * Calcula los datos necesarios para el intercambio.
     */
    calculateData() {
        try {
            const item = Utils.findItemByCodeAndFood(this._code, this._food);
            const itemExchange = Utils.findItemByCodeAndFood(this._code, this._foodExchange);
            const itemKcal = Utils.getCalories(this._grams, item);
            this._gramsExchange = (itemKcal * Utils.BASE_GRAMS) / itemExchange.kcal;
            this._homeUnit = Utils.getHomeUnit(this._gramsExchange, itemExchange);
        }
        catch (error) {
            let resetGrams;
            this._gramsExchange = resetGrams;
            this._homeUnit = "";
            return;
        }
    }
    /**
     * Almacena los datos calculados en la hoja de cálculo.
     */
    storeData() {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_EXCHANGES);
        if (!sheet)
            throw new Error(`Sheet ${SHEET_EXCHANGES} not found`);
        sheet
            .getRange(this._cellGramsExchange.row, this._cellGramsExchange.col)
            .setValue(this._gramsExchange);
        sheet.getRange(this._cellHomeUnit.row, this._cellHomeUnit.col).setValue(this._homeUnit);
    }
    /**
     * Crea o elimina listas desplegables en las celdas especificadas.
     * @param {string} cell - La celda donde se debe crear o eliminar la lista desplegable.
     */
    dropdown(cell) {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_EXCHANGES);
        if (!sheet)
            throw new Error(`Sheet ${SHEET_EXCHANGES} not found`);
        const initialCell = sheet.getRange(this._cellCode.row, this._cellCode.col).getA1Notation();
        console.log(`${initialCell} =? ${cell}`);
        if (cell === initialCell) {
            const cellValue = sheet.getRange(this._cellCode.row, this._cellCode.col).getValue();
            const namedRange = `${PREFIX_CODE_FOOD}_${cellValue}`;
            console.log(`${namedRange}`);
            const ranges = [
                sheet.getRange(this._cellFood.row, this._cellFood.col).getA1Notation(),
                sheet.getRange(this._cellFoodExchange.row, this._cellFoodExchange.col).getA1Notation(),
            ];
            if (cellValue === "" || cellValue.toLowerCase() === "none") {
                // Eliminar validaciones si el contenido es vacío o "none"
                Utils.deleteValidations(ranges, SHEET_EXCHANGES);
                console.log(`Removed validations from ${ranges}`);
            }
            else {
                // Crear validaciones si hay contenido en la celda
                const validation = SpreadsheetApp.newDataValidation()
                    .requireValueInRange(SpreadsheetApp.getActiveSpreadsheet().getRangeByName(namedRange))
                    .build();
                Utils.createValidations(ranges, validation, SHEET_EXCHANGES);
                console.log(`${namedRange} | ${validation} | ${ranges}`);
            }
            this.clearCells();
        }
    }
    init() {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_EXCHANGES);
        if (!sheet)
            throw new Error(`Sheet ${SHEET_EXCHANGES} not found`);
        const initialCell = sheet.getRange(this._startRow, this._startCol).getA1Notation();
        Utils.deleteValidations([initialCell], SHEET_EXCHANGES);
        const validation = SpreadsheetApp.newDataValidation()
            .requireValueInRange(SpreadsheetApp.getActiveSpreadsheet().getRangeByName(TABLE_CODES))
            .build();
        Utils.createValidations([initialCell], validation, SHEET_EXCHANGES);
    }
    clean() {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_EXCHANGES);
        console.log(this._startRow + " - " + this._startCol);
        Utils.deleteValidations([sheet.getRange(this._startRow, this._startCol).getA1Notation()], SHEET_EXCHANGES);
    }
}

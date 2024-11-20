// Compiled using defi 1.0.0 (TypeScript 4.9.5)
const PERSISTENT_TABLE_FOOD = "var_tablefood";
const PERSISTENT_TABLE_EXCHANGE = "var_tableexchange";
const PERSISTENT_SHOPPING_LIST = "var_shoppinglist";
function init() {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert("Confirmación", "¿Estás seguro de que deseas ejecutar el inicializador? Si no sabes qué es, no lo intentes.", ui.ButtonSet.YES_NO);
    if (response != ui.Button.YES) {
        ui.alert("Inicialización cancelada.");
        return;
    }
    const foodDataCache = new FoodDataCache();
    const tableFood = {
        [DaysOfWeek.MONDAY]: new TableFood(LetterInteger.A, 53, DaysOfWeek.MONDAY),
        [DaysOfWeek.TUESDAY]: new TableFood(LetterInteger.A, 93, DaysOfWeek.TUESDAY),
        [DaysOfWeek.WEDNESDAY]: new TableFood(LetterInteger.A, 134, DaysOfWeek.WEDNESDAY),
        [DaysOfWeek.THURSDAY]: new TableFood(LetterInteger.A, 175, DaysOfWeek.THURSDAY),
        [DaysOfWeek.FRIDAY]: new TableFood(LetterInteger.A, 215, DaysOfWeek.FRIDAY),
        [DaysOfWeek.SATURDAY]: new TableFood(LetterInteger.A, 255, DaysOfWeek.SATURDAY),
        [DaysOfWeek.SUNDAY]: new TableFood(LetterInteger.A, 295, DaysOfWeek.SUNDAY),
    };
    const shoopingList = new ShoppingList(LetterInteger.B, 328, 14, [
        LetterInteger.B,
        LetterInteger.E,
        LetterInteger.H,
    ]);
    const tableExchange = new TableExchange(LetterInteger.C, 20);
    // Init
    foodDataCache.init();
    for (const day in tableFood) {
        if (tableFood.hasOwnProperty(day)) {
            tableFood[day].init();
        }
    }
    shoopingList.init();
    tableExchange.init();
    PersistentVariable.setVariable(PERSISTENT_TABLE_FOOD, tableFood);
    PersistentVariable.setVariable(PERSISTENT_SHOPPING_LIST, shoopingList);
    PersistentVariable.setVariable(PERSISTENT_TABLE_EXCHANGE, tableExchange);
    // console.log(JSON.stringify(PersistentVariable.getTableExchange(), null, 1));
    // console.log(JSON.stringify(PersistentVariable.getShoppingList(), null, 1));
}

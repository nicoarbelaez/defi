// Compiled using defi 1.0.0 (TypeScript 4.9.5)
function clean() {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert("Confirmación", "¿Estás seguro de que deseas ejecutar el limpiador? Si no sabes qué es, no lo intentes.", ui.ButtonSet.YES_NO);
    if (response != ui.Button.YES) {
        ui.alert("Limpieza cancelada.");
        return;
    }
    const foodDataCache = new FoodDataCache();
    const tableFood = PersistentVariable.getTableFood();
    const shoppingList = PersistentVariable.getShoppingList();
    const tableExchange = PersistentVariable.getTableExchange();
    for (const day in tableFood) {
        if (tableFood.hasOwnProperty(day)) {
            tableFood[day].clean();
        }
    }
    // Clean
    foodDataCache.clean();
    shoppingList.clean();
    console.log(JSON.stringify(tableExchange));
    tableExchange.clean();
    PersistentVariable.clearVariable(PERSISTENT_TABLE_FOOD);
    PersistentVariable.clearVariable(PERSISTENT_SHOPPING_LIST);
    PersistentVariable.clearVariable(PERSISTENT_TABLE_EXCHANGE);
}

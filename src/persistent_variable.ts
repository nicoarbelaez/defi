interface TableFoodRecord {
  [key: string]: TableFood;
}

class PersistentVariable {
  /**
   * Establece el valor de una variable persistente.
   * @param {string} variableName - El nombre de la variable.
   * @param {any} value - El valor a establecer.
   * @throws {Error} Si el valor es nulo o indefinido.
   */
  public static setVariable(variableName: string, value: any): void {
    if (!variableName) {
      throw new Error("El nombre de la variable no puede estar vacío.");
    }
    if (value === null || value === undefined) {
      throw new Error("El valor no puede ser nulo o indefinido.");
    }
    const userProperties = PropertiesService.getDocumentProperties();
    userProperties.setProperty(variableName, JSON.stringify(value));
  }

  /**
   * Obtiene el valor de una variable persistente.
   * @param {string} variableName - El nombre de la variable.
   * @returns {any} El valor de la variable persistente.
   * @throws {Error} Si la variable no ha sido establecida.
   */
  public static getVariable(variableName: string): any {
    if (!variableName) {
      throw new Error("El nombre de la variable no puede estar vacío.");
    }
    const userProperties = PropertiesService.getDocumentProperties();
    const value = userProperties.getProperty(variableName);
    if (value === null) {
      Logger.log(`La variable "${variableName}" no ha sido establecida.`);
    }
    return JSON.parse(value);
  }

  /**
   * Limpia el valor de una variable persistente.
   * @param {string} variableName - El nombre de la variable.
   * @throws {Error} Si el nombre de la variable está vacío.
   */
  public static clearVariable(variableName: string): void {
    if (!variableName) {
      throw new Error("El nombre de la variable no puede estar vacío.");
    }
    const userProperties = PropertiesService.getDocumentProperties();
    userProperties.deleteProperty(variableName);
    Logger.log(`La variable "${variableName}" ha sido eliminada.`);
    PropertiesService.getScriptProperties().deleteAllProperties();
    PropertiesService.getUserProperties().deleteAllProperties();
  }

  /**
   * Reconstruye las instancias de TableFood a partir del JSON almacenado.
   * @returns {TableFoodRecord} Un objeto con las instancias de TableFood reconstruidas.
   * @throws {Error} Si la variable no ha sido establecida.
   */
  public static getTableFood(): TableFoodRecord {
    const tableFoodJson = PersistentVariable.getVariable(PERSISTENT_TABLE_FOOD);
    const tableFood: TableFoodRecord = {};
    for (const day in tableFoodJson) {
      if (tableFoodJson.hasOwnProperty(day)) {
        tableFood[day] = TableFood.fromJSON(tableFoodJson[day]);
      }
    }
    return tableFood;
  }

  /**
   * Obtiene una instancia de ShoppingList desde una variable persistente.
   * @returns {ShoppingList} La instancia de ShoppingList.
   */
  public static getShoppingList(): ShoppingList {
    const shoppingListJson = PersistentVariable.getVariable(PERSISTENT_SHOPPING_LIST);
    return ShoppingList.fromJSON(shoppingListJson);
  }

  /**
   * Obtiene una instancia de TableExchange desde una variable persistente.
   * @returns {TableExchange} La instancia de TableExchange.
   */
  public static getTableExchange(): TableExchange {
    const tableExchangeJson = PersistentVariable.getVariable(PERSISTENT_TABLE_EXCHANGE);
    return TableExchange.fromJSON(tableExchangeJson);
  }
}

class TableExchange {
  static calculateExchange(): { grams: number; homeUnit: string } | null {
    const data = this.loadData();

    if (!data) {
      return null;
    }

    try {
      const item = Utils.findItemByCodeAndFood(data.code, data.food);
      const itemExchange = Utils.findItemByCodeAndFood(data.code, data.foodExchange);

      const itemKcal = Utils.getCalories(data.grams, item);
      let gramsExchange = (itemKcal * Utils.BASE_GRAMS) / itemExchange.kcal;

      gramsExchange = parseFloat(gramsExchange.toFixed(2));

      const homeUnit = Utils.getHomeUnit(gramsExchange, itemExchange) || "-";

      return { grams: gramsExchange, homeUnit };
    } catch (error) {
      console.error("Error al calcular el intercambio:", error);
      return null;
    }
  }

  static insertDropdown() {
    const config = getConfig().exchangeConfig;
    const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_EXCHANGES);

    if (isCellEmpty(sheet, config.foodCode)) {
      DropDownUtil.removeDropDown(sheet, config.foodToBeExchanged);
      DropDownUtil.removeDropDown(sheet, config.equivalentFood);
      return;
    }

    const code = getCellValues(sheet, config.foodCode)[0].toUpperCase();
    const rangeName = VariableConst.PREFIX_CODE_FOOD.concat(`_${code}`);

    DropDownUtil.createDropDown(sheet, rangeName, config.foodToBeExchanged);
    DropDownUtil.createDropDown(sheet, rangeName, config.equivalentFood);
  }

  static insertData({ grams, homeUnit }: { grams: number; homeUnit: string }) {
    const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_EXCHANGES);
    const config = getConfig().exchangeConfig;

    setCellValue(sheet, config.equivalentPortion, [{ text: grams.toString().replace(".", ",") }]);
    setCellValue(sheet, config.homeMeasurement, [{ text: homeUnit }]);
  }

  private static loadData(): {
    code: string;
    food: string;
    grams: number;
    foodExchange: string;
  } | null {
    const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_EXCHANGES);
    const config = getConfig().exchangeConfig;

    const code = sheet.getRange(config.foodCode).getValue();
    const food = sheet.getRange(config.foodToBeExchanged).getValue();
    const grams = parseInt(sheet.getRange(config.targetQuantity).getValue(), 10);
    const foodExchange = sheet.getRange(config.equivalentFood).getValue();

    if (!code || !food || isNaN(grams) || grams <= 0 || !foodExchange) {
      return null;
    }

    setCellValue(sheet, config.equivalentPortion, [{ text: "🛜Cargando..." }]);
    setCellValue(sheet, config.homeMeasurement, [{ text: "🛜Cargando..." }]);
    return { code, food, grams, foodExchange };
  }
}

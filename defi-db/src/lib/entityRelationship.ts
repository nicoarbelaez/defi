function createEntityRelationshipModel(): void {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();

  // Obtener respuesta actual
  const jsonResponse: DoGetResponse = JSON.parse(getResponse());
  // --- DESHABILITADO: codes y items de alimentos ---
  /*
  const { codes, items, exerciseDatabase } = jsonResponse;
  */
  const { exerciseDatabase } = jsonResponse;

  // --- SE DESHABILITA LA ACTUALIZACIÓN DE "codigo_alimentos" Y "alimentos" ---
  /*
  // Preparar datos para las hojas
  const foodCodesData = codes.map((code, index) => [index + 1, code || null]);
  const foodItemsData: any[] = [];
  let foodItemId = 1;

  items.forEach((item) => {
    const foodCodeId = codes.indexOf(item.code) + 1;
    item.food.forEach((food) => {
      const homeUnitValue = food.homeUnit?.value ?? null;
      const homeUnitName = food.homeUnit?.value && food.homeUnit?.unit ? food.homeUnit.unit : "";

      foodItemsData.push([
        foodItemId++,
        foodCodeId,
        food.nameFood || null,
        food.kcal ?? null,
        food.carb ?? null,
        food.protein ?? null,
        food.fat ?? null,
        homeUnitValue,
        homeUnitName,
      ]);
    });
  });

  // Actualizar hoja "codigo_alimentos"
  const foodCodesSheet =
    sheet.getSheetByName("codigo_alimentos") || sheet.insertSheet("codigo_alimentos");
  foodCodesSheet.clear();
  foodCodesSheet.appendRow(["id", "codigo_alimento"]);
  if (foodCodesData.length > 0) {
    foodCodesSheet
      .getRange(2, 1, foodCodesData.length, foodCodesData[0].length)
      .setValues(foodCodesData);
  }

  // Actualizar hoja "alimentos"
  const foodItemsSheet = sheet.getSheetByName("alimentos") || sheet.insertSheet("alimentos");
  foodItemsSheet.clear();
  foodItemsSheet.appendRow([
    "id",
    "codigo_alimento_id",
    "nombre",
    "calorias",
    "carbohidratos",
    "proteinas",
    "grasas",
    "unidad_valor",
    "unidad_nombre",
    "imagen",
  ]);
  if (foodItemsData.length > 0) {
    foodItemsSheet
      .getRange(2, 1, foodItemsData.length, foodItemsData[0].length)
      .setValues(foodItemsData);
  }
  */
  // --- FIN DESHABILITADO ---

  const exerciseCodesData = exerciseDatabase.muscleGroups.map((group, index) => [
    index + 1,
    group || null,
  ]);
  const exerciseItemsData: any[] = [];
  let exerciseItemId = 1;

  exerciseDatabase.exercises.forEach((exerciseGroup, groupIndex) => {
    const muscleGroupId = groupIndex + 1;
    exerciseGroup.exercise.forEach((exercise) => {
      exerciseItemsData.push([
        exerciseItemId++,
        muscleGroupId,
        exercise.name || null,
        exercise.url || null,
      ]);
    });
  });

  // Actualizar hoja "codigo_ejercicios"
  const exerciseCodesSheet =
    sheet.getSheetByName("codigo_ejercicios") || sheet.insertSheet("codigo_ejercicios");
  exerciseCodesSheet.clear();
  exerciseCodesSheet.appendRow(["id", "grupo_muscular"]);
  if (exerciseCodesData.length > 0) {
    exerciseCodesSheet
      .getRange(2, 1, exerciseCodesData.length, exerciseCodesData[0].length)
      .setValues(exerciseCodesData);
  }

  // Actualizar hoja "ejercicios"
  const exerciseItemsSheet = sheet.getSheetByName("ejercicios") || sheet.insertSheet("ejercicios");
  exerciseItemsSheet.clear();
  exerciseItemsSheet.appendRow(["id", "grupo_muscular_id", "nombre_ejercicio", "url"]);
  if (exerciseItemsData.length > 0) {
    exerciseItemsSheet
      .getRange(2, 1, exerciseItemsData.length, exerciseItemsData[0].length)
      .setValues(exerciseItemsData);
  }
}

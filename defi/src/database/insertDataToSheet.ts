const insertDataToSheet = (): void => {
  try {
    Utils.showToast("📂 Preparando datos", "Recopilando información de la base de datos...");

    const START_CELL = "H2";
    const db = getDataBase(); // Obtener datos de la base de datos

    const sheet = SheetUtils.getSheetByName(VariableConst.SHEET_CONFIG);
    if (db.lastUpdate == sheet.getRange("A1").getValue()) {
      Utils.showToast("⏳ Datos ya actualizados", "No se realizaron cambios.");
      return;
    }

    // Insertar `codes`
    Utils.showToast("📋 Insertando códigos", "Añadiendo datos iniciales...");
    const codesRange = sheet.getRange(START_CELL);
    codesRange.setValue("codes");
    const codes = db.codes;
    const codesRangeData = sheet.getRange(
      codesRange.getRow() + 1,
      codesRange.getColumn(),
      codes.length,
      1
    );
    codesRangeData.setValues(codes.map((code) => [code]));

    const codesRangeAddress = `${codesRangeData.getA1Notation()}`;
    Utils.createNamedRange(
      codesRangeAddress,
      VariableConst.TABLE_CODES,
      VariableConst.SHEET_CONFIG
    );

    // Insertar `items`
    db.items.forEach((item, index) => {
      const columnOffset = codesRange.getColumn() + index + 1;
      const headerRange = sheet.getRange(codesRange.getRow(), columnOffset);
      headerRange.setValue(item.code);

      const dataRange = sheet.getRange(codesRange.getRow() + 1, columnOffset, item.food.length, 1);
      const foodNames = item.food.map((food) => [food.nameFood]);
      dataRange.setValues(foodNames);

      const itemRangeAddress = `${dataRange.getA1Notation()}`;
      Utils.createNamedRange(
        itemRangeAddress,
        `${VariableConst.PREFIX_CODE_FOOD}_${item.code}`.toUpperCase(),
        VariableConst.SHEET_CONFIG
      );
    });

    // Insertar `exerciseDatabase` horizontalmente
    const exerciseStartColumn = codesRange.getColumn() + db.codes.length + 2; // Espacio adicional después de `codes` y `items`
    const muscleGroupHeaderCell = sheet.getRange(codesRange.getRow(), exerciseStartColumn);
    muscleGroupHeaderCell.setValue("muscle_group");

    const muscleGroups = db.exerciseDatabase.muscleGroups;
    const muscleGroupRange = sheet.getRange(
      codesRange.getRow() + 1,
      exerciseStartColumn,
      muscleGroups.length,
      1
    );
    muscleGroupRange.setValues(muscleGroups.map((group) => [group]));

    db.exerciseDatabase.exercises.forEach((group, groupIndex) => {
      const groupColumnOffset = exerciseStartColumn + 1 + groupIndex * 2; // Dos columnas por grupo (name y url)

      const groupNameHeader = sheet.getRange(codesRange.getRow(), groupColumnOffset);
      groupNameHeader.setValue(group.muscleGroup);

      const groupUrlHeader = sheet.getRange(codesRange.getRow(), groupColumnOffset + 1);
      groupUrlHeader.setValue(`${group.muscleGroup}_url`);

      const exerciseNames = group.exercise.map((exercise) => [exercise.name]);
      const exerciseUrls = group.exercise.map((exercise) => [exercise.url || ""]);

      if (exerciseNames.length > 0) {
        const nameRange = sheet.getRange(
          codesRange.getRow() + 1,
          groupColumnOffset,
          exerciseNames.length,
          1
        );
        nameRange.setValues(exerciseNames);
      }

      if (exerciseUrls.length > 0) {
        const urlRange = sheet.getRange(
          codesRange.getRow() + 1,
          groupColumnOffset + 1,
          exerciseUrls.length,
          1
        );
        urlRange.setValues(exerciseUrls);
      }

      if (exerciseNames.length > 0 || exerciseUrls.length > 0) {
        const groupRangeAddress = `${sheet
          .getRange(
            codesRange.getRow() + 1,
            groupColumnOffset,
            Math.max(exerciseNames.length, exerciseUrls.length),
            1
          )
          .getA1Notation()}`;

        Utils.createNamedRange(
          groupRangeAddress,
          `${VariableConst.PREFIX_EXERCISE_GROUP}_${group.muscleGroup}`.toUpperCase(),
          VariableConst.SHEET_CONFIG
        );
      }
    });

    sheet.getRange("A1").setValue(db.lastUpdate);

    Utils.showToast(
      "✅ Datos insertados correctamente",
      "La base de datos se ha sincronizado con éxito."
    );
  } catch (error) {
    Utils.showAlert("❌ Error al insertar datos", error.message, "error");
    throw error;
  }
};

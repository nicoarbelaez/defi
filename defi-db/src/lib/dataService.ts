function getItemsAndCodes(): { items: Item[]; codes: string[] } {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("db");
  if (!sheet) throw new Error("La hoja 'db' no existe.");

  const data = sheet.getDataRange().getValues();
  if (!data || data.length <= 1) throw new Error("La hoja 'db' está vacía.");

  const items: Item[] = [];
  const codes: string[] = [];

  data.slice(1).forEach((row) => {
    const code = row[0]?.toString().trim();
    if (!code || ["Código", "", "1"].includes(code)) return;

    const homeUnitParts = row[6]?.toString().split(" ") || [];
    const micronutrient: Micronutrient = {
      nameFood: row[1],
      kcal: Number(row[2]),
      carb: Number(row[3]),
      protein: Number(row[4]),
      fat: Number(row[5]),
      homeUnit: {
        value: parseFloat(homeUnitParts[0]?.replace(",", ".") || "0"),
        unit: homeUnitParts.slice(1).join(" ") || "",
      },
    };

    if (!codes.includes(code)) codes.push(code);

    let item = items.find((item) => item.code === code);
    if (item) {
      item.food.push(micronutrient);
    } else {
      items.push({ code, food: [micronutrient] });
    }
  });

  return { items, codes };
}

function getExerciseDatabase(): ExerciseDatabase {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ejercicios");
  if (!sheet) throw new Error("La hoja 'Ejercicios' no existe.");

  // Obtener datos desde B20 en adelante
  const startCell = "B20";
  const range = sheet.getRange(startCell + ":" + sheet.getLastColumn() + sheet.getLastRow());
  const data = range.getRichTextValues();

  const muscleGroups: string[] = [];
  const exercises: { muscleGroup: string; exercise: { name: string; url: string }[] }[] = [];

  // Obtener encabezados de los grupos musculares
  const headers = data[0]; // Primera fila de la tabla desde B20
  headers.forEach((header, colIndex) => {
    const muscleGroup = header?.getText().trim();
    if (muscleGroup) {
      muscleGroups.push(muscleGroup);

      const exerciseList: { name: string; url: string }[] = [];
      for (let row = 1; row < data.length; row++) {
        const cell = data[row][colIndex];
        const name = cell?.getText().trim();
        const url = cell?.getLinkUrl() || "";
        if (name) {
          exerciseList.push({ name, url });
        }
      }

      exercises.push({ muscleGroup, exercise: exerciseList });
    }
  });

  return { muscleGroups, exercises };
}

// --- DESHABILITADO: Funciones relacionadas con la hoja "db" y alimentos ---

function getItemsAndCodes(): { items: Item[]; codes: string[] } {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1) Abrir y validar hoja de códigos
  const shCod = ss.getSheetByName("codigo_alimentos");
  if (!shCod) throw new Error("La hoja 'codigo_alimentos' no existe.");
  const rawCod = shCod.getDataRange().getValues();
  if (rawCod.length <= 1) throw new Error("La hoja 'codigo_alimentos' está vacía.");

  // Extraer encabezados y datos
  const [hdrCod, ...dataCod] = rawCod;
  const idxCodId = hdrCod.indexOf("id");
  const idxCodValue = hdrCod.indexOf("codigo_alimento");
  if (idxCodId < 0 || idxCodValue < 0)
    throw new Error(
      "Las columnas 'id' o 'codigo_alimento' no se encontraron en 'codigo_alimentos'."
    );

  // Construir mapa id → código
  const mapCodigo = {};
  dataCod.forEach((row) => {
    const id = row[idxCodId];
    const code = row[idxCodValue]?.toString().trim();
    if (id != null && code) mapCodigo[id] = code;
  });

  // 2) Abrir y validar hoja de alimentos
  const shAlim = ss.getSheetByName("alimentos");
  if (!shAlim) throw new Error("La hoja 'alimentos' no existe.");
  const rawAlim = shAlim.getDataRange().getValues();
  if (rawAlim.length <= 1) throw new Error("La hoja 'alimentos' está vacía.");

  // Extraer encabezados y datos
  const [hdrAlim, ...dataAlim] = rawAlim;
  const idxAlimCodId = hdrAlim.indexOf("codigo_alimento_id");
  const idxNombre = hdrAlim.indexOf("nombre");
  const idxKcal = hdrAlim.indexOf("calorias");
  const idxCarb = hdrAlim.indexOf("carbohidratos");
  const idxProt = hdrAlim.indexOf("proteinas");
  const idxFat = hdrAlim.indexOf("grasas");
  const idxUnitVal = hdrAlim.indexOf("unidad_valor");
  const idxUnitName = hdrAlim.indexOf("unidad_nombre");

  // Validar columnas
  if (
    idxAlimCodId < 0 ||
    idxNombre < 0 ||
    idxKcal < 0 ||
    idxCarb < 0 ||
    idxProt < 0 ||
    idxFat < 0 ||
    idxUnitVal < 0 ||
    idxUnitName < 0
  ) {
    throw new Error("Faltan una o más columnas requeridas en la hoja 'alimento'.");
  }

  // 3) Construir items y lista de códigos únicos
  const items: Item[] = [];
  const codesSet = new Set<string>();

  dataAlim.forEach((row) => {
    const rawId = row[idxAlimCodId];
    const code = mapCodigo[rawId];
    if (!code) return; // omitir si no hay correspondencia

    // Extraer y parsear la unidad hogareña
    const homeRaw = row[idxUnitVal]?.toString() + " " + row[idxUnitName]?.toString();
    const parts = homeRaw.trim().split(" ");
    const val = parseFloat(parts[0].replace(",", ".")) || 0;
    const unit = parts.slice(1).join(" ") || "";

    const micronutriente: Micronutrient = {
      nameFood: row[idxNombre]?.toString() || "",
      kcal: Number(row[idxKcal]) || 0,
      carb: Number(row[idxCarb]) || 0,
      protein: Number(row[idxProt]) || 0,
      fat: Number(row[idxFat]) || 0,
      homeUnit: {
        value: val,
        unit: unit,
      },
    };

    // Registrar código y agrupar en items
    codesSet.add(code);
    let item = items.find((it) => it.code === code);
    if (item) {
      item.food.push(micronutriente);
    } else {
      items.push({ code, food: [micronutriente] });
    }
  });

  // 4) Devolver resultado
  return {
    items,
    codes: Array.from(codesSet),
  };
}

function getExerciseDatabase(): ExerciseDatabase {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("#Ejercicios");
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

function getIntensificationTechniques(): IntensificationTechniques[] {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Enlaces");
  if (!sheet) throw new Error("La hoja 'Enlaces' no existe.");

  // Obtener el último número de fila con datos específicamente en la columna H
  const lastRow = sheet.getRange("H:H").getLastRow();

  // Si no hay datos después de la fila 7, retornar array vacío
  if (lastRow < 7) return [];

  // Obtener el rango desde H7 hasta I{última fila}
  const range = sheet.getRange(`H7:I${lastRow}`);
  const data = range.getValues();

  // Filtrar y mapear los datos a la estructura requerida
  const techniques: IntensificationTechniques[] = data
    .filter((row) => row[0] !== "") // Filtrar filas vacías
    .map((row) => ({
      name: row[0].toString().trim(),
      url: row[1].toString().trim(),
    }));

  return techniques;
}

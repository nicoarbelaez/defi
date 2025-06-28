const dayConfig: ConfigTableSection = {
  name: "day-config",
  title: {
    value: [
      { text: "Configuración de Día de Comidas", format: { bold: true } },
      { text: '(Hoja "Dieta")', format: { size: 10 } },
    ],
    range: "B2:F2",
  },
  subtitle: [
    { value: [{ text: "Nombre del Día", format: { bold: true } }], range: "B3" },
    { value: [{ text: "Inicio - Fin del Contenido", format: { bold: true } }], range: "C3" },
    {
      value: [
        { text: "Inicio Sumatoria Micronutrientes", format: { bold: true } },
        { text: "(Ocupará 4 celdas hacia abajo desde ese punto)", format: { size: 10 } },
      ],
      range: "D3",
    },
    { value: [{ text: "Tabla 1 (Comida 1-3)", format: { bold: true } }], range: "E3" },
    { value: [{ text: "Tabla 2 (Comida 4-6)", format: { bold: true } }], range: "F3" },
  ],
  content: [
    { value: [{ text: "Lunes" }], range: "B4" },
    { value: [{ text: "A44:I70" }], range: "C4", modifiable: true },
    { value: [{ text: "E46" }], range: "D4", modifiable: true },
    { value: [{ text: "A51:I60" }], range: "E4", modifiable: true },
    { value: [{ text: "A61:I70" }], range: "F4", modifiable: true },

    { value: [{ text: "Martes" }], range: "B5" },
    { value: [{ text: "A84:I110" }], range: "C5", modifiable: true },
    { value: [{ text: "E86" }], range: "D5", modifiable: true },
    { value: [{ text: "A91:I100" }], range: "E5", modifiable: true },
    { value: [{ text: "A101:I110" }], range: "F5", modifiable: true },

    { value: [{ text: "Miércoles" }], range: "B6" },
    { value: [{ text: "A125:I151" }], range: "C6", modifiable: true },
    { value: [{ text: "E127" }], range: "D6", modifiable: true },
    { value: [{ text: "A132:I141" }], range: "E6", modifiable: true },
    { value: [{ text: "A142:I151" }], range: "F6", modifiable: true },

    { value: [{ text: "Jueves" }], range: "B7" },
    { value: [{ text: "A166:I192" }], range: "C7", modifiable: true },
    { value: [{ text: "E168" }], range: "D7", modifiable: true },
    { value: [{ text: "A173:I182" }], range: "E7", modifiable: true },
    { value: [{ text: "A183:I192" }], range: "F7", modifiable: true },

    { value: [{ text: "Viernes" }], range: "B8" },
    { value: [{ text: "A206:I232" }], range: "C8", modifiable: true },
    { value: [{ text: "E208" }], range: "D8", modifiable: true },
    { value: [{ text: "A213:I222" }], range: "E8", modifiable: true },
    { value: [{ text: "A223:I232" }], range: "F8", modifiable: true },

    { value: [{ text: "Sábado" }], range: "B9" },
    { value: [{ text: "A246:I272" }], range: "C9", modifiable: true },
    { value: [{ text: "E248" }], range: "D9", modifiable: true },
    { value: [{ text: "A253:I262" }], range: "E9", modifiable: true },
    { value: [{ text: "A263:I272" }], range: "F9", modifiable: true },

    { value: [{ text: "Domingo" }], range: "B10" },
    { value: [{ text: "A286:I312" }], range: "C10", modifiable: true },
    { value: [{ text: "E288" }], range: "D10", modifiable: true },
    { value: [{ text: "A293:I302" }], range: "E10", modifiable: true },
    { value: [{ text: "A303:I312" }], range: "F10", modifiable: true },
  ],
};

const listConfig: ConfigTableSection = {
  name: "list-config",
  title: {
    value: [
      { text: "Configuración de Lista de Compras", format: { bold: true } },
      { text: '(Hoja "Dieta")' },
    ],
    range: "B12:C12",
  },
  subtitle: [
    { value: [{ text: "Número de la Columna", format: { bold: true } }], range: "B13" },
    { value: [{ text: "Rango de Celdas", format: { bold: true } }], range: "C13" },
  ],
  content: [
    { value: [{ text: "Columna 1" }], range: "B14" },
    { value: [{ text: "B328:B354" }], range: "C14", modifiable: true },
    { value: [{ text: "Columna 2" }], range: "B15" },
    { value: [{ text: "E328:E354" }], range: "C15", modifiable: true },
    { value: [{ text: "Columna 3" }], range: "B16" },
    { value: [{ text: "H328:H354" }], range: "C16", modifiable: true },
  ],
};

const exerciseConfig: ConfigTableSection = {
  name: "exercise-config",
  title: {
    value: [
      { text: "Configuración de ejercicios", format: { bold: true } },
      { text: `(Hoja "Mes 1")`, format: { size: 10 } },
    ],
    range: "B18:C18",
  },
  subtitle: [
    { value: [{ text: "Descripción", format: { bold: true } }], range: "B19" },
    { value: [{ text: "Celda", format: { bold: true } }], range: "C19" },
  ],
  content: [
    { value: [{ text: "Tabla semana 1" }], range: "B20" },
    { value: [{ text: "B3:Y16" }], range: "C20", modifiable: true },
  ],
};

const defaultConfig: ConfigTable = [dayConfig, listConfig, exerciseConfig];

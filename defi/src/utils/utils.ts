const setCellValue = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  range: string,
  textFragments: TextFragment[]
): void => {
  const cellRange = sheet.getRange(range);

  // Combinar celdas si el rango incluye múltiples celdas
  if (cellRange.getNumRows() > 1 || cellRange.getNumColumns() > 1) {
    cellRange.merge();
  }

  // Concatenar textos separados por espacio
  const concatenatedText = textFragments.map((frag) => frag.text).join(" ");
  cellRange.setValue(concatenatedText);
  // Ajustar texto (establece la opción de ajuste de texto en las celdas)
  cellRange.setWrap(true);

  // Crear objeto RichTextValue y aplicar estilos
  let richTextBuilder = SpreadsheetApp.newRichTextValue().setText(concatenatedText);
  let currentPosition = 0; // Puntero para manejar la posición de cada fragmento

  textFragments.forEach((frag) => {
    const length = frag.text.length;
    const format = frag.format || {}; // Si no hay formato definido, usar objeto vacío

    // Crear estilo de texto
    const textStyle = SpreadsheetApp.newTextStyle()
      .setBold(format.bold ? true : false)
      .setItalic(format.italic ? true : false)
      .setFontSize(format.size ?? 12)
      .setForegroundColor(format.color ?? "#000000")
      .build();

    // Aplicar estilo al rango del texto correspondiente
    richTextBuilder = richTextBuilder.setTextStyle(
      currentPosition,
      currentPosition + length,
      textStyle
    );

    // Avanzar el puntero
    currentPosition += length + 1; // +1 para el espacio entre fragmentos
  });

  // Aplicar el texto enriquecido al rango
  cellRange.setRichTextValue(richTextBuilder.build());
};

const setCellBorders = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  range: string,
  borders: Borders = {}
): void => {
  const cellRange = sheet.getRange(range);

  cellRange.setBorder(
    !!borders.top, // top
    !!borders.left, // left
    !!borders.bottom, // bottom
    !!borders.right, // right
    false, // innerHorizontal
    false, // innerVertical
    borders.top?.color ?? null, // Border color
    borders.top?.style === "dotted"
      ? SpreadsheetApp.BorderStyle.DOTTED
      : borders.top?.style === "dashed"
      ? SpreadsheetApp.BorderStyle.DASHED
      : SpreadsheetApp.BorderStyle.SOLID // Default: solid
  );
};

const setCellAlignment = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  range: string,
  alignment: Alignment = {}
): void => {
  const cellRange = sheet.getRange(range);
  cellRange.setHorizontalAlignment(alignment.horizontal ?? "center"); // Default: center
  cellRange.setVerticalAlignment(alignment.vertical ?? "middle"); // Default: middle
};

const setCellBackground = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  range: string,
  background: Background = {}
): void => {
  const cellRange = sheet.getRange(range);
  cellRange.setBackground(background.color ?? "#FFFFFF");
};

const showToast = (message: string, title: string = "ℹ️ Información"): void => {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  spreadsheet.toast(message, title);
};

const showAlert = (
  titleAlert: string | null,
  message: string,
  type: "info" | "warning" | "error" = "info"
): void => {
  let title = "";
  switch (type) {
    case "info":
      title = "ℹ️ Información";
      break;
    case "warning":
      title = "⚠️ Advertencia";
      break;
    case "error":
      title = "🔴 Error";
      break;
    default:
      title = "ℹ️ Información";
  }

  if (titleAlert) {
    title += " | " + titleAlert;
  }

  const ui = SpreadsheetApp.getUi();
  ui.alert(title, message, ui.ButtonSet.OK);
};

const joinCellValue = (cell: Cell): string => {
  return cell.value.map((v) => v.text).join(" ");
};
const setCellValue = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  range: string,
  textFragments: TextFragment[]
): void => {
  const cellRange = sheet.getRange(range);

  if (cellRange.getNumRows() > 1 || cellRange.getNumColumns() > 1) {
    cellRange.merge();
  }

  const concatenatedText = textFragments.map((frag) => frag.text).join(" ");
  if (concatenatedText.trim() === "") return;

  cellRange.setValue(concatenatedText).setWrap(true);

  const richTextBuilder = SpreadsheetApp.newRichTextValue().setText(concatenatedText);
  let currentPosition = 0;

  textFragments.forEach(({ text, format = {} }) => {
    const { bold = false, italic = false, size = 12, color = "#000000" } = format;
    const textStyle = SpreadsheetApp.newTextStyle()
      .setBold(bold)
      .setItalic(italic)
      .setFontSize(size)
      .setForegroundColor(color)
      .build();
    richTextBuilder.setTextStyle(currentPosition, currentPosition + text.length, textStyle);
    currentPosition += text.length + 1;
  });

  cellRange.setRichTextValue(richTextBuilder.build());
};

const setCellBorders = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  range: string,
  borders: Borders = {}
): void => {
  const cellRange = sheet.getRange(range);
  const { top, left, bottom, right } = borders;

  cellRange.setBorder(
    Boolean(top),
    Boolean(left),
    Boolean(bottom),
    Boolean(right),
    false,
    false,
    top?.color ?? null,
    top?.style === "dotted"
      ? SpreadsheetApp.BorderStyle.DOTTED
      : top?.style === "dashed"
      ? SpreadsheetApp.BorderStyle.DASHED
      : SpreadsheetApp.BorderStyle.SOLID
  );
};

const setCellAlignment = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  range: string,
  alignment: Alignment = {}
): void => {
  const cellRange = sheet.getRange(range);
  const { horizontal = "center", vertical = "middle" } = alignment;

  cellRange.setHorizontalAlignment(horizontal);
  cellRange.setVerticalAlignment(vertical);
};

const setCellBackground = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  range: string,
  background: Background = {}
): void => {
  const cellRange = sheet.getRange(range);
  cellRange.setBackground(background.color ?? "#FFFFFF");
};

const joinCellValue = (cell: Cell): string => {
  return cell.value.map((v) => v.text).join(" ");
};

// Función para verificar si una celda está vacía
const isCellEmpty = (sheet: GoogleAppsScript.Spreadsheet.Sheet, range: string): boolean => {
  const cellValue = sheet.getRange(range).getValue();
  return cellValue === "" || cellValue === null;
};

// Función para obtener los valores de una celda
const getCellValues = (sheet: GoogleAppsScript.Spreadsheet.Sheet, range: string): string[] => {
  const cellValues = sheet.getRange(range).getValue();
  return Array.isArray(cellValues) ? cellValues : [cellValues];
};

const clearCellValue = (sheet: GoogleAppsScript.Spreadsheet.Sheet, range: string): void => {
  const cellRange = sheet.getRange(range);
  cellRange.clearContent(); // Elimina solo el valor de la celda
};

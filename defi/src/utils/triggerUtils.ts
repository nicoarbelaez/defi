/**
 * Crea un trigger instalado para la función proporcionada.
 * @param {string} handlerFunction - El nombre de la función a manejar con el trigger.
 * @param {string} eventType - El tipo de evento (ej. 'onEdit', 'onOpen', etc.).
 */
function createTrigger(handlerFunction: string, eventType: "onOpen" | "onEdit") {
  // Verifica si el trigger ya está creado, y si no, lo crea
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === handlerFunction) {
      return; // Ya existe un trigger, no lo creamos de nuevo
    }
  }

  // Crea el trigger instalado para el evento proporcionado
  if (eventType === "onOpen") {
    ScriptApp.newTrigger(handlerFunction)
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onOpen() // Trigger de apertura de la hoja
      .create();
  } else if (eventType === "onEdit") {
    ScriptApp.newTrigger(handlerFunction)
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onEdit() // Trigger de edición de celda
      .create();
  }
  showToast(`✏️ Trigger '${eventType}' creado para ${handlerFunction} 📋`, "Éxito");
}

/**
 * Elimina un trigger instalado para la función proporcionada.
 * @param {string} handlerFunction - El nombre de la función asociada al trigger.
 * @param {string} eventType - El tipo de evento (ej. 'onEdit', 'onOpen', etc.).
 */
function deleteTrigger(handlerFunction: string, eventType: "onOpen" | "onEdit") {
  const triggers = ScriptApp.getProjectTriggers();

  // Recorre todos los triggers y elimina aquellos que coincidan con el handlerFunction
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === handlerFunction) {
      ScriptApp.deleteTrigger(trigger); // Elimina el trigger

      // Muestra un toast indicando que el trigger ha sido eliminado
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `🗑️ Trigger de tipo ${eventType} eliminado para ${handlerFunction} 🧹`,
        "Éxito",
        5
      );
      return; // Solo elimina el primer trigger que coincida
    }
  }

  // Si no se encuentra el trigger
  SpreadsheetApp.getActiveSpreadsheet().toast(
    `⚠️ No se encontró un trigger de tipo ${eventType} para ${handlerFunction}.`,
    "Info",
    5
  );
}

function defaultTriggers() {
  createTrigger("onOpenHandler", "onOpen");
  // createTrigger("onEditHandler", "onEdit");
}

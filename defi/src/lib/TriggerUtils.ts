function createTrigger(handlerFunction: string, eventType: "onOpen" | "onEdit") {
  try {
    Utils.showToast(
      "⚡ Configurando trigger",
      `Asociando evento '${eventType}' con la función '${handlerFunction}'`
    );

    const triggers = ScriptApp.getProjectTriggers();
    for (const trigger of triggers) {
      if (trigger.getHandlerFunction() === handlerFunction) {
        Utils.showToast(
          "🔁 Trigger existente",
          `El trigger para '${handlerFunction}' ya estaba configurado.`
        );
        return; // Ya existe un trigger, no lo creamos de nuevo
      }
    }

    if (eventType === "onOpen") {
      ScriptApp.newTrigger(handlerFunction)
        .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
        .onOpen()
        .create();
    } else if (eventType === "onEdit") {
      ScriptApp.newTrigger(handlerFunction)
        .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
        .onEdit()
        .create();
    }

    Utils.showToast(`✅ Trigger '${eventType}' creado con éxito`, `Función: ${handlerFunction}`);
  } catch (error) {
    Utils.showAlert("❌ Error al crear trigger", error.message, "error");
    throw error;
  }
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

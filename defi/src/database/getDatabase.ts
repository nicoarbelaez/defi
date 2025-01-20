function getDataBase(validateUpdate: boolean = true): ResponseDoGet {
  const DB_KEY = "db"; // Clave para almacenar la base de datos en las propiedades del documento
  const DATABASE_URL =
    "https://script.google.com/macros/s/AKfycbz3d3dXDT2a24xhpzuubKIfynxxu0bnEc4CXMlDiP_Ao5V0QaHO_jMETe3tU1v7gumH/exec";

  try {
    // Obtener la base de datos local desde las propiedades
    const localDb = DocumentPropertiesService.getProperty(DB_KEY);

    // Si no se requiere validar actualización, devolver localDb directamente
    if (!validateUpdate && localDb) {
      return localDb;
    }

    // Hacer la solicitud GET
    const response = UrlFetchApp.fetch(DATABASE_URL);

    // Capturar el código de respuesta y el cuerpo
    const statusCode = response.getResponseCode();
    const responseBody = response.getContentText();

    // Validar el código de respuesta
    if (statusCode !== 200) {
      throw new Error(
        `El servidor devolvió un código de error: ${statusCode}. Respuesta: ${responseBody}`
      );
    }

    const fetchedDb: ResponseDoGet = JSON.parse(responseBody);

    // Validar si el JSON retornado tiene estructura válida
    if (!fetchedDb || !fetchedDb.lastUpdate) {
      throw new Error("El JSON recibido no contiene datos válidos.");
    }

    // Comparar `lastUpdate` y decidir si actualizar
    if (localDb && localDb.lastUpdate === fetchedDb.lastUpdate) {
      return localDb; // La base de datos local está actualizada
    }

    // Actualizar la base de datos local
    DocumentPropertiesService.setProperty(DB_KEY, fetchedDb);
    return fetchedDb;
  } catch (error) {
    // Mostrar alerta con detalles del error
    Utils.showAlert(
      "Error al obtener datos",
      `No fue posible obtener la base de datos desde el servidor. 
        Detalles del error: ${error.message}
  
        Por favor, comuníquese con el administrador.`,
      "error"
    );

    // Lanza el error nuevamente para permitir debugging o logs adicionales
    throw new Error(`Error en getDataBase: ${error.message}`);
  }
}

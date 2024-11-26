class DocumentPropertiesService {
    private static properties = PropertiesService.getDocumentProperties();
  
    /**
     * Obtiene el valor de una propiedad del documento y lo deserializa.
     * @param {string} key - La clave de la propiedad a obtener.
     * @returns {any | null} - El valor deserializado de la propiedad o null si no existe.
     */
    static getProperty(key: string): any | null {
      const property = this.properties.getProperty(key);
      return property ? JSON.parse(property) : null;
    }
  
    /**
     * Establece o actualiza una propiedad del documento, serializándola.
     * @param {string} key - La clave de la propiedad.
     * @param {any} value - El valor de la propiedad.
     */
    static setProperty(key: string, value: any): void {
      const serializedValue = JSON.stringify(value);
      this.properties.setProperty(key, serializedValue);
    }
  
    /**
     * Elimina una propiedad específica del documento.
     * @param {string} key - La clave de la propiedad a eliminar.
     */
    static deleteProperty(key: string): void {
      this.properties.deleteProperty(key);
    }
  
    /**
     * Obtiene todas las propiedades del documento y las deserializa.
     * @returns {{ [key: string]: any }} - Un objeto con todas las propiedades deserializadas.
     */
    static getAllProperties(): { [key: string]: any } {
      const allProperties = this.properties.getProperties();
      const deserializedProperties: { [key: string]: any } = {};
  
      for (const key in allProperties) {
        deserializedProperties[key] = JSON.parse(allProperties[key]);
      }
  
      return deserializedProperties;
    }
  
    /**
     * Elimina todas las propiedades del documento.
     */
    static clearAllProperties(): void {
      this.properties.deleteAllProperties();
    }
  }
  
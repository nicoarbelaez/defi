# TrainerElite

## Descripción

**TrainerElite** es una solución automatizada diseñada para optimizar el flujo de trabajo de un cliente del sector fitness. Este proyecto tiene como objetivo principal asesorar a personas en el logro de sus metas mediante la creación de planes alimenticios y rutinas de ejercicio personalizadas. La automatización desarrollada acelera procesos clave, permitiendo al cliente enfocarse en brindar un mejor servicio a sus usuarios.

Además, como parte del proyecto, se creó una aplicación utilizando **AppSheet** como plataforma no-code para calcular el intercambio de alimentos de manera dinámica y eficiente.

## Beneficios

- **Optimización del tiempo**: Automatización de tareas repetitivas en Google Sheets para facilitar la gestión de clientes y datos.
- **Acceso rápido a información personalizada**: Herramientas que permiten calcular intercambios alimenticios al instante.
- **Escalabilidad**: Uso de tecnologías modernas y plataformas no-code que permiten iteraciones rápidas y fáciles actualizaciones.

## Stack Tecnológico

| Apps Script                                                                                                  | TypeScript                                                                                                                                                       | AppSheet                                                                                            |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| <img src="https://i.imgur.com/woifoON.png" title="Apps Script"  alt="Apps Script" width="auto" height="55"/> | <img src="https://github.com/devicons/devicon/blob/master/icons/typescript/typescript-original.svg" title="TypeScript" alt="TypeScript" width="55" height="55"/> | <img src="https://i.imgur.com/VFECZOg.png" title="AppSheet" alt="AppSheet" width="55" height="55"/> |

## Instalación

1. **Instalar las dependencias del proyecto:**

   ```bash
   pnpm install
   ```

2. **Instalar `clasp` globalmente:**

   ```bash
   pnpm install -g @google/clasp
   ```

3. **Iniciar sesión en tu cuenta de Google:**
   ```bash
   clasp login
   ```

4. **Moverse al directorio correspondiente:**
   - Navega a `/defi-db` o `/defi` según el caso. Esto es importante para asegurar que los archivos correctos estén en la ubicación adecuada antes de realizar la carga.

5. **Vincular tu secuencia de comandos con el ID correspondiente:**
   ```bash
   clasp setting scriptId "ID de secuencia de comandos"
   ```
   Reemplaza `"ID de secuencia de comandos"` con el ID real de tu proyecto en Google Apps Script.

## Uso

1. **Subir el proyecto a Google Apps Script:**
   ```bash
   pnpm push
   ```

> [!NOTE]
> Asegúrate de que la estructura del proyecto mantenga los siguientes directorios y archivos clave:
>
> - `/defi`: Contiene los archivos de lógica para la gestión de clientes.
> - `/defi-db`: Maneja la base de datos interna del proyecto.

2. **Configuración adicional**:
   Una vez desplegado en Google Apps Script, ajusta las configuraciones necesarias según las especificaciones del cliente.

## Experiencia y Aprendizajes

Durante el desarrollo de este proyecto:

- Aprendí a integrar **Apps Script** y **AppSheet**, maximizando el potencial de las herramientas no-code y low-code.
- Mejoré la gestión de proyectos colaborativos mediante el uso de TypeScript para mantener un código más limpio y estructurado.
- Desarrollé habilidades para optimizar flujos de trabajo dentro de Google Sheets y automatizar procesos repetitivos.
- Gané experiencia en la creación de interfaces intuitivas que simplifican cálculos complejos.

> [!TIP]
> Si eres nuevo en AppSheet, aprovecha su documentación oficial para explorar todo su potencial.

> [!IMPORTANT]
> Asegúrate de validar cada iteración de los flujos automatizados con el cliente para garantizar que cumplan con sus expectativas y necesidades específicas.

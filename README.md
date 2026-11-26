# DeFi

[English](./README.en.md) | Español

DeFi automatiza el flujo de trabajo de un cliente del sector fitness que asesora personas con planes alimenticios y rutinas de ejercicio. Está formado por dos proyectos de Google Apps Script en TypeScript (la lógica de la hoja de cálculo del cliente y una base de datos interna que expone JSON), una API Express que dibuja un mapa muscular y una app de AppSheet para calcular intercambios de alimentos. La app de AppSheet la construyó Nicolas Arbelaez y no vive en este repositorio.

## Qué incluye

- **Hoja del cliente** (`defi/`): menú de macros, triggers de edición, listas desplegables dependientes (grupo muscular, ejercicio y enlace), tablas de dieta por día y comida, lista de compras y configuración generada por rangos.
- **Base de datos interna** (`defi-db/`): Apps Script que publica los ejercicios y técnicas de intensificación como JSON mediante una web app (`doGet`), con caché en `PropertiesService` y actualización con debounce de 3500 ms al editar las hojas `#Ejercicios` y `Enlaces`.
- **API de mapa muscular** (`api/`): servicio Express que recibe el nivel de cada músculo por query y devuelve una imagen PNG o JPG del cuerpo coloreado. Ver [`api/README.md`](./api/README.md).
- **App de AppSheet** (fuera del repo): cálculo dinámico de intercambios de alimentos.

## Stack

| Parte      | Tecnología                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Hoja y DB  | Google Apps Script (runtime V8, zona horaria `America/Bogota`), TypeScript ^5.6.3, `@types/google-apps-script` ^1.0.85   |
| Despliegue | `@google/clasp` ^2.4.2, pnpm                                                                                             |
| API        | Node.js, Express ^5.1.0, sharp ^0.34.2, cheerio ^1.1.0, express-rate-limit ^8.0.1, morgan ^1.10.0, chalk ^5.3.0, Vercel |
| No-code    | AppSheet                                                                                                                 |

## Requisitos

- Node.js y pnpm (la API declara `pnpm@10.12.4`).
- Una cuenta de Google con acceso a los proyectos de Apps Script.
- `@google/clasp` instalado globalmente.

## Instalación

1. Instalar dependencias en la carpeta del proyecto que vayas a usar (`defi/`, `defi-db/` o `api/`):

   ```bash
   pnpm install
   ```

2. Instalar `clasp` globalmente:

   ```bash
   pnpm install -g @google/clasp
   ```

3. Iniciar sesión en Google:

   ```bash
   clasp login
   ```

4. Entrar a `defi/` o `defi-db/` según el caso, para que los archivos correctos queden en la ubicación adecuada antes de subir.

5. Vincular el proyecto con el ID de su script (`defi/.clasp.json` y `defi-db/.clasp.json` no se versionan):

   ```bash
   clasp setting scriptId "ID de secuencia de comandos"
   ```

## Scripts

| Comando      | Dónde               | Qué hace                                     |
| ------------ | ------------------- | -------------------------------------------- |
| `pnpm push`  | `defi/`, `defi-db/` | Sube el código a Apps Script (`clasp push`)  |
| `pnpm pull`  | `defi/`, `defi-db/` | Baja el código de Apps Script (`clasp pull`) |
| `pnpm dev`   | `api/`              | Servidor con nodemon                         |
| `pnpm start` | `api/`              | Servidor con Node                            |

Tras desplegar en Apps Script, ajusta la configuración según las especificaciones del cliente. Valida cada iteración de los flujos automatizados con el cliente.

## Estructura

```
defi/        # Apps Script de la hoja del cliente (onOpen, onEdit, config, database, sheet, util)
defi-db/     # Apps Script que expone la base de datos interna como JSON
api/         # API Express del mapa muscular (desplegada en Vercel)
docs/        # Arquitectura con diagramas
```

## Documentación

- [`docs/architecture.md`](./docs/architecture.md): contexto, flujo de datos y estructura de carpetas.
- [`api/README.md`](./api/README.md): contrato y uso de la API de mapa muscular.

## Aprendizajes

- Integrar Apps Script con AppSheet aprovecha herramientas no-code y low-code sin perder control del código.
- TypeScript mantiene ordenado el código de Apps Script en un proyecto colaborativo.
- Automatizar flujos en Google Sheets y crear interfaces que simplifican cálculos complejos reduce el trabajo repetitivo del cliente.

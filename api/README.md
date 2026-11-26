# muscle-api

[English](./README.en.md) | Español

API Express que dibuja un mapa muscular. Recibe el nivel de cada músculo por query y devuelve una imagen PNG o JPG del cuerpo coloreado, para insertarla en la rutina del cliente.

## Endpoint

`GET /api/v1/muscles`

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| `triceps`, `biceps`, `lumbar`, `trapecio`, `dorsal`, `pectoral`, `hombros`, `abdomen`, `antebrazo`, `cuadriceps`, `aductores`, `femoral`, `gluteo`, `pantorrillas` | número | Nivel del músculo. Si falta o no es numérico, vale 0. |
| `format` | `png` o `jpg` | Formato de salida. Cualquier otro valor devuelve `png`. |

Respuestas: `200` con `Content-Type: image/png` o `image/jpeg`; `500` con `{ "error": "Error generando la imagen" }`; `429` con `{ "error": "Too many requests, slow down!" }`.

Límite de tasa: 30 solicitudes por IP por minuto.

```bash
curl "http://localhost:3000/api/v1/muscles?pectoral=3&biceps=2&format=jpg" -o muscles.jpg
```

## Stack

Node.js, Express ^5.1.0, cheerio ^1.1.0 (edita el SVG), sharp ^0.34.2 (convierte a PNG o JPG), express-rate-limit ^8.0.1, morgan ^1.10.0, chalk ^5.3.0. Despliegue en Vercel (`vercel.json`).

## Desarrollo

```bash
pnpm install
pnpm dev      # nodemon src/app.js
pnpm start    # node src/app.js
```

El puerto sale de `PORT` (3000 por defecto).

## Estructura

```
src/
├── app.js                            # servidor, límite de tasa y manejo de errores
├── controllers/musclesController.js  # lee la query, arma el SVG y lo convierte
├── templates/body.svg                # plantilla del cuerpo
└── utils/                            # svgBuilder, imageConverter, logger
```

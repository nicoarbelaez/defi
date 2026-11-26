# DeFi

English | [Español](./README.md)

DeFi automates the workflow of a fitness-sector client who coaches people with meal plans and exercise routines. It is made of two TypeScript Google Apps Script projects (the logic behind the client's spreadsheet and an internal database that serves JSON), an Express API that draws a muscle map, and an AppSheet app that calculates food exchanges. Nicolas Arbelaez built the AppSheet app; it does not live in this repository.

## What it includes

- **Client spreadsheet** (`defi/`): macro menu, edit triggers, dependent dropdowns (muscle group, exercise, and link), diet tables per day and meal, a shopping list, and range-based generated configuration.
- **Internal database** (`defi-db/`): an Apps Script that publishes exercises and intensification techniques as JSON through a web app (`doGet`), cached in `PropertiesService` and refreshed with a 3500 ms debounce when the `#Ejercicios` and `Enlaces` sheets are edited.
- **Muscle map API** (`api/`): an Express service that takes each muscle's level as a query parameter and returns a PNG or JPG of the colored body. See [`api/README.en.md`](./api/README.md).
- **AppSheet app** (outside the repo): dynamic food-exchange calculation.

## Stack

| Part         | Technology                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Sheet and DB | Google Apps Script (V8 runtime, `America/Bogota` time zone), TypeScript ^5.6.3, `@types/google-apps-script` ^1.0.85       |
| Deployment   | `@google/clasp` ^2.4.2, pnpm                                                                                              |
| API          | Node.js, Express ^5.1.0, sharp ^0.34.2, cheerio ^1.1.0, express-rate-limit ^8.0.1, morgan ^1.10.0, chalk ^5.3.0, Vercel  |
| No-code      | AppSheet                                                                                                                  |

## Requirements

- Node.js and pnpm (the API declares `pnpm@10.12.4`).
- A Google account with access to the Apps Script projects.
- `@google/clasp` installed globally.

## Setup

1. Install dependencies in the project folder you will use (`defi/`, `defi-db/`, or `api/`):

   ```bash
   pnpm install
   ```

2. Install `clasp` globally:

   ```bash
   pnpm install -g @google/clasp
   ```

3. Sign in to Google:

   ```bash
   clasp login
   ```

4. Move into `defi/` or `defi-db/` as needed, so the right files are in place before pushing.

5. Link the project to its script ID (`defi/.clasp.json` and `defi-db/.clasp.json` are not versioned):

   ```bash
   clasp setting scriptId "script ID"
   ```

## Scripts

| Command      | Where               | What it does                                   |
| ------------ | ------------------- | ---------------------------------------------- |
| `pnpm push`  | `defi/`, `defi-db/` | Pushes the code to Apps Script (`clasp push`)  |
| `pnpm pull`  | `defi/`, `defi-db/` | Pulls the code from Apps Script (`clasp pull`) |
| `pnpm dev`   | `api/`              | Server with nodemon                            |
| `pnpm start` | `api/`              | Server with Node                               |

After deploying to Apps Script, adjust the configuration to the client's specifications. Validate each iteration of the automated flows with the client.

## Structure

```
defi/        # Apps Script for the client's sheet (onOpen, onEdit, config, database, sheet, util)
defi-db/     # Apps Script that serves the internal database as JSON
api/         # Express muscle map API (deployed on Vercel)
docs/        # Architecture with diagrams
```

## Documentation

- [`docs/architecture.en.md`](./docs/architecture.en.md): context, data flow, and folder structure.
- [`api/README.en.md`](./api/README.md): contract and usage of the muscle map API.

## Lessons learned

- Integrating Apps Script with AppSheet leverages no-code and low-code tools without giving up control of the code.
- TypeScript keeps Apps Script code tidy in a collaborative project.
- Automating Google Sheets flows and building interfaces that simplify complex calculations cuts the client's repetitive work.

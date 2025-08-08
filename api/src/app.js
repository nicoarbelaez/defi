import express from "express";
import rateLimit from "express-rate-limit";
import musclesController from "./controllers/musclesController.js";
import { morganMiddleware } from "./utils/logger.js";

const app = express();
const port = process.env.PORT || 3000;

const muscleLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // Máximo 30 solicitudes por IP cada minuto
  message: { error: "Too many requests, slow down!" },
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

// Agregar middleware de logging
app.use(morganMiddleware);

app.get("/api/v1/muscles", muscleLimiter, musclesController);

// Middleware para logging de errores
app.use((err, req, res, next) => {
  console.error(chalk.red(`[${new Date().toISOString()}] Error: ${err.message}`));
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

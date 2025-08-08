import express from "express";
import rateLimit from "express-rate-limit";
import musclesController from "./controllers/musclesController.js";

const app = express();
const port = process.env.PORT || 3000;

const muscleLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // Máximo 30 solicitudes por IP cada minuto
  message: { error: "Too many requests, slow down!" },
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.get("/api/v1/muscles", muscleLimiter, musclesController);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

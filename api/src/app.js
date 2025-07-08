import express from 'express';
import musclesController from './controllers/musclesController.js';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/v1/muscles', musclesController);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

import express from 'express';
import router from './routes/userRoutes.js';
import eventRouter from './routes/eventRoutes.js';
import { MiddlewareAuth } from './middlewares/auth.js';
import cors from 'cors';

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: '*',
  }),
);

app.use(router);

app.use(eventRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

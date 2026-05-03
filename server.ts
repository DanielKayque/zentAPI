import express from 'express';
import router from './routes/userRoutes.js';
import eventRouter from './routes/eventRoutes.js';
import { MiddlewareAuth } from './middlewares/auth.js';

const app = express();

app.use(express.json());
app.use(router);


app.use(eventRouter);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

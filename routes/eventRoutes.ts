import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  getPublicEvent,
  updateEvent,
} from '../controllers/eventController.js';
import { MiddlewareAuth } from '../middlewares/auth.js';

const router = Router();

const auth = new MiddlewareAuth();

//ROTAS PUBLICAS
router.use('/event/public/:id', getPublicEvent);

router.use(auth.auth);
//ROTAS PRIVADAS
router.post('/event', createEvent);
router.get('/event', getEvents);
router.get('/event/:id', getEvent);
router.delete('/event/:id', deleteEvent);
router.put('/event/:id', updateEvent);

export default router;

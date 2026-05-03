import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEvents,
} from '../controllers/eventController.js';
import { MiddlewareAuth } from '../middlewares/auth.js';

const router = Router();

const auth = new MiddlewareAuth();

router.use(auth.auth);

router.post('/event', createEvent);
router.get('/event', getEvents);
router.delete('/event/:id', deleteEvent);

export default router;

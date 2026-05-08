import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
} from '../controllers/eventController.js';
import { MiddlewareAuth } from '../middlewares/auth.js';

const router = Router();

const auth = new MiddlewareAuth();

router.use(auth.auth);

router.post('/event', createEvent);
router.get('/event', getEvents);
router.delete('/event/:id', deleteEvent);
router.get('/event/:id', getEvent);

export default router;

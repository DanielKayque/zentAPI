import { Router } from 'express';
import {
  createUser,
  deleteMe,
} from '../controllers/userController.js';
import { AuthControler } from '../controllers/AuthController.js';

const router = Router();

const authControler = new AuthControler();

router.post('/register', createUser);
// router.put('/user/:id', putUser);
router.delete('/user/exclude', deleteMe);
router.post('/login', authControler.login);

export default router;

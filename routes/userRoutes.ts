import { Router } from 'express';
import {
  createUser,
  deleteMe,
  forgotPassword,
} from '../controllers/userController.js';
import { AuthControler } from '../controllers/AuthController.js';

const router = Router();

//classe instanciada apenas para fazer login
const authControler = new AuthControler();

router.post('/register', createUser);
router.post('/forgotpassword', forgotPassword);
// router.put('/user/:id', putUser);
router.delete('/user/exclude', deleteMe);
router.post('/login', authControler.login);

export default router;

import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

type ReqBody = {
  email: string;
  password: string;
};

export class AuthControler {
  async login(req: Request<{}, {}, ReqBody>, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res
          .status(401)
          .json({ error: true, message: 'Username or password invalid.' });
      }

      //Se passou pra cá, podemos verificar os passwords//
      const passwordCompare = await bcrypt.compare(password, user.password);

      if (!passwordCompare) {
        return res
          .status(401)
          .json({ error: true, message: 'User or password incorrect.' });
      }
      //Se passou pra cá senha correta, fazemos a lógica do token para retorná-lo.
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' },
      );

      return res.status(200).json({
        error: false,
        token,
        user: {
          name: user.name,
          email: user.email,
        },
      });
    } catch (e) {
      return res.status(400).json({ error: true, message: 'Invalid error' });
    }
  }
}

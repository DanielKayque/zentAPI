import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

type MyTokenPayload = {
  id: string;
  iat: number;
  exp: number;
};

export class MiddlewareAuth {
  async auth(req: Request, res: Response, next: NextFunction) {
    //Salvamos o token aqui.
    const { authorization } = req.headers;

    //Verificamos se o header existe
    if (!authorization) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    //O header vem como "Bearer <token>", precisamos separar, e nn utilizaremos o Bearer, por isso a vírgula.
    const [, token] = authorization.split(' ') as [string, string];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as MyTokenPayload;

      //Se chegou aqui o token é válido!

      const { id } = decoded;

      //Tipei o req como any para o typescript nn reclamar que nn existe userId em req
      (req as any).userId = id;

      //Caso tudo ocorrer bem, seguimos adiante usando a função next.
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Token invalid' });
    }
  }
}

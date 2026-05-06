import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { User } from '../generated/prisma/browser.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import bcrypt from 'bcrypt';
import { registerUserSchema } from '../schema/registerUserSchema.js';
import z from 'zod';

//Criar usuários//
export const createUser = async (req: Request<{}, {}, User>, res: Response) => {
  try {
    //Validação ZOD
    const result = registerUserSchema.safeParse(req.body);

    if (result.error) {
      const errorTree = z.treeifyError(result.error);

      return res.status(400).json({
        error: true,
        message: 'Data validation failed.',
        errors: errorTree,
      });
    }

    const { name, email, password } = result.data;

    //Transformar senha em hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        name: true,
        email: true,
      },
    });

    return res.status(201).json({
      error: false,
      message: 'User created',
      newUser,
    });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({
          error: true,
          message: 'This email already exists',
        });
      }

      // return res.status(400).json({ error: true, message: 'Unknown error!' });
      console.error('ERRO PRISMA:', err.message);
      return res.status(400).json({
        error: true,
        message: `Prisma Code: ${err.code}`,
        details: err.message,
      });
    }
  }
  return res.status(500).json({ error: true, message: 'Unknown error again' });
};

//Listar usuários//
// export const listUsers = async (req: Request, res: Response) => {
//   try {
//     const data = await prisma.user.findMany();
//     if (!data) {
//       return res
//         .status(400)
//         .json({ error: true, message: 'No registered users' });
//     }
//     return res.status(200).json(data);
//   } catch (e) {
//     return res.status(400).json({ err: true, message: 'Unknown error' });
//   }
// };

//Deletar usuarios
export const deleteMe = async (req: Request, res: Response) => {
  const loggedIn = req.userId;

  try {
    const data = await prisma.user.delete({
      where: {
        id: Number(loggedIn),
      },
    });

    return res
      .status(200)
      .json({ message: 'User deleted with sucesfull.', data });
  } catch (error: unknown) {
    return res.status(500).json({ message: 'Internal error.' });
  }
};

//Editar todo um usuário
// export const putUser = async (
//   req: Request<UserParams, {}, User>,
//   res: Response,
// ) => {
//   const { name, email, password } = req.body;

//   const { id } = req.params;

//   if (!name || !email) {
//     return res.status(400).json({ error: true, message: 'Data is mandatory' });
//   }

//   try {
//     const data = await prisma.user.update({
//       where: {
//         id: Number(id),
//       },
//       data: {
//         name,
//         email,
//         password,
//       },
//     });
//     console.log(name, email);

//     return res.status(201).json({
//       error: false,
//       message: 'User altered',
//       data,
//     });
//   } catch (err: unknown) {
//     if (err instanceof PrismaClientKnownRequestError) {
//       if (err.code === 'P2002') {
//         return res.status(409).json({
//           error: true,
//           message: 'This email already exists',
//         });
//       }
//       return res.status(400).send('Unknown error!');
//     }
//   }
//   return res.status(500).json({ error: true, message: 'Unknown error again' });
// };

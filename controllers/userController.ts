import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { User } from '../generated/prisma/browser.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import bcrypt from 'bcrypt';
import { registerUserSchema } from '../schema/registerUserSchema.js';
import z from 'zod';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.API_KEY);

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

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please send a valid email.' });
  }

  try {
    //Pegar o usuário atráves do email
    const user = await prisma.user.findUnique({ where: { email } });

    //Verificar existência do usuário
    if (!user) {
      return res.status(200).json({ message: 'User not found.' });
    }

    //Gera o token de 32 bits e converte para string hexadecimal
    const token = crypto.randomBytes(32).toString('hex');

    const QUINZE_MINUTES_EM_MS = 15 * 60 * 1000;

    const expirationDate = new Date(Date.now() + QUINZE_MINUTES_EM_MS);

    await prisma.user.update({
      where: { email },
      data: {
        reset_password_token: token,
        reset_password_expires: expirationDate,
      },
    });

    //Enviar mensagem
    await resend.emails.send({
      from: 'Zent <onboarding@resend.dev>',
      to: email,
      subject: 'Recuperação de senha - Zent',
      html: `<p>Olá! Clique <a href="${process.env.BASE_URL}/reset-password?token=${token}">aqui</a> para criar uma nova senha.</p>`,
    });

    return res.status(200).json({
      message: "We've sent a link to the email address you provided.",
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error in forgotPassword' + err);
      return res
        .status(500)
        .json({ message: 'Internal server error. Please try again later' });
    }
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const dateNow = new Date(Date.now());

    const userFound = await prisma.user.findFirst({
      where: { reset_password_token: token },
      select: {
        name: true,
        id: true,
        reset_password_expires: true,
      },
    });

    if (!userFound) {
      return res.status(404).json({ message: 'Token not valid' });
    }

    if (
      userFound.reset_password_expires &&
      dateNow > userFound.reset_password_expires
    ) {
      return res
        .status(404)
        .json({ message: 'Token not valid, please try again' });
    }

    //Chegou até aqui acabou as validações
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userFound.id },
      data: {
        password: hashedPassword,
        reset_password_expires: null,
        reset_password_token: null,
      },
    });

    return res.status(201).json({ message: 'Password updated suscefully' });
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error in resetPassword', err);
      return res
        .status(500)
        .json({ message: 'Unknown error, please try again later' });
    }
  }
};

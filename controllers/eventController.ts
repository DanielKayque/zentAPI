import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { Event } from '../generated/prisma/client.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

type CreateEvent = {
  id: number;
  address: string;
  name: string;
  date: string;
  limitParticipants?: number;
  creatorId: number;
};

//Criar um evento//
export const createEvent = async (
  req: Request<{}, {}, CreateEvent>,
  res: Response,
) => {
  const { name, date, address, limitParticipants = 0 } = req.body;

  const loggedId = (req as any).userId;

  if (!name || !date || !address) {
    return res
      .status(400)
      .json({ error: true, message: 'Dados obrigatórios não preenchidos.' });
  }

  try {
    const data = await prisma.event.create({
      data: {
        address,
        date: new Date(date),
        name,
        limitParticipants,
        creatorId: Number(loggedId),
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({ message: 'Event created.', data });
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return res
          .status(400)
          .json({ error: 'O usuário criador informado não existe.' });
      }
    }

    return res.status(500).json({ error: 'Erro interno ao criar o evento.' });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const loggedId = req.userId;

    const data = await prisma.event.findMany({
      where: { creatorId: Number(loggedId) },
    });

    if (!data) return res.status(200).json(data);

    return res.status(200).json(data);
  } catch (e: unknown) {
    res.status(400).json({ error: true, message: 'Unknown error' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  //Desestrutura o parâmetro que vem da URL do qual será o parâmetro do evento que vamos deletar
  const { id } = req.params;

  try {
    //Pega o token de autenticação
    const loggedId = req.userId;

    const deletedEvent = await prisma.event.deleteMany({
      where: {
        id: Number(id),
        creatorId: Number(loggedId),
      },
    });

    if (deletedEvent.count === 0) {
      return res
        .status(401)
        .json({ error: 'Operation not permitted or event not found.' });
    }

    return res.status(200).json({ message: 'Sucess, event deletted.' });
  } catch (e) {
    return res.status(500).json({ error: 'Error deleting event.' });
  }
};

// export const getEvent = async (req: Request, res: Response) => {
//   const eventId = Number(req.params.id); // ID do evento (da URL)
//   const loggedUserId = req.userId; // ID do usuário (do Token)

//   try {
//     // Tenta deletar cruzando as duas informações
//     const event = await prisma.event.findUnique({
//       where: {
//         id: eventId,
//         creatorId: Number(loggedUserId), // 🔒 A trava de segurança!
//       },
//     });

//     return res.status(200).json(event);
//   } catch (error) {
//     return res.status(403).json({
//       error: true,
//       message: 'Você não tem permissão para ler este evento.',
//     });
//   }
// };
export const getEvent = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  const loggedUserId = req.userId;

  try {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        creatorId: Number(loggedUserId),
      },
    });

    if (!event) {  // ← Adiciona essa verificação
      return res.status(403).json({
        error: true,
        message: 'Event not found.',
      });
    }

    return res.status(200).json(event);  //
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar evento.',
    });
  }
};
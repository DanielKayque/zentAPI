![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-blue?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-20+-green?style=flat-square)

API robusta para gerenciamento de eventos com autenticação JWT, construída com TypeScript e Prisma.

## 🚀 Stack

- **Node.js** 20+ | **Express** 5.2+ | **TypeScript** 6.0+
- **Prisma** 7.8+ (ORM) | **PostgreSQL** (Supabase)
- **JWT** (Autenticação) | **Bcrypt** (Hash de senhas)
- **Zod** (Validação)

## 📦 Instalação

```bash
# Clonar e instalar
git clone <repo>
cd eventos-backend
npm install

# Configurar .env
DATABASE_URL="postgresql://..."
JWT_SECRET="sua_chave_secreta"

# Migrations
npx prisma migrate deploy

# Rodar em desenvolvimento
npm run dev
```

## 📚 Endpoints

| Método | Rota            | Descrição         | Auth |
| ------ | --------------- | ----------------- | ---- |
| POST   | `/register`     | Registrar usuário | ❌   |
| POST   | `/login`        | Login (JWT)       | ❌   |
| DELETE | `/user/exclude` | Deletar conta     | ✅   |
| POST   | `/event`        | Criar evento      | ✅   |
| GET    | `/event`        | Listar eventos    | ✅   |

## 🗄️ Modelos

- **User**: id, email, password, name, created_at
- **Event**: id, name, address, date, limitParticipants, creatorId
- **Participant**: id, nome, email, eventId

## 🔒 Segurança

✅ Hash com Bcrypt | ✅ JWT Stateless | ✅ CORS | ✅ Senhas nunca expostas

## 📋 Status

- [x] Setup Express + TypeScript
- [x] Prisma + PostgreSQL
- [x] Autenticação (Login/Register)
- [x] CRUD de eventos
- [x] Validação Zod
- [ ] Testes
- [ ] Swagger/OpenAPI

## 👨‍💻 Autor

**Daniel Kayque** - [GitHub](https://github.com/DanielKayque) | [LinkedIn](https://linkedin.com/daniel-kayque)

## 🌍 Deploy

A API está hospedada no Render e utiliza Supabase (PostgreSQL) como banco de dados principal.

Nota: No plano gratuito, a primeira requisição pode levar cerca de 50s para ser processada (Cold Start).

---

Made with ❤️ | ISC License

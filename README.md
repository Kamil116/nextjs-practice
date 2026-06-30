# Linear Clone

A project management application built with Next.js, inspired by Linear.

## Features

- User authentication (sign up, sign in, sign out) via JWT cookies
- Issue management (create, update, delete)
- Protected dashboard and issue routes
- Modern UI with Tailwind CSS
- Responsive design

## Tech Stack

- [Next.js 16](https://nextjs.org/) with App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Drizzle ORM](https://orm.drizzle.team/) with [Neon](https://neon.tech/) PostgreSQL
- [jose](https://github.com/panva/jose) for JWT authentication
- [Vitest](https://vitest.dev/) for testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database ([Neon](https://neon.tech/) recommended)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/linear-clone.git
   cd linear-clone
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Copy the environment file and set your values

   ```bash
   cp .env.example .env.local
   ```

   Required variables:

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | Neon PostgreSQL connection string |
   | `JWT_SECRET` | Secret for signing JWTs (minimum 32 characters) |

   Generate a secure JWT secret:

   ```bash
   openssl rand -base64 32
   ```

4. Push the database schema to Neon

   ```bash
   npm run db:push
   ```

   Optionally seed sample data:

   ```bash
   npm run seed
   ```

5. Start the development server

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploying to Vercel

1. Import the project into [Vercel](https://vercel.com/)
2. Add environment variables in **Project Settings → Environment Variables**:
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — at least 32 characters (use `openssl rand -base64 32`)
3. After the first deploy (or before), apply the schema to your production database:

   ```bash
   DATABASE_URL="your-neon-url" npm run db:push
   ```

   Run this locally against the production Neon URL, or use Neon's SQL editor. Vercel does not run migrations automatically — schema changes must be applied manually with `db:push` or Drizzle migrations.

4. Redeploy if needed after env vars are set

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push Drizzle schema to the database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run seed` | Seed the database with sample data |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |

## Project Structure

- `app/` — Next.js App Router pages, layouts, and server actions
- `app/api/` — REST API routes for issues
- `components/` — Reusable UI components
- `db/` — Drizzle schema and database client
- `lib/` — Auth, JWT, data access layer, utilities
- `middleware.ts` — JWT verification and route protection

## Authentication

Sessions are stored as HTTP-only `auth_token` cookies containing a signed JWT. Protected routes (`/dashboard`, `/issues/*`, `/api/*`) require a valid token. API clients can also send `Authorization: Bearer <token>`.

## License

This project is licensed under the MIT License.

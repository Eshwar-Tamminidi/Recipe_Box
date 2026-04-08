# RecipeBox Backend

This is the backend for the RecipeBox app. It uses Node.js, Express, and Prisma ORM with SQLite.

## Features
- REST API for recipes
- Prisma ORM for database
- SQLite for local development

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

## Endpoints
- `GET /recipes` — list, filter, search
- `POST /recipes` — add new
- `PUT /recipes/:id` — update
- `DELETE /recipes/:id` — delete
- `PATCH /recipes/:id/favorite` — toggle favorite

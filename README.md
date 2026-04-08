# Recipe_Box

RecipeBox Pro is a full-stack recipe management app with secure authentication and per-user data privacy.

## Features
- Signup and login with JWT-based authentication
- User-specific recipes and favorites
- Add, edit, delete, and browse recipes
- Search and filter recipes
- Pagination support across recipe lists
- Recipe photo upload with file type and size validation
- Light and dark theme toggle
- Responsive liquid-glass inspired UI

## Tech Stack
- Frontend: React + TypeScript
- Backend: Node.js + Express
- Database: Prisma ORM + SQLite

## Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. `npx prisma migrate dev`
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm start`

Frontend runs on `http://localhost:3000` and backend on `http://localhost:4000`.

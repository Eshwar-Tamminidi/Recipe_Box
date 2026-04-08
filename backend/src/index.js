import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'recipebox_dev_secret_change_me';
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.use(cors());
app.use(express.json());

function signAuthToken(user) {
  return jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

function sanitizeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token missing.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

async function ensureOwnedRecipe(recipeId, userId) {
  const recipe = await prisma.recipe.findFirst({ where: { id: recipeId, userId } });
  if (!recipe) {
    const error = new Error('Recipe not found.');
    error.code = 'P2025';
    throw error;
  }
  return recipe;
}

app.post('/auth/signup', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: 'name, email and password are required.' });
    return;
  }

  if (String(password).length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters.' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    res.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: String(name).trim(), email: normalizedEmail, password: passwordHash },
  });

  const token = signAuthToken(user);
  res.status(201).json({ token, user: sanitizeUser(user) });
}));

app.post('/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required.' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  const isPasswordValid = await bcrypt.compare(String(password), user.password);
  if (!isPasswordValid) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  const token = signAuthToken(user);
  res.json({ token, user: sanitizeUser(user) });
}));

app.get('/auth/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: Number(req.user.userId) } });
  if (!user) {
    res.status(401).json({ message: 'Account not found.' });
    return;
  }
  res.json({ user: sanitizeUser(user) });
}));

// Get all recipes, with optional filters and search
app.get('/recipes', requireAuth, asyncHandler(async (req, res) => {
  const { cuisine, search, favorite } = req.query;
  const where = { userId: Number(req.user.userId) };
  if (cuisine) where.cuisine = cuisine;
  if (favorite === 'true') where.isFavorite = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { ingredients: { contains: search, mode: 'insensitive' } },
    ];
  }
  const recipes = await prisma.recipe.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(recipes);
}));

// Add a new recipe
app.post('/recipes', requireAuth, asyncHandler(async (req, res) => {
  const { name, ingredients, steps, cookingTime, cuisine, isFavorite, photoUrl } = req.body;
  if (!name || !ingredients || !steps || !cookingTime) {
    res.status(400).json({ message: 'name, ingredients, steps and cookingTime are required.' });
    return;
  }
  const recipe = await prisma.recipe.create({
    data: {
      name,
      ingredients,
      steps,
      cookingTime: Number(cookingTime),
      cuisine,
      isFavorite: Boolean(isFavorite),
      photoUrl: photoUrl || null,
      userId: Number(req.user.userId),
    },
  });
  res.status(201).json(recipe);
}));

// Update a recipe
app.put('/recipes/:id', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  await ensureOwnedRecipe(Number(id), Number(req.user.userId));
  const { name, ingredients, steps, cookingTime, cuisine, isFavorite, photoUrl } = req.body;
  const recipe = await prisma.recipe.update({
    where: { id: Number(id) },
    data: {
      name,
      ingredients,
      steps,
      cookingTime: Number(cookingTime),
      cuisine,
      isFavorite: Boolean(isFavorite),
      photoUrl: photoUrl || null,
    },
  });
  res.json(recipe);
}));

// Delete a recipe
app.delete('/recipes/:id', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  await ensureOwnedRecipe(Number(id), Number(req.user.userId));
  await prisma.recipe.delete({ where: { id: Number(id) } });
  res.status(204).end();
}));

// Toggle favorite
app.patch('/recipes/:id/favorite', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  await ensureOwnedRecipe(Number(id), Number(req.user.userId));
  const recipe = await prisma.recipe.update({
    where: { id: Number(id) },
    data: { isFavorite: { set: req.body.isFavorite } },
  });
  res.json(recipe);
}));

app.use((error, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(error);
  const statusCode = error.code === 'P2025' ? 404 : 500;
  const message = statusCode === 404 ? 'Recipe not found.' : 'Unexpected server error.';
  res.status(statusCode).json({ message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

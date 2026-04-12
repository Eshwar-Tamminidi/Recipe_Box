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

function normalizeText(value) {
  return String(value || '').trim();
}

function buildMealDbIngredients(meal) {
  const list = [];
  for (let index = 1; index <= 20; index += 1) {
    const ingredient = normalizeText(meal[`strIngredient${index}`]);
    const measure = normalizeText(meal[`strMeasure${index}`]);
    if (!ingredient) continue;
    list.push(measure ? `${ingredient} - ${measure}` : ingredient);
  }
  return list.join(', ');
}

function estimateCookingTimeFromInstructions(instructions) {
  const text = normalizeText(instructions);
  const explicitMatch = text.match(/(\d{1,3})\s*(mins?|minutes?|hrs?|hours?)/i);
  if (explicitMatch) {
    const value = Number(explicitMatch[1]);
    const unit = explicitMatch[2].toLowerCase();
    return unit.startsWith('h') ? value * 60 : value;
  }

  // Fallback estimate based on instruction length.
  const steps = text.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
  const estimated = Math.max(20, steps * 7);
  return Math.min(120, estimated);
}

function normalizeSearchQuery(rawQuery) {
  let query = normalizeText(rawQuery)
    .toLowerCase()
    .replace(/[?.,!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  query = query
    .replace(/^(how to make|how to cook|how do i make|how can i make|recipe for|make|cook)\s+/i, '')
    .replace(/\s+(recipe|dish|food)$/i, '')
    .trim();

  return query;
}

function buildCandidateQueries(rawQuery) {
  const cleaned = normalizeSearchQuery(rawQuery);
  const stopWords = new Set(['how', 'to', 'make', 'cook', 'recipe', 'for', 'a', 'an', 'the', 'i', 'me']);
  const tokens = cleaned
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token && !stopWords.has(token));

  const candidates = new Set();
  if (cleaned) candidates.add(cleaned);
  if (tokens.length > 0) candidates.add(tokens.join(' '));
  if (tokens.length > 1) candidates.add(tokens.slice(-2).join(' '));
  if (tokens.length > 0) candidates.add(tokens[tokens.length - 1]);

  return {
    candidates: [...candidates].filter((value) => value.length > 1),
    tokens: tokens.length > 0 ? tokens : cleaned.split(' ').filter(Boolean),
  };
}

function scoreMealForQuery(meal, tokens, normalizedQuery) {
  const mealName = normalizeText(meal?.strMeal).toLowerCase();
  const area = normalizeText(meal?.strArea).toLowerCase();
  const category = normalizeText(meal?.strCategory).toLowerCase();
  const instructions = normalizeText(meal?.strInstructions).toLowerCase();
  const ingredients = buildMealDbIngredients(meal).toLowerCase();
  if (!mealName) return 0;

  let score = 0;
  if (normalizedQuery && mealName === normalizedQuery) score += 100;
  if (normalizedQuery && mealName.includes(normalizedQuery)) score += 50;
  for (const token of tokens) {
    if (mealName.includes(token)) score += 15;
    if (ingredients.includes(token)) score += 9;
    if (instructions.includes(token)) score += 4;
    if (area.includes(token) || category.includes(token)) score += 3;
  }
  return score;
}

function getRequiredTokens(tokens) {
  const generic = new Set([
    'rice',
    'curry',
    'chicken',
    'veg',
    'vegetable',
    'dish',
    'food',
    'recipe',
    'masala',
    'gravy',
    'fried',
    'roast',
    'soup',
    'noodles',
    'pasta',
  ]);
  return tokens.filter((token) => token.length >= 4 && !generic.has(token));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function lookupMealById(idMeal) {
  const payload = await fetchJson(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(idMeal)}`);
  return payload?.meals?.[0] || null;
}

async function findBestMeal(rawQuery) {
  const { candidates, tokens } = buildCandidateQueries(rawQuery);
  const normalizedQuery = normalizeSearchQuery(rawQuery);
  const requiredTokens = getRequiredTokens(tokens);
  const mealsById = new Map();

  // Primary strategy: try search API with cleaned candidate queries.
  for (const candidate of candidates.slice(0, 5)) {
    const payload = await fetchJson(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(candidate)}`);
    const meals = payload?.meals || [];
    for (const meal of meals) {
      mealsById.set(meal.idMeal, meal);
    }
    if (mealsById.size >= 5) break;
  }

  // Fallback strategy: try ingredient-based search and hydrate recipe details.
  if (mealsById.size === 0) {
    const ingredientTokens = tokens.filter((token) => token.length >= 3).slice(0, 3);
    for (const token of ingredientTokens) {
      const payload = await fetchJson(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(token)}`);
      const meals = payload?.meals || [];
      for (const mealSummary of meals.slice(0, 5)) {
        const detailedMeal = await lookupMealById(mealSummary.idMeal);
        if (detailedMeal) {
          mealsById.set(detailedMeal.idMeal, detailedMeal);
        }
      }
      if (mealsById.size >= 5) break;
    }
  }

  // Final fallback: search by first letter.
  if (mealsById.size === 0 && normalizedQuery) {
    const firstLetter = normalizedQuery[0];
    const payload = await fetchJson(`https://www.themealdb.com/api/json/v1/1/search.php?f=${encodeURIComponent(firstLetter)}`);
    const meals = payload?.meals || [];
    for (const meal of meals) {
      mealsById.set(meal.idMeal, meal);
    }
  }

  const allMeals = [...mealsById.values()];
  if (allMeals.length === 0) return null;

  const scoredMeals = allMeals
    .map((meal) => {
      const mealName = normalizeText(meal.strMeal).toLowerCase();
      const score = scoreMealForQuery(meal, tokens, normalizedQuery);
      const requiredInName = requiredTokens.every((token) => mealName.includes(token));
      const requiredInRecipe = requiredTokens.every((token) => {
        const haystack = `${mealName} ${buildMealDbIngredients(meal).toLowerCase()} ${normalizeText(meal.strInstructions).toLowerCase()}`;
        return haystack.includes(token);
      });
      return { meal, score, requiredInName, requiredInRecipe };
    })
    .filter((entry) => (requiredTokens.length > 0 ? entry.requiredInRecipe : true))
    .sort((a, b) => {
      // Prefer exact-ish dish names over broad ingredient matches.
      if (a.requiredInName !== b.requiredInName) return a.requiredInName ? -1 : 1;
      return b.score - a.score;
    });

  if (scoredMeals.length === 0) return null;
  return scoredMeals[0];
}

function pickFirstRecipeObject(jsonValue) {
  if (!jsonValue) return null;
  const list = Array.isArray(jsonValue) ? jsonValue : [jsonValue];

  const stack = [...list];
  while (stack.length > 0) {
    const node = stack.shift();
    if (!node || typeof node !== 'object') continue;

    const typeValue = node['@type'];
    const types = Array.isArray(typeValue) ? typeValue : [typeValue];
    if (types.some((value) => String(value || '').toLowerCase() === 'recipe')) {
      return node;
    }

    if (Array.isArray(node['@graph'])) {
      for (const graphItem of node['@graph']) stack.push(graphItem);
    }
  }
  return null;
}

function parseIsoDurationToMinutes(value) {
  const text = normalizeText(value);
  if (!text) return 0;
  const hourMatch = text.match(/(\d+)H/i);
  const minuteMatch = text.match(/(\d+)M/i);
  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
  return (hours * 60) + minutes;
}

function recipeInstructionsToText(recipeInstructions) {
  if (typeof recipeInstructions === 'string') return normalizeText(recipeInstructions);
  if (!Array.isArray(recipeInstructions)) return '';
  const lines = recipeInstructions
    .map((step) => {
      if (typeof step === 'string') return step;
      if (step && typeof step === 'object') return step.text || step.name || '';
      return '';
    })
    .map((line) => normalizeText(line))
    .filter(Boolean);
  return lines.join('\n');
}

function extractJsonLdRecipes(html) {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const recipes = [];
  for (const match of matches) {
    const raw = normalizeText(match[1]);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const recipe = pickFirstRecipeObject(parsed);
      if (recipe) recipes.push(recipe);
    } catch (error) {
      // Ignore malformed script blocks.
    }
  }
  return recipes;
}

function scoreWebRecipe(recipe, tokens, normalizedQuery) {
  const name = normalizeText(recipe?.name).toLowerCase();
  if (!name) return 0;
  let score = 0;
  if (normalizedQuery && name === normalizedQuery) score += 120;
  if (normalizedQuery && name.includes(normalizedQuery)) score += 70;
  for (const token of tokens) {
    if (name.includes(token)) score += 20;
  }
  return score;
}

function resolveSearchLink(rawHref) {
  const href = normalizeText(rawHref);
  if (!href) return null;
  try {
    const parsed = new URL(href, 'https://duckduckgo.com');
    const redirect = parsed.searchParams.get('uddg');
    const resolved = redirect ? decodeURIComponent(redirect) : parsed.toString();
    if (!resolved.startsWith('http')) return null;
    if (resolved.includes('duckduckgo.com')) return null;
    return resolved;
  } catch (error) {
    return null;
  }
}

async function searchRecipeUrlsOnWeb(query) {
  const response = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(`${query} recipe`)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 RecipeBoxBot/1.0',
    },
  });
  if (!response.ok) return [];
  const html = await response.text();

  const links = [];
  const resultAnchors = [...html.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"/gi)];
  for (const match of resultAnchors) {
    const url = resolveSearchLink(match[1]);
    if (url) links.push(url);
  }

  // Fallback selector in case class names change.
  if (links.length === 0) {
    const anyAnchors = [...html.matchAll(/<a[^>]*href="([^"]+)"/gi)];
    for (const match of anyAnchors) {
      const url = resolveSearchLink(match[1]);
      if (url) links.push(url);
    }
  }

  const blockedHosts = ['youtube.com', 'facebook.com', 'instagram.com', 'pinterest.com'];
  const uniqueUrls = [];
  const seen = new Set();
  for (const url of links) {
    if (seen.has(url)) continue;
    seen.add(url);
    const lowerUrl = url.toLowerCase();
    if (blockedHosts.some((host) => lowerUrl.includes(host))) continue;
    uniqueUrls.push(url);
    if (uniqueUrls.length >= 10) break;
  }
  return uniqueUrls;
}

async function fetchRecipeFromWeb(query) {
  const normalizedQuery = normalizeSearchQuery(query);
  const { tokens } = buildCandidateQueries(query);
  const requiredTokens = getRequiredTokens(tokens);
  const candidateLinks = await searchRecipeUrlsOnWeb(normalizedQuery || query);
  if (candidateLinks.length === 0) return null;

  const candidates = [];
  for (const url of candidateLinks.slice(0, 8)) {
    try {
      const recipeResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 RecipeBoxBot/1.0',
        },
      });
      if (!recipeResponse.ok) continue;
      const recipeHtml = await recipeResponse.text();
      const jsonLdRecipes = extractJsonLdRecipes(recipeHtml);
      for (const recipe of jsonLdRecipes) {
        const name = normalizeText(recipe.name);
        if (!name) continue;

        const ingredients = Array.isArray(recipe.recipeIngredient)
          ? recipe.recipeIngredient.map((item) => normalizeText(item)).filter(Boolean).join(', ')
          : '';
        const steps = recipeInstructionsToText(recipe.recipeInstructions);
        const totalTimeMinutes = parseIsoDurationToMinutes(recipe.totalTime || recipe.cookTime || recipe.prepTime);
        const imageValue = recipe.image;
        const photoUrl = Array.isArray(imageValue)
          ? normalizeText(typeof imageValue[0] === 'string' ? imageValue[0] : imageValue[0]?.url)
          : normalizeText(typeof imageValue === 'string' ? imageValue : imageValue?.url);

        const haystack = `${name.toLowerCase()} ${ingredients.toLowerCase()} ${steps.toLowerCase()}`;
        const requiredSatisfied = requiredTokens.every((token) => haystack.includes(token));
        if (requiredTokens.length > 0 && !requiredSatisfied) continue;
        if (!ingredients || ingredients.length < 10) continue;
        if (!steps || steps.length < 20) continue;

        let sourceName = 'Web';
        try {
          sourceName = new URL(url).hostname.replace('www.', '');
        } catch (error) {
          sourceName = 'Web';
        }

        candidates.push({
          name,
          cuisine: normalizeText(recipe.recipeCuisine) || 'Other',
          ingredients,
          steps,
          cookingTime: totalTimeMinutes > 0 ? totalTimeMinutes : estimateCookingTimeFromInstructions(steps),
          photoUrl: photoUrl || null,
          sourceUrl: normalizeText(recipe.mainEntityOfPage?.['@id'] || recipe.url || url) || url,
          sourceName,
          score: scoreWebRecipe(recipe, tokens, normalizedQuery),
        });
      }
    } catch (error) {
      // Continue to next candidate URL.
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

function getKnownRecipeFallback(query) {
  const normalized = normalizeSearchQuery(query);

  if (normalized.includes('paneer butter masala')) {
    return {
      name: 'Paneer Butter Masala',
      cuisine: 'Indian',
      ingredients:
        'Paneer - 250 g, Butter - 2 tbsp, Oil - 1 tbsp, Onion - 1 large, Tomato - 3 medium, Cashews - 12, Ginger Garlic Paste - 1 tsp, Kashmiri Chili Powder - 1 tsp, Coriander Powder - 1 tsp, Garam Masala - 1/2 tsp, Kasuri Methi - 1 tsp, Fresh Cream - 2 tbsp, Salt - to taste, Sugar - 1/2 tsp, Water - as needed',
      steps:
        '1. Saute onion, tomato, cashews and ginger-garlic paste in a little oil until soft.\n2. Cool and blend to a smooth puree.\n3. Heat butter and oil, add chili powder and coriander powder on low heat.\n4. Add puree, salt and sugar; cook 6 to 8 minutes until masala thickens.\n5. Add water for gravy consistency and simmer.\n6. Add paneer cubes, garam masala and kasuri methi; cook 2 to 3 minutes.\n7. Finish with fresh cream and serve hot with naan or jeera rice.',
      cookingTime: 35,
      photoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/0/0d/Paneer_Butter_Masala.jpg',
      sourceUrl: 'https://www.indianhealthyrecipes.com/paneer-butter-masala-restaurant-style/',
      sourceName: 'Curated fallback',
    };
  }

  if (normalized.includes('lemon rice')) {
    return {
      name: 'Lemon Rice',
      cuisine: 'Indian',
      ingredients:
        'Cooked Rice - 3 cups, Oil - 2 tbsp, Mustard Seeds - 1 tsp, Urad Dal - 1 tsp, Chana Dal - 1 tsp, Peanuts - 2 tbsp, Dry Red Chilies - 2, Green Chili - 1, Curry Leaves - 10, Turmeric - 1/2 tsp, Hing - a pinch, Lemon Juice - 2 tbsp, Salt - to taste, Coriander - optional',
      steps:
        '1. Cool cooked rice and keep grains separate.\n2. Heat oil, add mustard seeds; let them splutter.\n3. Add dals, peanuts and roast until golden.\n4. Add chilies, curry leaves, hing and turmeric; saute briefly.\n5. Add rice and salt; toss gently on low flame.\n6. Switch off heat and add lemon juice.\n7. Mix well, rest for 2 minutes and serve.',
      cookingTime: 20,
      photoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/3/3f/Lemon_rice.jpg',
      sourceUrl: 'https://www.vegrecipesofindia.com/lemon-rice/',
      sourceName: 'Curated fallback',
    };
  }

  return null;
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

app.get('/ai/recipe-search', requireAuth, asyncHandler(async (req, res) => {
  const query = normalizeText(req.query.query);
  if (!query) {
    res.status(400).json({ message: 'query is required.' });
    return;
  }

  const bestMeal = await findBestMeal(query);
  if (bestMeal) {
    const instructions = normalizeText(bestMeal.meal.strInstructions);
    const recipe = {
      name: normalizeText(bestMeal.meal.strMeal) || query,
      cuisine: normalizeText(bestMeal.meal.strArea) || 'Other',
      ingredients: buildMealDbIngredients(bestMeal.meal),
      steps: instructions,
      cookingTime: estimateCookingTimeFromInstructions(instructions),
      photoUrl: normalizeText(bestMeal.meal.strMealThumb) || null,
      sourceUrl: normalizeText(bestMeal.meal.strSource) || normalizeText(bestMeal.meal.strYoutube) || null,
      sourceName: 'TheMealDB',
    };
    res.json({ recipe });
    return;
  }

  const webRecipe = await fetchRecipeFromWeb(query);
  if (webRecipe) {
    res.json({
      recipe: {
        name: webRecipe.name,
        cuisine: webRecipe.cuisine,
        ingredients: webRecipe.ingredients,
        steps: webRecipe.steps,
        cookingTime: webRecipe.cookingTime,
        photoUrl: webRecipe.photoUrl,
        sourceUrl: webRecipe.sourceUrl,
        sourceName: webRecipe.sourceName,
      },
    });
    return;
  }

  const knownRecipe = getKnownRecipeFallback(query);
  if (knownRecipe) {
    res.json({ recipe: knownRecipe });
    return;
  }

  res.status(404).json({
    message: 'No close recipe found for your exact dish. Try a specific dish like "lemon rice south indian".',
  });
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

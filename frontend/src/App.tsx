import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';

import ConfirmDialog from './ConfirmDialog';
import Notification from './Notification';
import AuthCard from './components/AuthCard';
import RecipeCard from './components/RecipeCard';
import RecipeAssistant from './components/RecipeAssistant';
import RecipeFilters from './components/RecipeFilters';
import RecipeForm from './components/RecipeForm';
import RecipeHeader from './components/RecipeHeader';
import { AUTH_API_URL, RECIPES_API_URL } from './constants';
import useDebouncedValue from './hooks/useDebouncedValue';
import { AuthResponse, AuthUser, Recipe, RecipeFilter, RecipeFormData, ToastSeverity, ToastState } from './types';
import { AppThemeMode } from './theme';
import { getErrorMessage } from './utils/errors';
import { glassPanelSx } from './utils/glassPanel';

type ViewMode = 'home' | 'recipes' | 'favorites';

const PAGE_SIZE = 10;
const HOME_PAGE_SIZE = 2;
const AUTH_TOKEN_KEY = 'recipebox_auth_token';

function paginateRecipes(recipes: Recipe[], page: number): Recipe[] {
  const start = (page - 1) * PAGE_SIZE;
  return recipes.slice(start, start + PAGE_SIZE);
}

interface AppProps {
  themeMode: AppThemeMode;
  onToggleTheme: () => void;
}

export default function App({ themeMode, onToggleTheme }: AppProps) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authBusy, setAuthBusy] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filter, setFilter] = useState<RecipeFilter>({ cuisine: '', search: '', favorite: false });
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [showMobileRecipeForm, setShowMobileRecipeForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [homePage, setHomePage] = useState<number>(1);
  const [recipesPage, setRecipesPage] = useState<number>(1);
  const [favoritesPage, setFavoritesPage] = useState<number>(1);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [toast, setToast] = useState<ToastState>({ open: false, severity: 'success', message: '' });

  const debouncedSearch = useDebouncedValue<string>(filter.search, 320);

  const notify = useCallback((severity: ToastSeverity, message: string) => {
    setToast({ open: true, severity, message });
  }, []);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (!savedToken) {
      setAuthReady(true);
      return;
    }

    const restoreSession = async () => {
      try {
        const response = await axios.get<{ user: AuthUser }>(`${AUTH_API_URL}/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setAuthToken(savedToken);
        setCurrentUser(response.data.user);
      } catch (error) {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        setAuthReady(true);
      }
    };

    void restoreSession();
  }, []);

  const authHeaders = useMemo(
    () => (authToken ? { Authorization: `Bearer ${authToken}` } : undefined),
    [authToken]
  );

  const handleAuthSuccess = (payload: AuthResponse, message: string) => {
    setAuthToken(payload.token);
    setCurrentUser(payload.user);
    setAuthError('');
    window.localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
    notify('success', message);
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthBusy(true);
    setAuthError('');
    try {
      const response = await axios.post<AuthResponse>(`${AUTH_API_URL}/login`, { email, password });
      handleAuthSuccess(response.data, 'Signin successful.');
    } catch (error) {
      const message = getErrorMessage(error) || 'Invalid credentials.';
      setAuthError(message);
      notify('error', `Signin failed. ${message}`);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    setAuthBusy(true);
    setAuthError('');
    try {
      const response = await axios.post<AuthResponse>(`${AUTH_API_URL}/signup`, { name, email, password });
      handleAuthSuccess(response.data, 'Signup successful.');
    } catch (error) {
      const message = getErrorMessage(error) || 'Please check your signup details.';
      setAuthError(message);
      notify('error', `Signup failed. ${message}`);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setRecipes([]);
    setEditing(null);
    setShowMobileRecipeForm(false);
    setDeletingRecipe(null);
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const fetchRecipes = useCallback(async () => {
    if (!authHeaders) {
      setRecipes([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get<Recipe[]>(RECIPES_API_URL, { headers: authHeaders });
      setRecipes(response.data);
    } catch (error) {
      notify('error', `Unable to fetch recipes. ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, notify]);

  useEffect(() => {
    if (authReady && authHeaders) {
      void fetchRecipes();
    }
  }, [authReady, authHeaders, fetchRecipes]);

  const filteredHomeRecipes = useMemo<Recipe[]>(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    return recipes.filter((recipe) => {
      if (filter.cuisine && recipe.cuisine !== filter.cuisine) return false;
      if (filter.favorite && !recipe.isFavorite) return false;
      if (!normalizedSearch) return true;
      return (
        recipe.name.toLowerCase().includes(normalizedSearch) ||
        recipe.ingredients.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [recipes, filter.cuisine, filter.favorite, debouncedSearch]);
  const allRecipes = recipes;
  const favoriteRecipes = useMemo<Recipe[]>(() => recipes.filter((recipe) => recipe.isFavorite), [recipes]);
  const paginatedHomeRecipes = useMemo<Recipe[]>(
    () => filteredHomeRecipes.slice((homePage - 1) * HOME_PAGE_SIZE, homePage * HOME_PAGE_SIZE),
    [filteredHomeRecipes, homePage]
  );

  const paginatedRecipes = useMemo<Recipe[]>(
    () => paginateRecipes(allRecipes, recipesPage),
    [allRecipes, recipesPage]
  );
  const paginatedFavorites = useMemo<Recipe[]>(
    () => paginateRecipes(favoriteRecipes, favoritesPage),
    [favoriteRecipes, favoritesPage]
  );

  const recipesTotalPages = Math.max(1, Math.ceil(allRecipes.length / PAGE_SIZE));
  const favoritesTotalPages = Math.max(1, Math.ceil(favoriteRecipes.length / PAGE_SIZE));
  const homeTotalPages = Math.max(1, Math.ceil(filteredHomeRecipes.length / HOME_PAGE_SIZE));

  useEffect(() => {
    setHomePage(1);
  }, [filter.cuisine, filter.favorite, debouncedSearch]);

  useEffect(() => {
    if (homePage > homeTotalPages) setHomePage(homeTotalPages);
  }, [homePage, homeTotalPages]);

  useEffect(() => {
    if (recipesPage > recipesTotalPages) setRecipesPage(recipesTotalPages);
  }, [recipesPage, recipesTotalPages]);

  useEffect(() => {
    if (favoritesPage > favoritesTotalPages) setFavoritesPage(favoritesTotalPages);
  }, [favoritesPage, favoritesTotalPages]);

  const handleFilterChange = <K extends keyof RecipeFilter>(key: K, value: RecipeFilter[K]) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangeView = (view: ViewMode) => {
    setActiveView(view);
    setEditing(null);
    setShowMobileRecipeForm(false);
  };

  const handleEditRequest = (recipe: Recipe) => {
    setEditing(recipe);
    setShowMobileRecipeForm(true);
    setActiveView('home');
  };

  const handleAddRecipeRequest = () => {
    setEditing(null);
    setShowMobileRecipeForm(true);
    setActiveView('home');
  };

  const handleSave = async (data: RecipeFormData): Promise<boolean> => {
    if (!authHeaders) {
      notify('error', 'Please login to save recipes.');
      return false;
    }
    if (!data.cookingTime || data.cookingTime < 1) {
      notify('warning', 'Cooking time must be at least 1 minute.');
      return false;
    }

    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${RECIPES_API_URL}/${editing.id}`, data, { headers: authHeaders });
        notify('success', 'Recipe updated successfully.');
        setEditing(null);
      } else {
        await axios.post(RECIPES_API_URL, data, { headers: authHeaders });
        notify('success', 'Recipe added successfully.');
        setShowMobileRecipeForm(false);
      }
      await fetchRecipes();
      return true;
    } catch (error) {
      notify('error', `Could not save recipe. ${getErrorMessage(error)}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRecipe) return;
    if (!authHeaders) {
      notify('error', 'Please login to manage recipes.');
      return;
    }

    setSaving(true);
    try {
      await axios.delete(`${RECIPES_API_URL}/${deletingRecipe.id}`, { headers: authHeaders });
      notify('success', 'Recipe deleted.');
      if (editing?.id === deletingRecipe.id) {
        setEditing(null);
      }
      setDeletingRecipe(null);
      await fetchRecipes();
    } catch (error) {
      notify('error', `Delete failed. ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async (recipe: Recipe): Promise<void> => {
    if (!authHeaders) {
      notify('error', 'Please login to manage recipes.');
      return;
    }
    setSaving(true);
    try {
      await axios.patch(
        `${RECIPES_API_URL}/${recipe.id}/favorite`,
        { isFavorite: !recipe.isFavorite },
        { headers: authHeaders }
      );
      notify('success', recipe.isFavorite ? 'Removed from favorites.' : 'Added to favorites.');
      await fetchRecipes();
    } catch (error) {
      notify('error', `Could not update favorite status. ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFromAssistant = async (data: RecipeFormData): Promise<void> => {
    if (!authHeaders) {
      notify('error', 'Please login to add recipes.');
      return;
    }

    setSaving(true);
    try {
      await axios.post(RECIPES_API_URL, data, { headers: authHeaders });
      notify('success', `${data.name} added to recipes.`);
      await fetchRecipes();
    } catch (error) {
      notify('error', `Could not add recipe from assistant. ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 1.5, md: 2.5 },
        background:
          themeMode === 'dark'
            ? 'radial-gradient(circle at 16% 18%, rgba(77, 171, 247, 0.28) 0%, rgba(77, 171, 247, 0) 32%), radial-gradient(circle at 86% 8%, rgba(118, 232, 208, 0.24) 0%, rgba(118, 232, 208, 0) 30%), linear-gradient(120deg, #071321 0%, #0e2640 45%, #081a2d 100%)'
            : 'radial-gradient(circle at 14% 15%, rgba(106, 189, 248, 0.32) 0%, rgba(106, 189, 248, 0) 32%), radial-gradient(circle at 82% 10%, rgba(118, 232, 208, 0.25) 0%, rgba(118, 232, 208, 0) 30%), linear-gradient(120deg, #f4fbff 0%, #e9f4fb 45%, #e4f1fa 100%)',
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          px: { xs: 1, sm: 2, md: 3, lg: 4 },
        }}
      >
        {!authReady ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '78vh' }}>
            <CircularProgress />
          </Stack>
        ) : !currentUser || !authToken ? (
          <AuthCard
            busy={authBusy}
            error={authError}
            onLogin={handleLogin}
            onSignup={handleSignup}
          />
        ) : (
          <>
        <RecipeHeader
          activeView={activeView}
          onChangeView={handleChangeView}
          themeMode={themeMode}
          onToggleTheme={onToggleTheme}
          userName={currentUser.name}
          onLogout={handleLogout}
          onAddRecipe={handleAddRecipeRequest}
        />
        {activeView === 'home' ? (
          <>
            <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
              <Grid
                item
                xs={12}
                lg={5}
                sx={{
                  display: { xs: editing || showMobileRecipeForm ? 'block' : 'none', lg: 'block' },
                  order: { xs: editing || showMobileRecipeForm ? 1 : 2, lg: 1 },
                }}
              >
                <RecipeForm
                  onSave={handleSave}
                  editing={editing}
                  onCancel={() => {
                    setEditing(null);
                    setShowMobileRecipeForm(false);
                  }}
                  busy={saving}
                />
              </Grid>

              <Grid item xs={12} lg={7} sx={{ order: { xs: editing || showMobileRecipeForm ? 2 : 1, lg: 2 } }}>
                <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: 4, ...glassPanelSx() }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <FilterAltRoundedIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      Browse Recipes
                    </Typography>
                  </Stack>

                  <RecipeFilters filter={filter} onChange={handleFilterChange} />

                  <Divider sx={{ mb: 2 }} />

                  {loading ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                      <CircularProgress />
                    </Stack>
                  ) : filteredHomeRecipes.length === 0 ? (
                    <Alert severity="info">No recipes match your filters yet.</Alert>
                  ) : (
                    <>
                      <Stack spacing={1.8}>
                        {paginatedHomeRecipes.map((recipe) => (
                          <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onEdit={handleEditRequest}
                            onDelete={setDeletingRecipe}
                            onToggleFavorite={handleToggleFavorite}
                            busy={saving}
                            onView={setViewingRecipe}
                          />
                        ))}
                      </Stack>
                      <Stack alignItems="center" sx={{ mt: 2.5 }}>
                        <Pagination
                          color="primary"
                          shape="rounded"
                          page={homePage}
                          count={homeTotalPages}
                          onChange={(_, page) => setHomePage(page)}
                        />
                      </Stack>
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        ) : (
          <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: 4, ...glassPanelSx() }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              {activeView === 'recipes' ? <RestaurantMenuRoundedIcon color="primary" /> : <FavoriteRoundedIcon color="error" />}
              <Typography variant="h6" fontWeight={700}>
                {activeView === 'recipes' ? 'All Recipes' : 'Favorite Recipes'}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                <CircularProgress />
              </Stack>
            ) : (activeView === 'recipes' ? allRecipes.length : favoriteRecipes.length) === 0 ? (
              <Alert severity="info">
                {activeView === 'recipes' ? 'No recipes available yet.' : 'No favorite recipes yet.'}
              </Alert>
            ) : (
              <>
                <Grid container spacing={{ xs: 1.5, md: 1.8 }}>
                  {(activeView === 'recipes' ? paginatedRecipes : paginatedFavorites).map((recipe) => (
                    <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                      <RecipeCard
                        recipe={recipe}
                        onEdit={handleEditRequest}
                        onDelete={setDeletingRecipe}
                        onToggleFavorite={handleToggleFavorite}
                        busy={saving}
                        layout="top"
                        onView={setViewingRecipe}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Stack alignItems="center" sx={{ mt: 2.5 }}>
                  <Pagination
                    color="primary"
                    shape="rounded"
                    page={activeView === 'recipes' ? recipesPage : favoritesPage}
                    count={activeView === 'recipes' ? recipesTotalPages : favoritesTotalPages}
                    onChange={(_, page) => {
                      if (activeView === 'recipes') setRecipesPage(page);
                      else setFavoritesPage(page);
                    }}
                  />
                </Stack>
              </>
            )}
          </Paper>
        )}
          </>
        )}
      </Container>

      <ConfirmDialog
        open={Boolean(deletingRecipe)}
        title="Delete Recipe"
        content={`Delete ${deletingRecipe?.name || 'this recipe'}? This action cannot be undone.`}
        onClose={() => setDeletingRecipe(null)}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <Dialog
        open={Boolean(viewingRecipe)}
        onClose={() => setViewingRecipe(null)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            overflow: 'hidden',
          },
        }}
      >
        <DialogContent
          dividers
          sx={{
            p: 0,
            backgroundColor: 'background.paper',
            maxHeight: '72vh',
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              backgroundColor: 'background.paper',
              borderBottom: (theme) =>
                theme.palette.mode === 'dark'
                  ? '1px solid rgba(166, 210, 245, 0.24)'
                  : '1px solid rgba(40, 111, 163, 0.18)',
            }}
          >
            {viewingRecipe?.photoUrl ? (
              <Box
                component="img"
                src={viewingRecipe.photoUrl}
                alt={`${viewingRecipe.name} recipe`}
                sx={{
                  width: '100%',
                  height: { xs: 220, sm: 280 },
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={0.8}
                sx={{
                  width: '100%',
                  height: { xs: 220, sm: 280 },
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(145deg, rgba(11, 30, 48, 0.75), rgba(9, 23, 37, 0.62))'
                      : 'linear-gradient(145deg, rgba(244, 251, 255, 0.95), rgba(225, 240, 250, 0.88))',
                }}
              >
                <LocalDiningRoundedIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Recipe Image
                </Typography>
              </Stack>
            )}
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.2 }}>
              {viewingRecipe?.name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Cuisine:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1.5 }}>
                {viewingRecipe?.cuisine}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Cooking Time:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {viewingRecipe?.cookingTime} min
              </Typography>
            </Stack>

            <Typography
              variant="body1"
              color="text.primary"
              sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1.2 }}
            >
              <ListAltRoundedIcon fontSize="small" sx={{ mt: '3px', color: '#8dc9f2' }} />
              <span>
                <strong>Ingredients:</strong> {viewingRecipe?.ingredients}
              </span>
            </Typography>

            <Typography
              variant="body1"
              color="text.primary"
              sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}
            >
              <MenuBookRoundedIcon fontSize="small" sx={{ mt: '3px', color: '#8dc9f2' }} />
              <span>
                <strong>Steps:</strong> {viewingRecipe?.steps}
              </span>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingRecipe(null)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        severity={toast.severity}
        message={toast.message}
      />

      {currentUser && authToken ? (
        <RecipeAssistant authHeaders={authHeaders} onAddRecipe={handleAddFromAssistant} />
      ) : null}
    </Box>
  );
}

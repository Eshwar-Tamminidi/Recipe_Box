import { FormEvent, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import { AI_API_URL } from '../constants';
import { RecipeFormData } from '../types';
import { glassPanelSx } from '../utils/glassPanel';

interface AssistantRecipe {
  name: string;
  cuisine: string;
  ingredients: string;
  steps: string;
  cookingTime: number;
  photoUrl: string | null;
  sourceUrl: string | null;
  sourceName: string;
}

interface RecipeAssistantProps {
  authHeaders?: { Authorization: string };
  onAddRecipe: (recipe: RecipeFormData) => Promise<void>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recipe?: AssistantRecipe;
  error?: boolean;
}

const panelEnter = keyframes`
  from {
    opacity: 0;
    transform: translate3d(18px, 24px, 0) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
`;

const messageEnter = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 12px, 0) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
`;

const recipeReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
    clip-path: inset(0 0 18% 0 round 12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    clip-path: inset(0 0 0 0 round 12px);
  }
`;

const botFloat = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
`;

const fabGlow = keyframes`
  0%, 100% {
    box-shadow: 0 12px 26px rgba(23, 105, 170, 0.28);
  }
  50% {
    box-shadow: 0 16px 34px rgba(14, 164, 126, 0.36);
  }
`;

const typingPulse = keyframes`
  0%, 80%, 100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
`;

const noMotionSx = {
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    transition: 'none',
    transform: 'none',
  },
};

export default function RecipeAssistant({ authHeaders, onAddRecipe }: RecipeAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi! Ask any recipe name like "paneer butter masala" and I will fetch ingredients, time, steps, and image for you.',
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend || !authHeaders) return;

    const query = input.trim();
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.get<{ recipe: AssistantRecipe }>(`${AI_API_URL}/recipe-search`, {
        params: { query },
        headers: authHeaders,
      });

      const recipe = response.data.recipe;
      const assistantMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: `Found recipe for ${recipe.name}. You can add it directly to your recipes.`,
        recipe,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Could not fetch a recipe now. Try another recipe name.'
        : 'Could not fetch a recipe now. Try another recipe name.';
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          text: message,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = async (messageId: string, recipe: AssistantRecipe) => {
    setAddingId(messageId);
    try {
      await onAddRecipe({
        name: recipe.name,
        cuisine: recipe.cuisine || 'Other',
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        cookingTime: recipe.cookingTime || 30,
        photoUrl: recipe.photoUrl,
        isFavorite: false,
      });
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? { ...message, text: `${message.text} Added to your recipes.` }
            : message
        )
      );
    } finally {
      setAddingId(null);
    }
  };

  return (
    <>
      {open ? (
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            right: { xs: 12, sm: 20 },
            bottom: { xs: 12, sm: 20 },
            width: { xs: 'calc(100vw - 24px)', sm: 390 },
            height: { xs: '72vh', sm: 560 },
            zIndex: 1300,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transformOrigin: 'bottom right',
            animation: `${panelEnter} 280ms cubic-bezier(0.2, 0.85, 0.25, 1) both`,
            ...glassPanelSx(),
            ...noMotionSx,
          }}
        >
          <Box
            sx={{
              p: 1.4,
              borderBottom: (theme) =>
                theme.palette.mode === 'dark'
                  ? '1px solid rgba(166, 210, 245, 0.25)'
                  : '1px solid rgba(40, 111, 163, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: 'primary.main',
                  animation: `${botFloat} 2.8s ease-in-out infinite`,
                  ...noMotionSx,
                }}
              >
                <SmartToyRoundedIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle1" fontWeight={700}>
                Recipe AI
              </Typography>
            </Stack>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
            <Stack spacing={1.2}>
              {messages.map((message, index) => (
                <Box
                  key={message.id}
                  sx={{
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '92%',
                    animation: `${messageEnter} 240ms ease-out both`,
                    animationDelay: `${Math.min(index * 35, 180)}ms`,
                    ...noMotionSx,
                  }}
                >
                  <Stack direction="row" spacing={0.8} alignItems="flex-start">
                    {message.role === 'assistant' ? (
                      <SmartToyRoundedIcon color={message.error ? 'error' : 'primary'} fontSize="small" />
                    ) : (
                      <PersonRoundedIcon color="action" fontSize="small" />
                    )}
                    <Paper
                      elevation={0}
                      sx={{
                        px: 1.2,
                        py: 1,
                        borderRadius: 2,
                        transition: 'transform 180ms ease, box-shadow 180ms ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow:
                            message.role === 'user'
                              ? '0 10px 22px rgba(23, 105, 170, 0.22)'
                              : undefined,
                        },
                        ...noMotionSx,
                        ...(message.role === 'user'
                          ? {
                              backgroundColor: 'primary.main',
                              color: 'primary.contrastText',
                            }
                          : glassPanelSx()),
                      }}
                    >
                      <Typography variant="body2">{message.text}</Typography>
                    </Paper>
                  </Stack>

                  {message.recipe ? (
                    <Paper
                      elevation={0}
                      sx={{
                        mt: 0.8,
                        p: 1.2,
                        borderRadius: 2,
                        overflow: 'hidden',
                        animation: `${recipeReveal} 320ms cubic-bezier(0.2, 0.85, 0.25, 1) 90ms both`,
                        transition: 'transform 180ms ease, box-shadow 180ms ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                        ...glassPanelSx(),
                        ...noMotionSx,
                      }}
                    >
                      {message.recipe.photoUrl ? (
                        <Box
                          component="img"
                          src={message.recipe.photoUrl}
                          alt={message.recipe.name}
                          sx={{
                            width: '100%',
                            height: 140,
                            objectFit: 'cover',
                            borderRadius: 1.5,
                            mb: 1,
                            transition: 'transform 420ms ease, filter 420ms ease',
                            '&:hover': {
                              transform: 'scale(1.035)',
                              filter: 'saturate(1.08)',
                            },
                            ...noMotionSx,
                          }}
                        />
                      ) : null}
                      <Typography variant="subtitle2" fontWeight={700}>
                        {message.recipe.name}
                      </Typography>
                      <Stack direction="row" spacing={1.1} sx={{ mb: 0.6, flexWrap: 'wrap' }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}
                        >
                          <RestaurantMenuRoundedIcon fontSize="inherit" />
                          {message.recipe.cuisine}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}
                        >
                          <AccessTimeRoundedIcon fontSize="inherit" />
                          {message.recipe.cookingTime} min
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ mb: 0.6 }}>
                        <strong>
                          <ListAltRoundedIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          Ingredients:
                        </strong>{' '}
                        {message.recipe.ingredients}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>
                          <MenuBookRoundedIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          Steps:
                        </strong>{' '}
                        {message.recipe.steps}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddCircleRoundedIcon />}
                          onClick={() => void handleAddRecipe(message.id, message.recipe!)}
                          disabled={addingId === message.id}
                          sx={{
                            transition: 'transform 160ms ease, box-shadow 160ms ease',
                            '&:hover': { transform: 'translateY(-1px)' },
                            '&:active': { transform: 'translateY(0) scale(0.98)' },
                            ...noMotionSx,
                          }}
                        >
                          {addingId === message.id ? 'Adding...' : 'Add To Recipes'}
                        </Button>
                        {message.recipe.sourceUrl ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<LinkRoundedIcon />}
                            component="a"
                            href={message.recipe.sourceUrl}
                            target="_blank"
                          rel="noreferrer"
                          sx={{
                            transition: 'transform 160ms ease',
                            '&:hover': { transform: 'translateY(-1px)' },
                            '&:active': { transform: 'translateY(0) scale(0.98)' },
                            ...noMotionSx,
                          }}
                        >
                            Source
                          </Button>
                        ) : null}
                      </Stack>
                    </Paper>
                  ) : null}
                </Box>
              ))}
              {loading ? (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ pl: 0.5, animation: `${messageEnter} 200ms ease-out both`, ...noMotionSx }}
                >
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Fetching recipe details
                  </Typography>
                  <Stack direction="row" spacing={0.25} aria-hidden="true">
                    {[0, 1, 2].map((dot) => (
                      <Box
                        key={dot}
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          bgcolor: 'text.secondary',
                          animation: `${typingPulse} 900ms ease-in-out infinite`,
                          animationDelay: `${dot * 120}ms`,
                          ...noMotionSx,
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              ) : null}
            </Stack>
          </Box>

          <Box component="form" onSubmit={handleSend} sx={{ p: 1.2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                placeholder="Ask recipe name..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <IconButton
                type="submit"
                color="primary"
                disabled={!canSend}
                sx={{
                  transition: 'transform 150ms ease, background-color 150ms ease',
                  '&:hover': { transform: 'translateX(2px)' },
                  '&:active': { transform: 'translateX(2px) scale(0.94)' },
                  ...noMotionSx,
                }}
              >
                <SendRoundedIcon />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      ) : null}

      <Fab
        color="primary"
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          position: 'fixed',
          right: { xs: 14, sm: 22 },
          bottom: { xs: 14, sm: 22 },
          zIndex: 1299,
          animation: `${fabGlow} 3s ease-in-out infinite`,
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          '&:hover': {
            transform: 'translateY(-3px) scale(1.04)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.96)',
          },
          ...noMotionSx,
        }}
      >
        <SmartToyRoundedIcon />
      </Fab>
    </>
  );
}

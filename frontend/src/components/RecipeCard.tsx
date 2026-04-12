import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import { Recipe } from '../types';
import { glassPanelSx } from '../utils/glassPanel';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => Promise<void>;
  busy: boolean;
  layout?: 'side' | 'top';
  onView?: (recipe: Recipe) => void;
}

export default function RecipeCard({
  recipe,
  onEdit,
  onDelete,
  onToggleFavorite,
  busy,
  layout = 'side',
  onView,
}: RecipeCardProps) {
  const isTopLayout = layout === 'top';
  const maxLength = isTopLayout ? 130 : 170;
  const truncateText = (value: string, length: number) =>
    value.length > length ? `${value.slice(0, length).trimEnd()}...` : value;
  const ingredientsPreview = truncateText(recipe.ingredients, maxLength);
  const stepsPreview = truncateText(recipe.steps, maxLength);

  return (
    <Card
      sx={{
        borderRadius: 3,
        ...glassPanelSx(),
        borderColor: recipe.isFavorite ? 'rgba(255, 107, 122, 0.6)' : 'rgba(166, 210, 245, 0.24)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          flexDirection: isTopLayout ? 'column' : 'row',
          alignItems: 'stretch',
          gap: 1.5,
          flex: 1,
        }}
      >
        <Box
          sx={{
            width: isTopLayout ? '100%' : { xs: 96, sm: 132, md: 150 },
            minWidth: isTopLayout ? '100%' : { xs: 96, sm: 132, md: 150 },
            height: isTopLayout ? { xs: 170, sm: 200 } : 'auto',
            minHeight: isTopLayout ? { xs: 170, sm: 200 } : { xs: 96, sm: 132, md: 150 },
            borderRadius: 2,
            overflow: 'hidden',
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(166, 210, 245, 0.24)'
                : '1px solid rgba(40, 111, 163, 0.2)',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(140deg, rgba(11, 30, 48, 0.65), rgba(9, 23, 37, 0.54))'
                : 'linear-gradient(140deg, rgba(244, 251, 255, 0.9), rgba(225, 240, 250, 0.82))',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            order: isTopLayout ? 0 : 1,
            '&:hover .view-overlay': {
              opacity: onView ? 1 : 0,
            },
          }}
        >
          {recipe.photoUrl ? (
            <Box
              component="img"
              src={recipe.photoUrl}
              alt={`${recipe.name} recipe`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                minHeight: isTopLayout ? { xs: 170, sm: 200 } : { xs: 96, sm: 132, md: 150 },
              }}
            />
          ) : (
            <Stack alignItems="center" justifyContent="center" spacing={0.5} sx={{ p: 1 }}>
              <LocalDiningRoundedIcon color="primary" />
              <Typography variant="caption" color="text.secondary" align="center">
                Recipe Photo
              </Typography>
            </Stack>
          )}
          {onView ? (
            <Box
              className="view-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(180deg, rgba(4, 20, 35, 0.24), rgba(4, 20, 35, 0.72))',
                opacity: 0,
                transition: 'opacity 180ms ease',
              }}
            >
              <Button variant="contained" size="small" onClick={() => onView(recipe)}>
                View Recipe
              </Button>
            </Box>
          ) : null}
        </Box>

        <CardContent sx={{ p: 0, flex: 1, '&:last-child': { pb: 0 }, order: isTopLayout ? 1 : 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
            <Typography variant="h6" fontWeight={700}>
              {recipe.name}
            </Typography>
            {recipe.isFavorite && <Chip label="Favorite" color="error" size="small" />}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
            <Chip icon={<RestaurantMenuRoundedIcon />} label={recipe.cuisine} size="small" />
            <Chip icon={<AccessTimeRoundedIcon />} label={`${recipe.cookingTime} min`} size="small" />
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.8, display: 'flex', gap: 0.7, alignItems: 'flex-start' }}>
            <ListAltRoundedIcon fontSize="small" sx={{ mt: '2px', color: '#8dc9f2' }} />
            <span>
              <strong>Ingredients:</strong> {ingredientsPreview}
            </span>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', gap: 0.7, alignItems: 'flex-start' }}>
            <MenuBookRoundedIcon fontSize="small" sx={{ mt: '2px', color: '#8dc9f2' }} />
            <span>
              <strong>Steps:</strong> {stepsPreview}
            </span>
          </Typography>
        </CardContent>
      </Box>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <IconButton
          onClick={() => void onToggleFavorite(recipe)}
          color={recipe.isFavorite ? 'error' : 'default'}
          disabled={busy}
          aria-label="toggle favorite"
        >
          <FavoriteRoundedIcon />
        </IconButton>
        <Button startIcon={<EditRoundedIcon />} onClick={() => onEdit(recipe)} disabled={busy}>
          Edit
        </Button>
        {onView ? (
          <Button startIcon={<OpenInFullRoundedIcon />} onClick={() => onView(recipe)} disabled={busy}>
            View More
          </Button>
        ) : null}
        <IconButton onClick={() => onDelete(recipe)} color="error" disabled={busy} aria-label="delete recipe">
          <DeleteOutlineRoundedIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

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
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import { Recipe } from '../types';
import { glassPanelSx } from '../utils/glassPanel';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => Promise<void>;
  busy: boolean;
}

export default function RecipeCard({ recipe, onEdit, onDelete, onToggleFavorite, busy }: RecipeCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        ...glassPanelSx(),
        borderColor: recipe.isFavorite ? 'rgba(255, 107, 122, 0.6)' : 'rgba(166, 210, 245, 0.24)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5, p: 1.5 }}>
        <CardContent sx={{ p: 0, flex: 1, '&:last-child': { pb: 0 } }}>
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
              <strong>Ingredients:</strong> {recipe.ingredients}
            </span>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', gap: 0.7, alignItems: 'flex-start' }}>
            <MenuBookRoundedIcon fontSize="small" sx={{ mt: '2px', color: '#8dc9f2' }} />
            <span>
              <strong>Steps:</strong> {recipe.steps}
            </span>
          </Typography>
        </CardContent>

        <Box
          sx={{
            width: { xs: 96, sm: 132, md: 150 },
            minWidth: { xs: 96, sm: 132, md: 150 },
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
          }}
        >
          {recipe.photoUrl ? (
            <Box
              component="img"
              src={recipe.photoUrl}
              alt={`${recipe.name} recipe`}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: { xs: 96, sm: 132, md: 150 } }}
            />
          ) : (
            <Stack alignItems="center" justifyContent="center" spacing={0.5} sx={{ p: 1 }}>
              <LocalDiningRoundedIcon color="primary" />
              <Typography variant="caption" color="text.secondary" align="center">
                Recipe Photo
              </Typography>
            </Stack>
          )}
        </Box>
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
        <IconButton onClick={() => onDelete(recipe)} color="error" disabled={busy} aria-label="delete recipe">
          <DeleteOutlineRoundedIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

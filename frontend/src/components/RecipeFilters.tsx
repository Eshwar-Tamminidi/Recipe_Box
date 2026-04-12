import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { CUISINES } from '../constants';
import { RecipeFilter } from '../types';

interface RecipeFiltersProps {
  filter: RecipeFilter;
  onChange: <K extends keyof RecipeFilter>(key: K, value: RecipeFilter[K]) => void;
}

export default function RecipeFilters({ filter, onChange }: RecipeFiltersProps) {
  return (
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Cuisine</InputLabel>
          <Select value={filter.cuisine} label="Cuisine" onChange={(event) => onChange('cuisine', event.target.value)}>
            <MenuItem value="">
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8 }}>
                <RestaurantMenuRoundedIcon fontSize="small" />
                <span>All</span>
              </Box>
            </MenuItem>
            {CUISINES.map((cuisine) => (
              <MenuItem key={cuisine} value={cuisine}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8 }}>
                  <RestaurantMenuRoundedIcon fontSize="small" />
                  <span>{cuisine}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={5}>
        <TextField
          fullWidth
          label="Search"
          value={filter.search}
          onChange={(event) => onChange('search', event.target.value)}
          placeholder="By name or ingredient"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <FormControlLabel
          control={<Checkbox checked={filter.favorite} onChange={(event) => onChange('favorite', event.target.checked)} color="error" />}
          label={
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
              <FavoriteRoundedIcon fontSize="small" color="error" />
              <Typography variant="body2">Favorites</Typography>
            </Box>
          }
        />
      </Grid>
    </Grid>
  );
}

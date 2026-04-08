import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import { CUISINES, DEFAULT_CUISINE } from '../constants';
import { Recipe, RecipeFormData } from '../types';
import { glassPanelSx } from '../utils/glassPanel';

interface RecipeFormState {
  name: string;
  ingredients: string;
  steps: string;
  photoUrl: string;
  cookingTime: string;
  cuisine: string;
  isFavorite: boolean;
}

interface RecipeFormProps {
  onSave: (data: RecipeFormData) => Promise<boolean>;
  editing: Recipe | null;
  onCancel: () => void;
  busy: boolean;
}

const MAX_IMAGE_SIZE_MB = 3;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function emptyForm(): RecipeFormState {
  return {
    name: '',
    ingredients: '',
    steps: '',
    photoUrl: '',
    cookingTime: '',
    cuisine: DEFAULT_CUISINE,
    isFavorite: false,
  };
}

export default function RecipeForm({ onSave, editing, onCancel, busy }: RecipeFormProps) {
  const [form, setForm] = useState<RecipeFormState>(emptyForm());
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    if (editing) {
      setForm({
        ...editing,
        photoUrl: editing.photoUrl ?? '',
        cookingTime: String(editing.cookingTime),
      });
      return;
    }
    setForm(emptyForm());
  }, [editing]);

  const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCuisineChange = (event: SelectChangeEvent<string>) => {
    setForm((prev) => ({ ...prev, cuisine: event.target.value }));
  };

  const handleFavoriteChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, isFavorite: event.target.checked }));
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Please upload JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError(`Image size must be below ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    const fileDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not read image file.'));
      reader.readAsDataURL(file);
    }).catch(() => '');

    if (!fileDataUrl) {
      setUploadError('Could not process image. Please try another file.');
      return;
    }

    setUploadError('');
    setForm((prev) => ({ ...prev, photoUrl: fileDataUrl }));
    event.target.value = '';
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photoUrl: '' }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const didSave = await onSave({
      ...form,
      photoUrl: form.photoUrl || null,
      cookingTime: Number(form.cookingTime),
    });

    if (didSave && !editing) {
      setForm(emptyForm());
      setUploadError('');
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, ...glassPanelSx() }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <AutoAwesomeRoundedIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>
          {editing ? 'Update Recipe' : 'Create Recipe'}
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Recipe Name"
              name="name"
              value={form.name}
              onChange={handleTextChange}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalDiningRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Cuisine</InputLabel>
              <Select name="cuisine" value={form.cuisine} label="Cuisine" onChange={handleCuisineChange}>
                {CUISINES.map((cuisine) => (
                  <MenuItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Cooking Time (minutes)"
              name="cookingTime"
              value={form.cookingTime}
              onChange={handleTextChange}
              type="number"
              inputProps={{ min: 1 }}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Checkbox name="isFavorite" checked={form.isFavorite} onChange={handleFavoriteChange} color="error" />}
              label="Pin as Favorite"
              sx={{ mt: 0.5 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Button component="label" startIcon={<PhotoCameraRoundedIcon />} variant="outlined" disabled={busy}>
                Upload Photo
                <input hidden accept=".jpg,.jpeg,.png,.webp" type="file" onChange={handlePhotoUpload} />
              </Button>
              {form.photoUrl && (
                <Button color="error" variant="text" onClick={handleRemovePhoto} disabled={busy}>
                  Remove Photo
                </Button>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Accepted: JPG, PNG, WEBP (max {MAX_IMAGE_SIZE_MB}MB)
            </Typography>
          </Grid>

          {uploadError && (
            <Grid item xs={12}>
              <Alert severity="warning">{uploadError}</Alert>
            </Grid>
          )}

          {form.photoUrl && (
            <Grid item xs={12}>
              <Box
                component="img"
                src={form.photoUrl}
                alt="Recipe preview"
                sx={{
                  width: '100%',
                  maxHeight: 230,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid rgba(166, 210, 245, 0.35)',
                }}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              label="Ingredients"
              name="ingredients"
              value={form.ingredients}
              onChange={handleTextChange}
              fullWidth
              required
              multiline
              minRows={2}
              placeholder="Example: 2 tomatoes, olive oil, basil"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Steps"
              name="steps"
              value={form.steps}
              onChange={handleTextChange}
              fullWidth
              required
              multiline
              minRows={3}
              placeholder="Describe the method in clear steps"
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained" disabled={busy}>
                {editing ? 'Save Changes' : 'Add Recipe'}
              </Button>
              {editing && (
                <Button variant="outlined" onClick={onCancel} disabled={busy}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

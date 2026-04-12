import { Box, Paper, Stack, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import { AppThemeMode } from '../theme';
import { glassPanelSx } from '../utils/glassPanel';

type ViewMode = 'home' | 'recipes' | 'favorites';

interface RecipeHeaderProps {
  activeView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  themeMode: AppThemeMode;
  onToggleTheme: () => void;
  userName: string;
  onLogout: () => void;
}

export default function RecipeHeader({
  activeView,
  onChangeView,
  themeMode,
  onToggleTheme,
  userName,
  onLogout,
}: RecipeHeaderProps) {
  const initial = userName?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2 },
        mb: 2,
        borderRadius: 4,
        position: 'sticky',
        top: { xs: 8, md: 12 },
        zIndex: 1200,
        ...glassPanelSx(),
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, rgba(123, 209, 255, 0.35), rgba(118, 232, 208, 0.2))',
                border: '1px solid rgba(166, 210, 245, 0.35)',
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              {initial}
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                RecipeBox Pro
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35 }}>
                Welcome back, {userName}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              startIcon={<HomeRoundedIcon />}
              variant={activeView === 'home' ? 'contained' : 'text'}
              onClick={() => onChangeView('home')}
              sx={{ minHeight: 34 }}
            >
              Home
            </Button>
            <Button
              startIcon={<RestaurantMenuRoundedIcon />}
              variant={activeView === 'recipes' ? 'contained' : 'text'}
              onClick={() => onChangeView('recipes')}
              sx={{ minHeight: 34 }}
            >
              Recipes
            </Button>
            <Button
              startIcon={<FavoriteRoundedIcon />}
              variant={activeView === 'favorites' ? 'contained' : 'text'}
              onClick={() => onChangeView('favorites')}
              sx={{ minHeight: 34 }}
            >
              Favorites
            </Button>
            <Tooltip title={themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
              <IconButton
                onClick={onToggleTheme}
                color="primary"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  width: 34,
                  height: 34,
                }}
              >
                {themeMode === 'dark' ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton
                onClick={onLogout}
                color="primary"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  width: 34,
                  height: 34,
                }}
              >
                <LogoutRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

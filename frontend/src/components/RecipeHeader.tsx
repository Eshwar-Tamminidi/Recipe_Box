import { useState } from 'react';
import { Box, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Stack, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LibraryAddRoundedIcon from '@mui/icons-material/LibraryAddRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
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
  onAddRecipe: () => void;
}

export default function RecipeHeader({
  activeView,
  onChangeView,
  themeMode,
  onToggleTheme,
  userName,
  onLogout,
  onAddRecipe,
}: RecipeHeaderProps) {
  const initial = userName?.trim()?.charAt(0)?.toUpperCase() || 'U';
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const isMobileMenuOpen = Boolean(mobileMenuAnchor);

  const closeMobileMenu = () => setMobileMenuAnchor(null);
  const changeMobileView = (view: ViewMode) => {
    onChangeView(view);
    closeMobileMenu();
  };

  const toggleThemeFromMenu = () => {
    onToggleTheme();
    closeMobileMenu();
  };

  const logoutFromMenu = () => {
    onLogout();
    closeMobileMenu();
  };

  const addRecipeFromMenu = () => {
    onAddRecipe();
    closeMobileMenu();
  };

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
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.2 }}>
            <Box
              sx={{
                width: { xs: 38, md: 42 },
                height: { xs: 38, md: 42 },
                flex: '0 0 auto',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, rgba(123, 209, 255, 0.35), rgba(118, 232, 208, 0.2))',
                border: '1px solid rgba(166, 210, 245, 0.35)',
                fontWeight: 800,
                fontSize: { xs: 16, md: 18 },
              }}
            >
              {initial}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  lineHeight: 1.1,
                  fontSize: { xs: '1.25rem', sm: '1.6rem', md: '2.125rem' },
                  whiteSpace: 'nowrap',
                }}
              >
                RecipeBox Pro
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mt: 0.35,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: '52vw', sm: '65vw', md: 'none' },
                }}
              >
                Welcome back, {userName}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <IconButton
            aria-label="open menu"
            aria-controls={isMobileMenuOpen ? 'mobile-header-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={isMobileMenuOpen ? 'true' : undefined}
            onClick={(event) => setMobileMenuAnchor(event.currentTarget)}
            color="primary"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              width: 40,
              height: 40,
            }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Menu
            id="mobile-header-menu"
            anchorEl={mobileMenuAnchor}
            open={isMobileMenuOpen}
            onClose={closeMobileMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: 2,
              },
            }}
          >
            <MenuItem selected={activeView === 'home'} onClick={() => changeMobileView('home')}>
              <ListItemIcon>
                <HomeRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Home</ListItemText>
            </MenuItem>
            <MenuItem selected={activeView === 'recipes'} onClick={() => changeMobileView('recipes')}>
              <ListItemIcon>
                <RestaurantMenuRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Recipes</ListItemText>
            </MenuItem>
            <MenuItem selected={activeView === 'favorites'} onClick={() => changeMobileView('favorites')}>
              <ListItemIcon>
                <FavoriteRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Favorites</ListItemText>
            </MenuItem>
            <MenuItem onClick={addRecipeFromMenu}>
              <ListItemIcon>
                <LibraryAddRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add Recipe</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={toggleThemeFromMenu}>
              <ListItemIcon>
                {themeMode === 'dark' ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText>{themeMode === 'dark' ? 'Light theme' : 'Dark theme'}</ListItemText>
            </MenuItem>
            <MenuItem onClick={logoutFromMenu}>
              <ListItemIcon>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, width: 'auto' }}>
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

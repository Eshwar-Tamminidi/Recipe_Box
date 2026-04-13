import { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, keyframes, useTheme } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import SoupKitchenRoundedIcon from '@mui/icons-material/SoupKitchenRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { glassPanelSx } from '../utils/glassPanel';

const floatAcross = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(-4deg);
  }
  50% {
    transform: translate3d(18px, -22px, 0) rotate(5deg);
  }
`;

const floatReverse = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(6deg);
  }
  50% {
    transform: translate3d(-18px, 20px, 0) rotate(-5deg);
  }
`;

const slowSpin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const steamRise = keyframes`
  0%, 100% {
    opacity: 0.34;
    transform: translateY(8px) scaleY(0.86);
  }
  50% {
    opacity: 0.72;
    transform: translateY(-8px) scaleY(1);
  }
`;

const noMotionSx = {
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    transition: 'none',
    transform: 'none',
  },
};

interface AuthCardProps {
  busy: boolean;
  error: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string) => Promise<void>;
}

type AuthMode = 'intro' | 'login' | 'signup';

export default function AuthCard({ busy, error, onLogin, onSignup }: AuthCardProps) {
  const theme = useTheme();
  const [mode, setMode] = useState<AuthMode>('intro');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'login') {
      await onLogin(email.trim(), password);
      return;
    }
    if (password !== confirmPassword) {
      return;
    }
    await onSignup(name.trim(), email.trim(), password);
  };

  const isDark = theme.palette.mode === 'dark';

  const chooseMode = (nextMode: Exclude<AuthMode, 'intro'>) => {
    setMode(nextMode);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <Box
      sx={{
        minHeight: mode === 'intro' ? { xs: 'calc(100vh - 24px)', md: 'calc(100vh - 40px)' } : { xs: 'auto', md: '82vh' },
        display: 'grid',
        placeItems: { xs: 'start center', md: 'center' },
        px: { xs: 0, sm: 1 },
        py: mode === 'intro' ? 0 : { xs: 1, md: 0 },
        position: 'relative',
        overflow: mode === 'intro' ? 'visible' : 'hidden',
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '5%', md: '8%' },
            left: { xs: '-16px', sm: '7%' },
            width: { xs: 86, sm: 116 },
            height: { xs: 86, sm: 116 },
            borderRadius: 4,
            display: 'grid',
            placeItems: 'center',
            color: 'primary.main',
            background: alpha(theme.palette.background.paper, isDark ? 0.36 : 0.56),
            border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.26 : 0.2)}`,
            boxShadow: `0 18px 42px ${alpha(theme.palette.primary.main, isDark ? 0.12 : 0.1)}`,
            backdropFilter: 'blur(12px)',
            animation: `${floatAcross} 8s ease-in-out infinite`,
            ...noMotionSx,
          }}
        >
          <SoupKitchenRoundedIcon sx={{ fontSize: { xs: 34, sm: 46 } }} />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            right: { xs: '-12px', sm: '10%' },
            top: { xs: '16%', md: '13%' },
            width: { xs: 74, sm: 98 },
            height: { xs: 74, sm: 98 },
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color: 'secondary.main',
            background: alpha(theme.palette.background.paper, isDark ? 0.32 : 0.52),
            border: `1px solid ${alpha(theme.palette.secondary.main, isDark ? 0.28 : 0.22)}`,
            boxShadow: `0 18px 40px ${alpha(theme.palette.secondary.main, isDark ? 0.12 : 0.1)}`,
            backdropFilter: 'blur(12px)',
            animation: `${floatReverse} 9s ease-in-out infinite`,
            ...noMotionSx,
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: '8%', md: '12%' },
            left: { xs: '5%', md: '14%' },
            px: 2,
            py: 1,
            borderRadius: 2,
            color: 'text.primary',
            background: alpha(theme.palette.background.paper, isDark ? 0.34 : 0.58),
            border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.18)}`,
            backdropFilter: 'blur(12px)',
            animation: `${floatReverse} 10s ease-in-out infinite`,
            ...noMotionSx,
          }}
        >
          <Typography variant="caption" fontWeight={800} letterSpacing={0}>
            Fresh picks
          </Typography>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            right: { xs: '8%', md: '18%' },
            bottom: { xs: '5%', md: '9%' },
            width: { xs: 62, sm: 82 },
            height: { xs: 62, sm: 82 },
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            color: 'error.main',
            background: alpha(theme.palette.background.paper, isDark ? 0.34 : 0.54),
            border: `1px solid ${alpha(theme.palette.error.main, isDark ? 0.28 : 0.2)}`,
            backdropFilter: 'blur(12px)',
            animation: `${floatAcross} 7.5s ease-in-out infinite`,
            animationDelay: '500ms',
            ...noMotionSx,
          }}
        >
          <FavoriteRoundedIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: { xs: '-36px', sm: '4%' },
            width: 140,
            height: 140,
            border: `1px dashed ${alpha(theme.palette.primary.main, isDark ? 0.26 : 0.18)}`,
            borderRadius: '50%',
            animation: `${slowSpin} 24s linear infinite`,
            ...noMotionSx,
          }}
        />

        {[0, 1, 2].map((line) => (
          <Box
            key={line}
            sx={{
              position: 'absolute',
              top: { xs: '28%', sm: '26%' },
              left: `calc(50% + ${line * 14 - 18}px)`,
              width: 7,
              height: { xs: 48, sm: 64 },
              borderRadius: 8,
              background: `linear-gradient(180deg, ${alpha(theme.palette.secondary.main, 0)}, ${alpha(
                theme.palette.secondary.main,
                isDark ? 0.28 : 0.2
              )}, ${alpha(theme.palette.secondary.main, 0)})`,
              animation: `${steamRise} ${2.2 + line * 0.25}s ease-in-out infinite`,
              animationDelay: `${line * 240}ms`,
              ...noMotionSx,
            }}
          />
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: mode === 'intro' ? 'none' : 980,
          minHeight: mode === 'intro' ? 'inherit' : 'auto',
          borderRadius: mode === 'intro' ? 0 : { xs: 3, sm: 6 },
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          ...(mode === 'intro'
            ? {
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
              }
            : glassPanelSx()),
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              mode === 'intro'
                ? 'transparent'
                : isDark
                  ? 'radial-gradient(circle at 12% 10%, rgba(123, 209, 255, 0.22) 0%, rgba(123, 209, 255, 0) 35%), radial-gradient(circle at 80% 75%, rgba(118, 232, 208, 0.2) 0%, rgba(118, 232, 208, 0) 40%)'
                  : 'radial-gradient(circle at 14% 12%, rgba(23, 105, 170, 0.16) 0%, rgba(23, 105, 170, 0) 36%), radial-gradient(circle at 84% 80%, rgba(14, 164, 126, 0.16) 0%, rgba(14, 164, 126, 0) 38%)',
          }}
        />

        {mode === 'intro' ? (
          <Box
            sx={{
              minHeight: 'inherit',
              display: 'grid',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
              p: { xs: 1.2, sm: 4, md: 5 },
              animation: 'authCardSlideIn 520ms ease-out',
              '@keyframes authCardSlideIn': {
                from: { opacity: 0, transform: 'translateY(16px) scale(0.985)' },
                to: { opacity: 1, transform: 'translateY(0) scale(1)' },
              },
            }}
          >
            <Stack spacing={{ xs: 2.2, sm: 2.8 }} sx={{ maxWidth: 760 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box
                  sx={{
                    width: { xs: 46, sm: 54 },
                    height: { xs: 46, sm: 54 },
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: alpha(theme.palette.primary.main, isDark ? 0.28 : 0.16),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                    flex: '0 0 auto',
                  }}
                >
                  <SoupKitchenRoundedIcon color="primary" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    RecipeBox
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your personal kitchen companion
                  </Typography>
                </Box>
              </Stack>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ mb: 1, fontSize: { xs: '2.25rem', sm: '3rem', md: '3.6rem' }, lineHeight: 1.03 }}
                >
                  Save recipes, favorites, and kitchen ideas in one place.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, fontSize: { xs: '1rem', md: '1.08rem' } }}>
                  Keep your dishes organized, filter what you need, and come back to every favorite meal quickly.
                </Typography>
              </Box>

              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1.1} alignItems="center">
                  <VerifiedRoundedIcon color="primary" fontSize="small" />
                  <Typography variant="body2">Private recipes for each account</Typography>
                </Stack>
                <Stack direction="row" spacing={1.1} alignItems="center">
                  <FavoriteRoundedIcon color="error" fontSize="small" />
                  <Typography variant="body2">Favorites and photos stay easy to find</Typography>
                </Stack>
                <Stack direction="row" spacing={1.1} alignItems="center">
                  <AutoAwesomeRoundedIcon color="secondary" fontSize="small" />
                  <Typography variant="body2">Simple tools for building your recipe box</Typography>
                </Stack>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LoginRoundedIcon />}
                  onClick={() => chooseMode('login')}
                  sx={{ minHeight: 48 }}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PersonAddAlt1RoundedIcon />}
                  onClick={() => chooseMode('signup')}
                  sx={{ minHeight: 48 }}
                >
                  Sign Up
                </Button>
              </Stack>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
              position: 'relative',
              zIndex: 1,
              animation: 'authCardSlideIn 520ms ease-out',
              '@keyframes authCardSlideIn': {
                from: { opacity: 0, transform: 'translateY(16px) scale(0.985)' },
                to: { opacity: 1, transform: 'translateY(0) scale(1)' },
              },
            }}
          >
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' },
              order: { sm: 2, md: 2 },
              p: { xs: 3, sm: 4 },
              borderTop: { sm: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, md: 'none' },
              borderLeft: { md: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` },
              background: isDark
                ? 'linear-gradient(145deg, rgba(14, 40, 65, 0.8), rgba(10, 26, 43, 0.56))'
                : 'linear-gradient(145deg, rgba(246, 252, 255, 0.88), rgba(230, 244, 255, 0.7))',
              animation: 'authLeftFadeIn 620ms ease-out',
              '@keyframes authLeftFadeIn': {
                from: { opacity: 0, transform: 'translateX(-10px)' },
                to: { opacity: 1, transform: 'translateX(0)' },
              },
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: alpha(theme.palette.primary.main, isDark ? 0.28 : 0.16),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              >
                <SoupKitchenRoundedIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  RecipeBox
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your personal kitchen companion
                </Typography>
              </Box>
            </Stack>

            <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1.2 }}>
              Cook smarter, save everything
            </Typography>

            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1.1} alignItems="center">
                <VerifiedRoundedIcon color="primary" fontSize="small" />
                <Typography variant="body2">Secure login and private recipes for each account</Typography>
              </Stack>
              <Stack direction="row" spacing={1.1} alignItems="center">
                <FavoriteRoundedIcon color="error" fontSize="small" />
                <Typography variant="body2">Save favorite dishes and access them instantly</Typography>
              </Stack>
              <Stack direction="row" spacing={1.1} alignItems="center">
                <AutoAwesomeRoundedIcon color="secondary" fontSize="small" />
                <Typography variant="body2">Beautiful recipe tracking with photos and filters</Typography>
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 4 }, display: { xs: 'flex', sm: 'block' }, flexDirection: 'column', order: { xs: 1, sm: 1, md: 1 } }}>
            <Button
              variant="text"
              size="small"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => setMode('intro')}
              sx={{ mb: { xs: 1, sm: 1.5 }, px: 0, alignSelf: { xs: 'flex-start', sm: 'auto' }, order: { xs: 0, sm: 'initial' } }}
            >
              Back
            </Button>
            <Box sx={{ order: { xs: 3, sm: 'initial' }, mt: { xs: 2.2, sm: 0 } }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'flex', sm: 'none' }, mb: 1.4 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: alpha(theme.palette.primary.main, isDark ? 0.28 : 0.16),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                    flex: '0 0 auto',
                  }}
                >
                  <SoupKitchenRoundedIcon color="primary" fontSize="small" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.05 }}>
                    RecipeBox
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                  Your personal kitchen companion
                </Typography>
              </Box>
            </Stack>

              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.1 }}>
                  Cook smarter, save everything
                </Typography>

                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <VerifiedRoundedIcon color="primary" fontSize="small" />
                    <Typography variant="body2">Secure login and private recipes for each account</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FavoriteRoundedIcon color="error" fontSize="small" />
                    <Typography variant="body2">Save favorite dishes and access them instantly</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AutoAwesomeRoundedIcon color="secondary" fontSize="small" />
                    <Typography variant="body2">Beautiful recipe tracking with photos and filters</Typography>
                  </Stack>
                </Stack>
              </Box>

              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ mb: 0.5, fontSize: { xs: '1.45rem', sm: '1.5rem' }, display: { xs: 'none', sm: 'block' } }}
              >
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 0, sm: 2.2 }, display: { xs: 'none', sm: 'block' } }}>
                {mode === 'login'
                  ? 'Login to continue managing your recipes.'
                  : 'Sign up to start building your personal recipe collection.'}
              </Typography>
            </Box>

            <Tabs
              value={mode}
              onChange={(_, next) => setMode(next)}
              sx={{
                mb: { xs: 1.6, sm: 2.2 },
                minHeight: { xs: 42, sm: 48 },
                order: { xs: 1, sm: 'initial' },
                '& .MuiTab-root': {
                  minHeight: { xs: 42, sm: 48 },
                },
              }}
              variant="fullWidth"
            >
              <Tab value="login" label="Login" icon={<LoginRoundedIcon fontSize="small" />} iconPosition="start" />
              <Tab
                value="signup"
                label="Sign Up"
                icon={<PersonAddAlt1RoundedIcon fontSize="small" />}
                iconPosition="start"
              />
            </Tabs>

            <Box component="form" onSubmit={handleSubmit} sx={{ order: { xs: 2, sm: 'initial' } }}>
              <Stack spacing={{ xs: 1.25, sm: 1.6 }}>
                {mode === 'signup' && (
                  <TextField
                    label="Full Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonRoundedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  inputProps={{ minLength: 6 }}
                  helperText={mode === 'signup' ? 'Use at least 6 characters.' : undefined}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {mode === 'signup' && (
                  <TextField
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    inputProps={{ minLength: 6 }}
                    error={Boolean(confirmPassword) && password !== confirmPassword}
                    helperText={
                      confirmPassword && password !== confirmPassword
                        ? 'Passwords do not match.'
                        : ' '
                    }
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockRoundedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          >
                            {showConfirmPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                {error ? <Alert severity="error">{error}</Alert> : null}
                {mode === 'signup' && confirmPassword && password !== confirmPassword ? (
                  <Alert severity="warning">Please make sure both passwords match.</Alert>
                ) : null}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={busy || (mode === 'signup' && password !== confirmPassword)}
                  sx={{ mt: { xs: 0.4, sm: 0 }, minHeight: 46 }}
                >
                  {mode === 'login' ? 'Login' : 'Create Account'}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
        )}
      </Paper>
    </Box>
  );
}

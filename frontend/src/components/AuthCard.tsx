import { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import SoupKitchenRoundedIcon from '@mui/icons-material/SoupKitchenRounded';
import { glassPanelSx } from '../utils/glassPanel';

interface AuthCardProps {
  busy: boolean;
  error: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string) => Promise<void>;
}

type AuthMode = 'login' | 'signup';

export default function AuthCard({ busy, error, onLogin, onSignup }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'login') {
      await onLogin(email.trim(), password);
      return;
    }
    await onSignup(name.trim(), email.trim(), password);
  };

  return (
    <Box sx={{ minHeight: '78vh', display: 'grid', placeItems: 'center' }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 470, p: 3, borderRadius: 4, ...glassPanelSx() }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <SoupKitchenRoundedIcon color="primary" />
          <Typography variant="h5" fontWeight={800}>
            RecipeBox Account
          </Typography>
        </Stack>

        <Tabs value={mode} onChange={(_, next) => setMode(next)} sx={{ mb: 2 }}>
          <Tab value="login" label="Login" icon={<LoginRoundedIcon fontSize="small" />} iconPosition="start" />
          <Tab value="signup" label="Sign Up" icon={<PersonAddAlt1RoundedIcon fontSize="small" />} iconPosition="start" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={1.6}>
            {mode === 'signup' && (
              <TextField
                label="Full Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                fullWidth
              />
            )}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              inputProps={{ minLength: 6 }}
              helperText={mode === 'signup' ? 'Use at least 6 characters.' : ' '}
              fullWidth
            />

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Button type="submit" variant="contained" disabled={busy}>
              {mode === 'login' ? 'Login' : 'Create Account'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

import { createTheme } from '@mui/material/styles';

export type AppThemeMode = 'light' | 'dark';

export function getTheme(mode: AppThemeMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#7bd1ff' : '#1769aa',
        contrastText: isDark ? '#04203a' : '#f5fbff',
      },
      secondary: {
        main: isDark ? '#76e8d0' : '#0ea47e',
      },
      error: {
        main: '#ff6b7a',
      },
      text: {
        primary: isDark ? '#f2f8ff' : '#11263a',
        secondary: isDark ? '#d0e0ef' : '#38526b',
      },
      background: {
        default: isDark ? '#071321' : '#eaf4fb',
        paper: isDark ? 'rgba(13, 30, 48, 0.82)' : 'rgba(252, 255, 255, 0.78)',
      },
    },
    typography: {
      fontFamily: '"Avenir Next", "Segoe UI", "Trebuchet MS", sans-serif',
      h4: {
        letterSpacing: 0.2,
      },
      h6: {
        letterSpacing: 0.2,
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#071321' : '#eaf4fb',
            color: isDark ? '#f2f8ff' : '#11263a',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: isDark
              ? '1px solid rgba(166, 210, 245, 0.26)'
              : '1px solid rgba(40, 111, 163, 0.22)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0 18px 40px rgba(2, 8, 20, 0.45)'
              : '0 16px 30px rgba(24, 74, 117, 0.12)',
            border: isDark
              ? '1px solid rgba(166, 210, 245, 0.26)'
              : '1px solid rgba(40, 111, 163, 0.2)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              background: isDark ? 'rgba(4, 20, 35, 0.75)' : 'rgba(255, 255, 255, 0.86)',
              color: isDark ? '#f2f8ff' : '#11263a',
              '& fieldset': {
                borderColor: isDark ? 'rgba(166, 210, 245, 0.34)' : 'rgba(40, 111, 163, 0.32)',
              },
              '&:hover fieldset': {
                borderColor: isDark ? 'rgba(166, 210, 245, 0.5)' : 'rgba(40, 111, 163, 0.45)',
              },
            },
            '& .MuiInputLabel-root': {
              color: isDark ? '#d0e0ef' : '#38526b',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            color: isDark ? '#f2f8ff' : '#11263a',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(8, 26, 44, 0.86)' : 'rgba(221, 241, 255, 0.88)',
            color: isDark ? '#f2f8ff' : '#174063',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: isDark
              ? 'linear-gradient(130deg, rgba(12, 36, 60, 0.95), rgba(8, 24, 41, 0.94))'
              : 'linear-gradient(130deg, rgba(243, 252, 255, 0.96), rgba(231, 245, 252, 0.95))',
            border: isDark
              ? '1px solid rgba(166, 210, 245, 0.24)'
              : '1px solid rgba(40, 111, 163, 0.18)',
          },
        },
      },
    },
  });
}

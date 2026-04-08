import { SxProps, Theme } from '@mui/material/styles';

export function glassPanelSx(): SxProps<Theme> {
  return (theme) => {
    const isDark = theme.palette.mode === 'dark';
    return {
      border: isDark
        ? '1px solid rgba(182, 223, 255, 0.26)'
        : '1px solid rgba(34, 108, 161, 0.22)',
      background: isDark
        ? 'linear-gradient(140deg, rgba(14, 35, 58, 0.82), rgba(12, 27, 44, 0.68))'
        : 'linear-gradient(140deg, rgba(255, 255, 255, 0.84), rgba(236, 247, 255, 0.74))',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: isDark
        ? '0 18px 42px rgba(2, 8, 20, 0.48)'
        : '0 16px 30px rgba(20, 76, 121, 0.14)',
    };
  };
}

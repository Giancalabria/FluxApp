import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    primary: {
      main: '#38BDF8',
      light: '#7DD3FC',
      dark: '#0284C7',
      contrastText: '#0F172A',
    },
    secondary: {
      main: '#818CF8',
      light: '#A5B4FC',
      dark: '#6366F1',
      contrastText: '#0F172A',
    },
    success: {
      main: '#34D399',
      light: '#6EE7B7',
      dark: '#059669',
    },
    error: {
      main: '#F87171',
      light: '#FCA5A5',
      dark: '#DC2626',
    },
    warning: {
      main: '#FBBF24',
      light: '#FDE68A',
      dark: '#D97706',
    },
    info: {
      main: '#38BDF8',
      light: '#7DD3FC',
      dark: '#0284C7',
    },
    text: {
      primary: '#E2E8F0',
      secondary: '#94A3B8',
      disabled: '#475569',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100dvh',
        },
        '#root': {
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: '1px solid rgba(148, 163, 184, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          backgroundColor: '#1E293B',
          backgroundImage: 'none',
          border: '1px solid rgba(148, 163, 184, 0.12)',
        },
      },
      defaultProps: {
        slotProps: {
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
            },
            invisible: false,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;

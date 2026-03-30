import { createTheme } from '@mui/material/styles';

export const CHART_PALETTE = ['#2C5F2D', '#97BC62', '#D97964', '#4A7C4B', '#A8C877', '#3D6B3E'];

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F2EFE9',
      paper: '#FFFFFF',
    },
    primary: {
      main: '#2C5F2D',
      light: '#97BC62',
      dark: '#1A3D1B',
      contrastText: '#F2EFE9',
    },
    secondary: {
      main: '#97BC62',
      light: '#D4E8A8',
      dark: '#4A7C4B',
      contrastText: '#1A3D1B',
    },
    success: {
      main: '#2C5F2D',
      light: '#97BC62',
      dark: '#1A3D1B',
    },
    error: {
      main: '#D97964',
      light: '#F0A090',
      dark: '#B05A47',
    },
    warning: {
      main: '#FBBF24',
      light: '#FDE68A',
      dark: '#D97706',
    },
    info: {
      main: '#4A7C4B',
      light: '#97BC62',
      dark: '#2C5F2D',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    divider: 'rgba(31, 41, 55, 0.08)',
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
          backgroundColor: '#F2EFE9',
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
          borderRadius: 12,
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
          borderRadius: 20,
          border: '1px solid rgba(31, 41, 55, 0.06)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
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
          borderRadius: 16,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
        },
      },
      defaultProps: {
        slotProps: {
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
          borderRadius: 8,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C5F2D',
          height: 64,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.5)',
          '&.Mui-selected': {
            color: '#97BC62',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 600,
            '&.Mui-selected': {
              fontSize: '0.72rem',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C5F2D',
          color: '#F2EFE9',
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;

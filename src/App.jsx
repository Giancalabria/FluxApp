import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { FinancialProfileProvider } from './context/FinancialProfileContext';
import AppRouter from './router';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <FinancialProfileProvider>
          <AppRouter />
        </FinancialProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

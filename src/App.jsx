import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { AuthProvider } from "./context/AuthContext";
import { FinancialProfileProvider } from "./context/FinancialProfileContext";
import { ImportProvider } from "./context/ImportContext";
import AppRouter from "./router";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <FinancialProfileProvider>
          <ImportProvider>
            <AppRouter />
          </ImportProvider>
        </FinancialProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

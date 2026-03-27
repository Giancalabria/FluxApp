import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import RequireFinancialProfiles from "../components/layout/RequireFinancialProfiles";
import Dashboard from "../pages/Dashboard";
import Accounts from "../pages/Accounts";
import Transactions from "../pages/Transactions";
import Activities from "../pages/Activities";
import ActivityDetail from "../pages/ActivityDetail";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Onboarding from "../pages/Onboarding";
import Import from "../pages/Import";
import Login from "../pages/Login";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100dvh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<RequireFinancialProfiles />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/import" element={<Import />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

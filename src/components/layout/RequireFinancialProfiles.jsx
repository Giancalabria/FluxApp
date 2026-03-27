import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useFinancialProfile } from '../../context/FinancialProfileContext';

export default function RequireFinancialProfiles() {
  const { loading, profiles } = useFinancialProfile();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (profiles.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

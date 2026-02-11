import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SwapHorizIcon from '@mui/icons-material/SwapHorizRounded';
import BarChartIcon from '@mui/icons-material/BarChartRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/accounts', label: 'Accounts', icon: <AccountBalanceWalletIcon /> },
  { path: '/transactions', label: 'Transactions', icon: <SwapHorizIcon /> },
  { path: '/reports', label: 'Reports', icon: <BarChartIcon /> },
];

export default function Sidebar({ onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h5" fontWeight={800} color="primary">
          FluxApp
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Personal Finance Tracker
        </Typography>
      </Box>

      <Divider />

      {/* Nav links */}
      <List sx={{ flexGrow: 1, px: 1, pt: 1 }}>
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = pathname === path;
          return (
            <ListItemButton
              key={path}
              onClick={() => handleNav(path)}
              selected={active}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      {/* Sign out */}
      <List sx={{ px: 1, pb: 1 }}>
        <ListItemButton
          onClick={signOut}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItemButton>
      </List>
    </Box>
  );
}

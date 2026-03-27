import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SwapHorizIcon from '@mui/icons-material/SwapHorizRounded';
import BarChartIcon from '@mui/icons-material/BarChartRounded';
import GroupIcon from '@mui/icons-material/GroupsRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import UploadFileIcon from '@mui/icons-material/UploadFileRounded';
import { useAuth } from '../../context/AuthContext';
import { useFinancialProfile } from '../../context/FinancialProfileContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/accounts', label: 'Accounts', icon: <AccountBalanceWalletIcon /> },
  { path: '/transactions', label: 'Transactions', icon: <SwapHorizIcon /> },
  { path: '/import', label: 'Import', icon: <UploadFileIcon /> },
  { path: '/activities', label: 'Split', icon: <GroupIcon /> },
  { path: '/reports', label: 'Reports', icon: <BarChartIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export default function Sidebar({ onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profiles, activeProfileId, setActiveProfileId } = useFinancialProfile();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h5" fontWeight={800} color="primary">
          FluxApp
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Personal Finance Tracker
        </Typography>
        {profiles.length > 0 && (
          <FormControl size="small" fullWidth sx={{ mt: 2 }}>
            <Select
              value={activeProfileId || ''}
              onChange={(e) => setActiveProfileId(e.target.value)}
              displayEmpty
              aria-label="Workspace"
            >
              {profiles.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.preferred_currency_code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, px: 1, pt: 1 }}>
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = pathname === path || (path !== '/dashboard' && pathname.startsWith(`${path}/`));
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

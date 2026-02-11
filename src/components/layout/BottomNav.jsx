import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SwapHorizIcon from '@mui/icons-material/SwapHorizRounded';
import BarChartIcon from '@mui/icons-material/BarChartRounded';
import GroupIcon from '@mui/icons-material/GroupsRounded';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: <DashboardIcon /> },
  { path: '/accounts', label: 'Accounts', icon: <AccountBalanceWalletIcon /> },
  { path: '/transactions', label: 'Moves', icon: <SwapHorizIcon /> },
  { path: '/activities', label: 'Split', icon: <GroupIcon /> },
  { path: '/reports', label: 'Reports', icon: <BarChartIcon /> },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentIndex = NAV_ITEMS.findIndex((item) => pathname.startsWith(item.path));

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar,
        borderTop: '1px solid',
        borderColor: 'divider',
        // Safe-area padding for notched phones (iPhone X+, etc.)
        pb: 'env(safe-area-inset-bottom, 0px)',
      }}
      elevation={8}
    >
      <BottomNavigation
        value={currentIndex}
        onChange={(_, newValue) => navigate(NAV_ITEMS[newValue].path)}
        sx={{
          bgcolor: 'background.paper',
          height: 60,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            py: 1,
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.65rem',
              '&.Mui-selected': {
                fontSize: '0.7rem',
              },
            },
          },
        }}
      >
        {NAV_ITEMS.map(({ label, icon }) => (
          <BottomNavigationAction key={label} label={label} icon={icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

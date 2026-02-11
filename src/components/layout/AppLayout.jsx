import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

const DRAWER_WIDTH = 240;

export default function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      {/* ─── Sidebar (desktop: permanent, mobile: temporary drawer) ─── */}
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          <Sidebar onClose={() => {}} />
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
            },
          }}
        >
          <Sidebar onClose={handleDrawerToggle} />
        </Drawer>
      )}

      {/* ─── Main content ─── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
          width: '100%',
          overflow: 'hidden',
          // Pad bottom: nav bar height (60px) + safe-area + breathing room
          pb: {
            xs: 'calc(60px + env(safe-area-inset-bottom, 0px) + 8px)',
            md: 0,
          },
        }}
      >
        {/* Mobile top bar */}
        {!isDesktop && <TopBar onMenuClick={handleDrawerToggle} />}

        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            // Prevent horizontal overflow on mobile
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* ─── Bottom navigation (mobile only) ─── */}
      {!isDesktop && <BottomNav />}
    </Box>
  );
}

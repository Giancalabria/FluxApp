import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/MenuRounded';

export default function TopBar({ onMenuClick }) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        // Respect notch / status-bar on iOS standalone mode
        pt: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56 } }}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuClick}
          sx={{ mr: 1 }}
          aria-label="Open menu"
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={800} color="primary" noWrap>
          FluxApp
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

import { AppBar, Toolbar, IconButton, Typography, FormControl, Select, MenuItem, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/MenuRounded';
import { useFinancialProfile } from '../../context/FinancialProfileContext';

export default function TopBar({ onMenuClick }) {
  const { profiles, activeProfileId, setActiveProfileId } = useFinancialProfile();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pt: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56 }, gap: 1 }}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuClick}
          sx={{ mr: 0.5 }}
          aria-label="Open menu"
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={800} color="primary" noWrap sx={{ flexShrink: 0 }}>
          FluxApp
        </Typography>
        <Box sx={{ flex: 1 }} />
        {profiles.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 120, maxWidth: 160 }}>
            <Select
              value={activeProfileId || ''}
              onChange={(e) => setActiveProfileId(e.target.value)}
              displayEmpty
              aria-label="Workspace"
            >
              {profiles.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Toolbar>
    </AppBar>
  );
}

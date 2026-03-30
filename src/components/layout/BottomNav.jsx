import { useLocation, useNavigate } from "react-router-dom";
import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Inicio", icon: <HomeRoundedIcon /> },
  { path: "/expenses", label: "Gastos", icon: <ReceiptLongRoundedIcon /> },
  { path: "/add", label: "Cargar", icon: <AddCircleRoundedIcon /> },
  { path: "/profile", label: "Perfil", icon: <PersonRoundedIcon /> },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentIndex = NAV_ITEMS.findIndex(
    (item) => pathname === item.path || pathname.startsWith(item.path + "/"),
  );

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar,
        borderTop: "none",
        pb: "env(safe-area-inset-bottom, 0px)",
      }}
      elevation={0}
    >
      <BottomNavigation
        value={currentIndex === -1 ? false : currentIndex}
        onChange={(_, newValue) => navigate(NAV_ITEMS[newValue].path)}
      >
        {NAV_ITEMS.map(({ label, icon }) => (
          <BottomNavigationAction key={label} label={label} icon={icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

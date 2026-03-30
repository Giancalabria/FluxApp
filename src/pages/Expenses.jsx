import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  Fab,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useAuth } from "../context/AuthContext";
import { useFinancialProfile } from "../context/FinancialProfileContext";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { useAccounts } from "../hooks/useAccounts";
import { useUserCurrencies } from "../hooks/useUserCurrencies";
import { formatCurrency, formatDate } from "../lib/formatters";
import { EXPENSE_CLASS_OPTIONS } from "../constants";

function getWeekRange(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
    label: `${monday.toLocaleDateString("es-AR", { day: "numeric", month: "short" })} – ${sunday.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`,
  };
}

function getMonthRange(offset = 0) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
    label: first.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    }),
  };
}

export default function Expenses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeProfile } = useFinancialProfile();
  const profileId = activeProfile?.id;

  const { currencies: userCurrencies } = useUserCurrencies(user?.id);
  const { categories } = useCategories(profileId);
  const { accounts } = useAccounts(profileId);

  const [currencyFilter, setCurrencyFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [periodMode, setPeriodMode] = useState("month"); // 'week' | 'month' | 'all'
  const [periodOffset, setPeriodOffset] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const range = useMemo(() => {
    if (periodMode === "all") {
      return { from: null, to: null, label: "Todas las fechas" };
    }
    if (periodMode === "week") {
      return getWeekRange(periodOffset);
    }
    return getMonthRange(periodOffset);
  }, [periodMode, periodOffset]);

  const classificationQuery = classificationFilter
    ? { classification: classificationFilter }
    : {};

  const { transactions, loading, error, deleteTransaction, clearError } =
    useTransactions({
      financialProfileId: profileId,
      currencyCode: currencyFilter || undefined,
      accountId: accountFilter || undefined,
      categoryId: categoryFilter || undefined,
      dateFrom: range.from ?? undefined,
      dateTo: range.to ?? undefined,
      ...classificationQuery,
    });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteTransaction(deleteTarget.id);
    setDeleteTarget(null);
  };

  const classLabel = (val) =>
    EXPENSE_CLASS_OPTIONS.find((o) => o.value === val)?.label ?? "";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100dvh" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          px: 2.5,
          pt: "max(env(safe-area-inset-top, 0px), 16px)",
          pb: 2.5,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: "primary.contrastText" }}
        >
          Mis Gastos
        </Typography>
      </Box>

      <Box sx={{ px: 2, pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} useFlexGap>
                <TextField
                  select
                  label="Moneda"
                  size="small"
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {userCurrencies.map((uc) => (
                    <MenuItem key={uc.currency_code} value={uc.currency_code}>
                      {uc.currency_code}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Cuenta"
                  size="small"
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {accounts.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack direction="row" spacing={1} useFlexGap>
                <TextField
                  select
                  label="Categoría"
                  size="small"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Tipo de gasto"
                  size="small"
                  value={classificationFilter}
                  onChange={(e) => setClassificationFilter(e.target.value)}
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {EXPENSE_CLASS_OPTIONS.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {[
                    { id: "week", label: "Semana" },
                    { id: "month", label: "Mes" },
                    { id: "all", label: "Todo" },
                  ].map(({ id, label }) => (
                    <Chip
                      key={id}
                      label={label}
                      size="small"
                      variant={periodMode === id ? "filled" : "outlined"}
                      color={periodMode === id ? "primary" : "default"}
                      onClick={() => {
                        setPeriodMode(id);
                        setPeriodOffset(0);
                      }}
                      sx={{
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => setPeriodOffset((p) => p - 1)}
                    disabled={periodMode === "all"}
                  >
                    <ArrowBackIosNewRoundedIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                  </IconButton>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ minWidth: 110, textAlign: "center" }}
                  >
                    {range.label}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setPeriodOffset((p) => p + 1)}
                    disabled={periodMode === "all" || periodOffset >= 0}
                  >
                    <ArrowForwardIosRoundedIcon
                      fontSize="small"
                      sx={{
                        color:
                          periodOffset >= 0 || periodMode === "all"
                            ? "action.disabled"
                            : "text.secondary",
                      }}
                    />
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "primary.main" }} />
          </Box>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {periodMode === "all"
                  ? "Sin gastos registrados"
                  : "Sin gastos en este período"}
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => navigate("/add")}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Cargar gasto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ mb: 10 }}>
            <CardContent sx={{ p: 0 }}>
              {transactions.map((t, idx) => (
                <Box key={t.id}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ flex: 1, mr: 1 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {t.description || "Sin descripción"}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(t.date)}
                        </Typography>
                        {t.account?.name && (
                          <Chip
                            label={t.account.name}
                            size="small"
                            sx={{ height: 18, fontSize: "0.62rem" }}
                          />
                        )}
                        {t.category?.name && (
                          <Chip
                            label={t.category.name}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 18, fontSize: "0.62rem" }}
                          />
                        )}
                        {t.classification && (
                          <Chip
                            label={classLabel(t.classification)}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: "0.62rem" }}
                          />
                        )}
                      </Stack>
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.5}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="error.main"
                      >
                        −{formatCurrency(t.amount, t.currency_code ?? "ARS")}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(t)}
                      >
                        <DeleteRoundedIcon
                          fontSize="small"
                          sx={{ color: "error.light" }}
                        />
                      </IconButton>
                    </Stack>
                  </Box>
                  {idx < transactions.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>
        )}
      </Box>

      <Fab
        color="primary"
        onClick={() => navigate("/add")}
        sx={{
          position: "fixed",
          bottom: 80,
          right: 20,
          bgcolor: "primary.main",
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        <AddRoundedIcon />
      </Fab>

      {/* Delete confirm */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar gasto</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Eliminás "{deleteTarget?.description || "este gasto"}"? Esta acción
            no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

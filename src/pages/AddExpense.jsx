import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Checkbox,
} from "@mui/material";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { useAuth } from "../context/AuthContext";
import { useFinancialProfile } from "../context/FinancialProfileContext";
import { useImport } from "../context/ImportContext";
import { useAccounts } from "../hooks/useAccounts";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import { useUserCurrencies } from "../hooks/useUserCurrencies";
import { BANK_IMPORT_OPTIONS, EXPENSE_CLASS_OPTIONS } from "../constants";
import { formatCurrency, formatDate } from "../lib/formatters";
import AddAccountDialog from "../components/common/AddAccountDialog";
import AddCategoryDialog from "../components/common/AddCategoryDialog";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = {
  amount: "",
  currency_code: "ARS",
  account_id: "",
  category_id: "",
  classification: "",
  description: "",
  date: todayISO(),
};

export default function AddExpense() {
  const { user, getAccessToken } = useAuth();
  const { activeProfile } = useFinancialProfile();
  const profileId = activeProfile?.id;

  const { accounts, refetch: refetchAccounts } = useAccounts(profileId);
  const { categories, refetch: refetchCategories } = useCategories(profileId);
  const { currencies: userCurrencies } = useUserCurrencies(user?.id);
  const { createTransaction, createTransactions } = useTransactions({
    financialProfileId: profileId,
  });

  // Manual form (local — only needed while the dialog is open)
  const [manualOpen, setManualOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [manualBusy, setManualBusy] = useState(false);
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState("");

  // Import — global state that survives navigation
  const {
    bank,
    setBank,
    file,
    setFile,
    parsed,
    setParsed,
    rowEdits,
    setRowEdits,
    importAccountId,
    setImportAccountId,
    importCurrency,
    setImportCurrency,
    importBusy,
    importStatus,
    importError,
    setImportError,
    importDone,
    setImportDone,
    importExpanded,
    setImportExpanded,
    importSelectedIndices,
    setImportSelectedIndices,
    startParse,
  } = useImport();

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (value === "__add_account__") {
      setAddAccountOpen(true);
      return;
    }
    if (value === "__add_category__") {
      setAddCategoryOpen(true);
      return;
    }
    setForm((prev) => {
      if (name === "category_id") {
        const cat = categories.find((c) => c.id === value);
        return {
          ...prev,
          [name]: value,
          classification: cat?.classification || prev.classification,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.account_id || !form.category_id) {
      setManualError("Completá monto, cuenta y categoría.");
      return;
    }
    setManualError("");
    setManualBusy(true);
    const { error } = await createTransaction({
      user_id: user.id,
      financial_profile_id: profileId,
      account_id: form.account_id,
      type: "expense",
      amount: parseFloat(form.amount),
      currency_code: form.currency_code,
      description: form.description || null,
      date: form.date,
      category_id: form.category_id,
      classification: form.classification || null,
    });
    setManualBusy(false);
    if (error) {
      setManualError(error.message || "No se pudo guardar.");
    } else {
      setManualSuccess(true);
      setForm({ ...emptyForm, currency_code: form.currency_code });
      setTimeout(() => setManualSuccess(false), 2500);
    }
  };

  const handleParse = async () => {
    if (!file) {
      setImportError("Elegí un archivo.");
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      setImportError("No autenticado.");
      return;
    }
    startParse({ file, bank, profileId, accessToken: token });
  };

  const [savingImport, setSavingImport] = useState(false);

  const handleImport = async () => {
    setImportError("");
    if (!parsed?.rows?.length) {
      setImportError("Sin filas para importar.");
      return;
    }
    if (!importAccountId) {
      setImportError("Elegí una cuenta destino.");
      return;
    }
    const missingCategory = (parsed.rows || []).some(
      (_, i) => !rowEdits[i]?.category_id,
    );
    if (missingCategory) {
      setImportError("Elegí una categoría para todas las filas.");
      return;
    }
    const rows = parsed.rows.map((r, i) => {
      const edit = rowEdits[i] || {};
      const rowCurrency = r.currency || parsed.currency || importCurrency;
      return {
        user_id: user.id,
        financial_profile_id: profileId,
        account_id: importAccountId,
        type: "expense",
        amount: Number(r.amount),
        currency_code: rowCurrency,
        description: r.description || "Importado",
        date: r.date,
        category_id: edit.category_id,
        classification: edit.classification || null,
      };
    });
    setSavingImport(true);
    const { error } = await createTransactions(rows);
    setSavingImport(false);
    if (error) {
      setImportError(error.message || "Error al importar");
    } else {
      const dates = [
        ...new Set(rows.map((r) => r.date).filter(Boolean)),
      ].sort();
      const d0 = dates[0];
      const d1 = dates[dates.length - 1];
      let detail = `Se guardaron ${rows.length} gasto(s).`;
      if (d0 && d1) {
        detail +=
          d0 === d1
            ? ` Fecha: ${formatDate(d0)}.`
            : ` Del ${formatDate(d0)} al ${formatDate(d1)}.`;
      }
      detail +=
        " En Mis Gastos elegí “Todo” en el período si no los ves en el mes actual.";
      setImportSuccessMessage(detail);
      setImportDone(true);
      setImportSelectedIndices([]);
      setParsed(null);
      setRowEdits([]);
      setFile(null);
    }
  };

  const toggleImportRowSelected = (index) => {
    setImportSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((x) => x !== index) : [...prev, index],
    );
  };

  const toggleSelectAllImportRows = () => {
    const n = parsed?.rows?.length ?? 0;
    if (n === 0) return;
    setImportSelectedIndices((prev) =>
      prev.length === n ? [] : Array.from({ length: n }, (_, i) => i),
    );
  };

  const deleteSelectedImportRows = () => {
    if (!parsed?.rows?.length || !importSelectedIndices.length) return;
    const toRemove = new Set(importSelectedIndices);
    const newRows = parsed.rows.filter((_, i) => !toRemove.has(i));
    const newEdits = rowEdits.filter((_, i) => !toRemove.has(i));
    if (newRows.length === 0) {
      setParsed(null);
    } else {
      setParsed({ ...parsed, rows: newRows });
    }
    setRowEdits(newEdits);
    setImportSelectedIndices([]);
  };

  const handleImportAccountChange = (e) => {
    const v = e.target.value;
    if (v === "__add_account__") {
      setAddAccountOpen(true);
      return;
    }
    setImportAccountId(v);
  };

  const displayCurrencies =
    userCurrencies.length > 0
      ? userCurrencies.map((uc) => ({ code: uc.currency_code }))
      : [{ code: "ARS" }, { code: "USD" }];

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
          Cargar Gastos
        </Typography>
      </Box>

      <Box sx={{ px: 2, pt: 2, pb: 4 }}>
        {/* Manual entry card */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  bgcolor: "primary.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EditNoteRoundedIcon sx={{ color: "#1A3D1B", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Carga manual
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ingresá un gasto directamente
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setManualOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Cargar manualmente
            </Button>
          </CardContent>
        </Card>

        {/* Import from file card */}
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  bgcolor: "secondary.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UploadFileRoundedIcon
                  sx={{ color: "#1A3D1B", fontSize: 24 }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Importar desde archivo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PDF, CSV o Excel de tu banco
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => setImportExpanded((p) => !p)}
              sx={{
                borderRadius: 2,
                borderColor: "primary.main",
                color: "primary.main",
              }}
            >
              {importExpanded ? "Ocultar" : "Importar estado de cuenta"}
            </Button>

            <Collapse in={importExpanded} sx={{ mt: 2 }}>
              <Stack spacing={2}>
                {importError && (
                  <Alert severity="error" onClose={() => setImportError("")}>
                    {importError}
                  </Alert>
                )}
                {importDone && (
                  <Alert
                    severity="success"
                    onClose={() => {
                      setImportDone(false);
                      setImportSuccessMessage("");
                    }}
                  >
                    {importSuccessMessage || "¡Importación exitosa!"}
                  </Alert>
                )}

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  flexWrap="wrap"
                >
                  <TextField
                    select
                    label="Banco"
                    size="small"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    sx={{ flex: 1, minWidth: 160 }}
                  >
                    {BANK_IMPORT_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={importBusy}
                    sx={{ borderRadius: 2, flex: 1, minWidth: 140 }}
                  >
                    {file ? file.name.slice(0, 20) : "Elegir archivo"}
                    <input
                      type="file"
                      hidden
                      accept=".csv,.xlsx,.xlsm,.pdf"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleParse}
                    disabled={importBusy || !file}
                    sx={{ borderRadius: 2 }}
                  >
                    {importBusy && !parsed ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Procesar"
                    )}
                  </Button>
                </Stack>

                {importBusy && importStatus && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {importStatus === "uploading"
                        ? "Subiendo archivo…"
                        : "Procesando datos…"}
                    </Typography>
                    <LinearProgress />
                  </Box>
                )}

                {parsed && (
                  <>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        Vista previa ({parsed.rows?.length ?? 0} filas)
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        disabled={importSelectedIndices.length === 0}
                        onClick={deleteSelectedImportRows}
                        sx={{
                          borderRadius: 2,
                          alignSelf: { xs: "stretch", sm: "auto" },
                        }}
                      >
                        Eliminar seleccionadas ({importSelectedIndices.length})
                      </Button>
                    </Stack>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      alignItems={{ sm: "center" }}
                    >
                      <TextField
                        select
                        label="Cuenta destino"
                        size="small"
                        value={importAccountId}
                        onChange={handleImportAccountChange}
                        sx={{ flex: 1 }}
                      >
                        {accounts.map((a) => (
                          <MenuItem key={a.id} value={a.id}>
                            {a.name}
                          </MenuItem>
                        ))}
                        <MenuItem
                          value="__add_account__"
                          sx={{ fontWeight: 700 }}
                        >
                          + Agregar cuenta
                        </MenuItem>
                      </TextField>
                      <TextField
                        select
                        label="Moneda (si no viene del PDF)"
                        size="small"
                        value={importCurrency}
                        onChange={(e) => setImportCurrency(e.target.value)}
                        sx={{ flex: 1 }}
                      >
                        {displayCurrencies.map((c) => (
                          <MenuItem key={c.code} value={c.code}>
                            {c.code}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleImport}
                        disabled={savingImport || !accounts.length}
                        sx={{
                          borderRadius: 2,
                          color: "#1A3D1B",
                          fontWeight: 700,
                        }}
                      >
                        {savingImport ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Cargar"
                        )}
                      </Button>
                    </Stack>

                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{ maxHeight: 340, borderRadius: 2 }}
                    >
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox" sx={{ width: 48 }}>
                              <Checkbox
                                size="small"
                                indeterminate={
                                  importSelectedIndices.length > 0 &&
                                  importSelectedIndices.length <
                                    (parsed.rows?.length ?? 0)
                                }
                                checked={
                                  (parsed.rows?.length ?? 0) > 0 &&
                                  importSelectedIndices.length ===
                                    (parsed.rows?.length ?? 0)
                                }
                                onChange={toggleSelectAllImportRows}
                                inputProps={{
                                  "aria-label": "Seleccionar  filas",
                                }}
                              />
                            </TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell align="right">Monto</TableCell>
                            <TableCell>Moneda</TableCell>
                            <TableCell>Categoría</TableCell>
                            <TableCell>Tipo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(parsed.rows || []).map((r, i) => {
                            const rowCurrency =
                              r.currency || parsed.currency || importCurrency;
                            return (
                              <TableRow
                                key={i}
                                sx={
                                  r.currency &&
                                  r.currency !== (parsed.currency || "ARS")
                                    ? { bgcolor: "rgba(151,188,98,0.08)" }
                                    : {}
                                }
                              >
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    size="small"
                                    checked={importSelectedIndices.includes(i)}
                                    onChange={() => toggleImportRowSelected(i)}
                                    inputProps={{
                                      "aria-label": `Seleccionar fila ${i + 1}`,
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                  {formatDate(r.date)}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    maxWidth: 160,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {r.description}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ whiteSpace: "nowrap" }}
                                >
                                  {formatCurrency(r.amount, rowCurrency)}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={rowCurrency}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: "0.65rem",
                                      fontWeight: 700,
                                      bgcolor: r.currency
                                        ? "secondary.light"
                                        : "grey.100",
                                      color: r.currency
                                        ? "primary.dark"
                                        : "text.secondary",
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ py: 0.5, minWidth: 140 }}>
                                  <TextField
                                    select
                                    size="small"
                                    fullWidth
                                    value={rowEdits[i]?.category_id ?? ""}
                                    onChange={(e) => {
                                      const id = e.target.value;
                                      if (id === "__add_category__") {
                                        setAddCategoryOpen(true);
                                        return;
                                      }
                                      setRowEdits((prev) => {
                                        const next = [...prev];
                                        const cur = { ...(next[i] || {}) };
                                        cur.category_id = id;
                                        const cat = categories.find(
                                          (c) => c.id === id,
                                        );
                                        if (cat?.classification)
                                          cur.classification =
                                            cat.classification;
                                        next[i] = cur;
                                        return next;
                                      });
                                    }}
                                  >
                                    {categories.map((c) => (
                                      <MenuItem key={c.id} value={c.id}>
                                        {c.name}
                                      </MenuItem>
                                    ))}
                                    <MenuItem
                                      value="__add_category__"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      + Agregar categoría
                                    </MenuItem>
                                  </TextField>
                                </TableCell>
                                <TableCell sx={{ py: 0.5, minWidth: 120 }}>
                                  <TextField
                                    select
                                    size="small"
                                    fullWidth
                                    value={rowEdits[i]?.classification ?? ""}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      setRowEdits((prev) => {
                                        const next = [...prev];
                                        next[i] = {
                                          ...(next[i] || {}),
                                          classification: v,
                                        };
                                        return next;
                                      });
                                    }}
                                  >
                                    <MenuItem value="">
                                      <em>Ninguno</em>
                                    </MenuItem>
                                    {EXPENSE_CLASS_OPTIONS.map((c) => (
                                      <MenuItem key={c.value} value={c.value}>
                                        {c.label}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {(parsed.warnings || []).length > 0 && (
                      <Alert severity="warning">
                        {parsed.warnings.join(" ")}
                      </Alert>
                    )}
                  </>
                )}
              </Stack>
            </Collapse>
          </CardContent>
        </Card>
      </Box>

      {/* Manual form dialog */}
      <Dialog
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleManualSubmit}>
          <DialogTitle>Nuevo gasto</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {manualError && <Alert severity="error">{manualError}</Alert>}
              {manualSuccess && (
                <Alert severity="success">¡Gasto guardado!</Alert>
              )}

              <Stack direction="row" spacing={1.5}>
                <TextField
                  label="Monto"
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleFormChange}
                  required
                  sx={{ flex: 2 }}
                  slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                />
                <TextField
                  select
                  label="Moneda"
                  name="currency_code"
                  value={form.currency_code}
                  onChange={handleFormChange}
                  sx={{ flex: 1 }}
                >
                  {displayCurrencies.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.code}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <TextField
                select
                label="Cuenta"
                name="account_id"
                value={form.account_id}
                onChange={handleFormChange}
                required
                fullWidth
              >
                {accounts.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
                <MenuItem value="__add_account__" sx={{ fontWeight: 700 }}>
                  + Agregar cuenta
                </MenuItem>
              </TextField>

              <TextField
                label="Descripción"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                fullWidth
                placeholder="Ej: Supermercado, Netflix..."
              />

              <TextField
                label="Fecha"
                name="date"
                type="date"
                value={form.date}
                onChange={handleFormChange}
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                select
                label="Categoría"
                name="category_id"
                value={form.category_id}
                onChange={handleFormChange}
                required
                fullWidth
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
                <MenuItem value="__add_category__" sx={{ fontWeight: 700 }}>
                  + Agregar categoría
                </MenuItem>
              </TextField>

              <TextField
                select
                label="Tipo de gasto"
                name="classification"
                value={form.classification}
                onChange={handleFormChange}
                fullWidth
              >
                <MenuItem value="">
                  <em>Sin tipo</em>
                </MenuItem>
                {EXPENSE_CLASS_OPTIONS.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label} — {c.description}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setManualOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={manualBusy}
              sx={{ borderRadius: 2 }}
            >
              {manualBusy ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <AddAccountDialog
        open={addAccountOpen}
        onClose={() => setAddAccountOpen(false)}
        onCreated={() => refetchAccounts()}
      />
      <AddCategoryDialog
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onCreated={() => refetchCategories()}
      />
    </Box>
  );
}

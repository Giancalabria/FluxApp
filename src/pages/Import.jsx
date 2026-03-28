import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useFinancialProfile } from "../context/FinancialProfileContext";
import { useAccounts } from "../hooks/useAccounts";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import { useExchangeRates } from "../hooks/useExchangeRates";
import { parseStatementFile } from "../services/parserApiService";
import { bankImportService } from "../services/bankImportService";
import { exchangeRateService } from "../services/exchangeRateService";
import {
  BANK_IMPORT_OPTIONS,
  TRANSACTION_TYPES,
  EXPENSE_CLASS_OPTIONS,
} from "../constants";
import { formatCurrency, formatDate } from "../lib/formatters";

export default function Import() {
  const { user, getAccessToken } = useAuth();
  const { activeProfile } = useFinancialProfile();
  const profileId = activeProfile?.id;
  const profileCcy = activeProfile?.preferred_currency_code ?? "ARS";
  const { accounts, loading: accLoading } = useAccounts(profileId);
  const { categories, loading: catLoading } = useCategories(profileId);
  const { createTransactions } = useTransactions({
    financialProfileId: profileId,
  });
  const { usdArsRate } = useExchangeRates();

  const [bank, setBank] = useState("generic");
  const [file, setFile] = useState(null);
  const [accountId, setAccountId] = useState("");
  const [parsed, setParsed] = useState(null);
  /** Per preview row: category_id and classification (aligned with parsed.rows). */
  const [rowEdits, setRowEdits] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [importDone, setImportDone] = useState(false);

  const handleParse = async () => {
    setError("");
    setImportDone(false);
    setParsed(null);
    setRowEdits([]);
    if (!file) {
      setError("Choose a file.");
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      setError("Not signed in.");
      return;
    }
    setBusy(true);
    try {
      const json = await parseStatementFile({
        file,
        bank,
        profileId,
        accessToken: token,
      });
      setParsed(json);
      setRowEdits(
        (json.rows || []).map(() => ({ category_id: "", classification: "" })),
      );
      if (user?.id && profileId) {
        await bankImportService.create({
          user_id: user.id,
          financial_profile_id: profileId,
          bank_code: bank,
          file_type:
            json.file_type ||
            file.name.split(".").pop()?.toLowerCase() ||
            "csv",
          status: "parsed",
          parser_version: "api",
          result_json: json,
          finished_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      setError(e.message || "Parse failed");
    } finally {
      setBusy(false);
    }
  };

  const handleImportRows = async () => {
    setError("");
    setImportDone(false);
    if (!parsed?.rows?.length) {
      setError("Nothing to import.");
      return;
    }
    if (!accountId) {
      setError("Select a target account.");
      return;
    }
    if (!user?.id || !profileId) {
      setError("Missing user or workspace.");
      return;
    }

    const acc = accounts.find((a) => a.id === accountId);
    const accCcy = acc?.currency_code ?? acc?.currency ?? profileCcy;

    const rows = parsed.rows.map((r, i) => {
      const amount = Number(r.amount);
      let amountProfile = exchangeRateService.convertToProfileCurrency(
        amount,
        accCcy,
        profileCcy,
        usdArsRate,
      );
      if (amountProfile == null) amountProfile = amount;
      const edit = rowEdits[i] || {};
      return {
        user_id: user.id,
        financial_profile_id: profileId,
        account_id: accountId,
        type: TRANSACTION_TYPES.EXPENSE,
        amount,
        amount_profile: amountProfile,
        currency_code: accCcy,
        currency_original: accCcy,
        description: r.description || "Import",
        date: r.date,
        category_id: edit.category_id || null,
        classification: edit.classification || null,
        exchange_rate_snapshot: accCcy === "USD" ? 1 : null,
      };
    });

    setBusy(true);
    const { error: err } = await createTransactions(rows);
    setBusy(false);
    if (err) setError(err.message || "Import failed");
    else {
      setImportDone(true);
      setParsed(null);
      setRowEdits([]);
      setFile(null);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Import statement
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload a CSV, XLSX, or PDF. Choose the bank (or generic). Parsed rows
        are imported as expenses into one account in this workspace (
        {profileCcy}).
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {importDone && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setImportDone(false)}
        >
          Transactions imported.
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ sm: "center" }}
            flexWrap="wrap"
          >
            <TextField
              select
              label="Bank"
              size="small"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {BANK_IMPORT_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" component="label" disabled={busy}>
              {file ? file.name : "Choose file"}
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
              disabled={busy || !file}
            >
              {busy ? <CircularProgress size={22} color="inherit" /> : "Parse"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {parsed && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Preview ({parsed.rows?.length ?? 0} rows)
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mb: 2 }}
              alignItems={{ sm: "center" }}
              flexWrap="wrap"
            >
              <TextField
                select
                label="Target account"
                size="small"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                sx={{ minWidth: 220 }}
                disabled={accLoading || !accounts.length}
              >
                {accounts.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name} ({a.currency_code ?? a.currency})
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleImportRows}
                disabled={busy || !accounts.length}
              >
                Import as expenses
              </Button>
            </Stack>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ maxHeight: 360 }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell sx={{ minWidth: 160 }}>Category</TableCell>
                    <TableCell sx={{ minWidth: 140 }}>Classification</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(parsed.rows || []).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{formatDate(r.date)}</TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          r.amount,
                          parsed.currency || profileCcy,
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 1, verticalAlign: "middle" }}>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={rowEdits[i]?.category_id ?? ""}
                          onChange={(e) => {
                            const id = e.target.value;
                            setRowEdits((prev) => {
                              const next = [...prev];
                              const cur = { ...(next[i] || {}) };
                              cur.category_id = id;
                              const cat = categories.find((c) => c.id === id);
                              if (cat?.classification) {
                                cur.classification = cat.classification;
                              } else if (!id) {
                                cur.classification = "";
                              }
                              next[i] = cur;
                              return next;
                            });
                          }}
                          disabled={catLoading}
                          slotProps={{
                            select: { displayEmpty: true },
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {categories.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                              {c.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ py: 1, verticalAlign: "middle" }}>
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
                          slotProps={{
                            select: { displayEmpty: true },
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {EXPENSE_CLASS_OPTIONS.map((c) => (
                            <MenuItem key={c.value} value={c.value}>
                              {c.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {(parsed.warnings || []).length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {parsed.warnings.join(" ")}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

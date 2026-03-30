import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { financialProfileService } from "../services/financialProfileService";
import { categoryService } from "../services/categoryService";
import { userCurrencyService } from "../services/userCurrencyService";
import { profileService } from "../services/profileService";
import { useFinancialProfile } from "../context/FinancialProfileContext";
import { useCurrencies } from "../hooks/useCurrencies";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refetchProfiles, setActiveProfileId } = useFinancialProfile();
  const { currencies } = useCurrencies();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    if (!name.trim()) {
      setError("Ingresá tu nombre.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!user?.id) {
      setError("Necesitás estar autenticado.");
      return;
    }
    if (!name.trim()) {
      setError("Ingresá tu nombre.");
      return;
    }
    if (!currency) {
      setError("Elegí una moneda.");
      return;
    }

    setSaving(true);

    const { data: profile, error: pErr } = await financialProfileService.create(
      {
        user_id: user.id,
        name: name.trim(),
        preferred_currency_code: currency,
        onboarding_completed_at: new Date().toISOString(),
      },
    );

    if (pErr || !profile) {
      setSaving(false);
      setError(pErr?.message || "No se pudo crear el perfil.");
      return;
    }

    const { error: cErr } = await categoryService.seedDefaultsForProfile(
      user.id,
      profile.id,
    );
    if (cErr) {
      setSaving(false);
      setError(
        cErr.message ||
          "El perfil se creó pero no se pudieron cargar las categorías.",
      );
      return;
    }

    const { error: nameErr } = await profileService.setUsername(
      user.id,
      name.trim(),
    );
    if (nameErr) {
      setSaving(false);
      setError(
        nameErr.message ||
          "El perfil se creó pero no se pudo guardar tu nombre.",
      );
      return;
    }

    await userCurrencyService.add(user.id, currency);

    await refetchProfiles();
    setActiveProfileId(profile.id);
    setSaving(false);
    navigate("/dashboard", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Card sx={{ maxWidth: 400, width: 1 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Typography
            variant="h5"
            fontWeight={800}
            color="primary"
            textAlign="center"
            gutterBottom
          >
            FluxApp
          </Typography>

          <LinearProgress
            variant="determinate"
            value={step === 1 ? 50 : 100}
            sx={{
              mb: 3,
              borderRadius: 4,
              bgcolor: "secondary.light",
              "& .MuiLinearProgress-bar": { bgcolor: "primary.main" },
            }}
          />

          {step === 1 ? (
            <>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                ¿Cómo te llamás?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Usaremos tu nombre para personalizar la experiencia.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Stack spacing={2.5}>
                <TextField
                  label="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                  autoFocus
                  placeholder="Ej: Lucía, Martín..."
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleNext}
                  disabled={!name.trim()}
                  sx={{ borderRadius: 2 }}
                >
                  Siguiente
                </Button>
              </Stack>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                ¿Qué moneda usás?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Podés agregar más monedas después desde tu perfil.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Stack spacing={2.5}>
                <TextField
                  label="Moneda principal"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  select
                  required
                  fullWidth
                >
                  {currencies.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.symbol} — {c.name} ({c.code})
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={saving || !currency}
                  sx={{ borderRadius: 2 }}
                >
                  {saving ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "¡Empezar!"
                  )}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  sx={{ color: "text.secondary" }}
                >
                  Volver
                </Button>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

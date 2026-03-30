import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { parseStatementFile } from "../services/parserApiService";

const ImportContext = createContext(undefined);

export function ImportProvider({ children }) {
  const [bank, setBank] = useState("generic");
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [rowEdits, setRowEdits] = useState([]);
  const [importAccountId, setImportAccountId] = useState("");
  const [importCurrency, setImportCurrency] = useState("ARS");
  const [importBusy, setImportBusy] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [importError, setImportError] = useState("");
  const [importDone, setImportDone] = useState(false);
  const [importExpanded, setImportExpanded] = useState(false);

  const parseIdRef = useRef(0);

  const startParse = useCallback(
    async ({ file: f, bank: b, profileId, accessToken }) => {
      const id = ++parseIdRef.current;

      setImportError("");
      setImportDone(false);
      setParsed(null);
      setRowEdits([]);
      setImportBusy(true);
      setImportStatus("uploading");

      try {
        const json = await parseStatementFile({
          file: f,
          bank: b,
          profileId,
          accessToken,
          onUploadComplete: () => {
            if (parseIdRef.current === id) setImportStatus("processing");
          },
        });
        if (parseIdRef.current === id) {
          setParsed(json);
          setRowEdits(
            (json.rows || []).map(() => ({
              category_id: "",
              classification: "",
            })),
          );
        }
      } catch (e) {
        if (parseIdRef.current === id) {
          setImportError(e.message || "Error al parsear");
        }
      } finally {
        if (parseIdRef.current === id) {
          setImportBusy(false);
          setImportStatus(null);
        }
      }
    },
    [],
  );

  const reset = useCallback(() => {
    parseIdRef.current++;
    setBank("generic");
    setFile(null);
    setParsed(null);
    setRowEdits([]);
    setImportAccountId("");
    setImportCurrency("ARS");
    setImportBusy(false);
    setImportStatus(null);
    setImportError("");
    setImportDone(false);
  }, []);

  const value = useMemo(
    () => ({
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
      startParse,
      reset,
    }),
    [
      bank,
      file,
      parsed,
      rowEdits,
      importAccountId,
      importCurrency,
      importBusy,
      importStatus,
      importError,
      importDone,
      importExpanded,
      startParse,
      reset,
    ],
  );

  return (
    <ImportContext.Provider value={value}>{children}</ImportContext.Provider>
  );
}

export function useImport() {
  const ctx = useContext(ImportContext);
  if (ctx === undefined) {
    throw new Error("useImport must be used inside <ImportProvider>");
  }
  return ctx;
}

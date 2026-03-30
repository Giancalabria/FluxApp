const base = () => {
  const u = import.meta.env.VITE_PARSER_API_URL;
  if (!u) return "";
  return String(u).replace(/\/$/, "");
};

/**
 * @param {object} opts
 * @param {File} opts.file
 * @param {string} opts.bank
 * @param {string} [opts.profileId]
 * @param {string} opts.accessToken
 * @param {() => void} [opts.onUploadComplete] Called when HTTP response is received (before JSON parse).
 */
export async function parseStatementFile({
  file,
  bank,
  profileId,
  accessToken,
  onUploadComplete,
}) {
  const url = base();
  if (!url) {
    throw new Error("VITE_PARSER_API_URL is not set");
  }
  const form = new FormData();
  form.append("file", file);
  form.append("bank", bank);
  if (profileId) form.append("profile_id", profileId);

  const res = await fetch(`${url}/parse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (typeof onUploadComplete === "function") {
    onUploadComplete();
  }

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { detail: text };
  }

  if (!res.ok) {
    const msg =
      json.detail || json.message || res.statusText || "Parse request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return json;
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { IS_MOCK } from "@/lib/api";
import { getIdToken } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "(non défini)";

type HealthResult =
  | { ok: true; status: number; body: string }
  | { ok: false; error: string };

type UploadResult =
  | { ok: true; status: number; body: string }
  | { ok: false; error: string };

// 1×1 red PNG (smallest valid image)
const FAKE_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";

function b64toBlob(b64: string, mime: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function DebugPage() {
  const { user, loading: authLoading } = useAuth();
  const [health, setHealth] = useState<HealthResult | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [upload, setUpload] = useState<UploadResult | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealth(null);
    try {
      const resp = await fetch(`${API_URL}/health`, {
        headers: { "ngrok-skip-browser-warning": "true" },
        cache: "no-store",
      });
      const body = await resp.text();
      setHealth({ ok: true, status: resp.status, body });
    } catch (e) {
      setHealth({ ok: false, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Auto-check health on mount
  useEffect(() => { checkHealth(); }, [checkHealth]);

  const testUpload = useCallback(async () => {
    setUploadLoading(true);
    setUpload(null);
    try {
      const token = await getIdToken();
      const blob = b64toBlob(FAKE_PNG_B64, "image/png");
      const form = new FormData();
      form.append("file", new File([blob], "debug-1px.png", { type: "image/png" }));
      const resp = await fetch("/api/v1/products/upload", {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: form,
      });
      const body = await resp.text();
      setUpload({ ok: true, status: resp.status, body });
    } catch (e) {
      setUpload({ ok: false, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setUploadLoading(false);
    }
  }, []);

  return (
    <div style={{ fontFamily: "monospace", padding: "32px", maxWidth: 720, margin: "0 auto", color: "inherit" }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 24 }}>
        🔧 ARShot — Diagnostic backend
      </h1>

      {/* ── Env ── */}
      <Section title="Environnement">
        <Row label="IS_MOCK" value={String(IS_MOCK)} ok={!IS_MOCK} />
        <Row
          label="NEXT_PUBLIC_API_URL"
          value={API_URL}
          ok={API_URL !== "(non défini)"}
        />
      </Section>

      {/* ── Firebase user ── */}
      <Section title="Firebase Auth">
        {authLoading ? (
          <p style={{ color: "#888" }}>Chargement…</p>
        ) : user ? (
          <>
            <Row label="uid" value={user.uid} ok />
            <Row label="email" value={user.email ?? "(vide)"} ok />
            <Row label="displayName" value={user.displayName ?? "(vide)"} ok />
            <Row label="mock user" value={user.uid === "dev-user-001" ? "oui ⚠️" : "non ✅"} ok={user.uid !== "dev-user-001"} />
          </>
        ) : (
          <Row label="statut" value="non connecté" ok={false} />
        )}
      </Section>

      {/* ── Health ── */}
      <Section
        title="GET /health"
        action={
          <button onClick={checkHealth} disabled={healthLoading} style={btnStyle}>
            {healthLoading ? "…" : "Relancer"}
          </button>
        }
      >
        {healthLoading && <p style={{ color: "#888" }}>En cours…</p>}
        {health && (
          health.ok ? (
            <>
              <Row label="HTTP" value={String(health.status)} ok={health.status < 400} />
              <pre style={preStyle}>{tryPrettyJson(health.body)}</pre>
            </>
          ) : (
            <Row label="Erreur" value={health.error} ok={false} />
          )
        )}
      </Section>

      {/* ── Upload ── */}
      <Section
        title="POST /api/v1/products/upload (1px PNG)"
        action={
          <button onClick={testUpload} disabled={uploadLoading} style={btnStyle}>
            {uploadLoading ? "…" : "Tester l'upload"}
          </button>
        }
      >
        {uploadLoading && <p style={{ color: "#888" }}>Envoi en cours…</p>}
        {upload && (
          upload.ok ? (
            <>
              <Row label="HTTP" value={String(upload.status)} ok={upload.status < 400} />
              <pre style={preStyle}>{tryPrettyJson(upload.body)}</pre>
            </>
          ) : (
            <Row label="Erreur" value={upload.error} ok={false} />
          )
        )}
      </Section>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28, border: "1px solid #333", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ background: "#1a1a1a", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#ccc" }}>{title}</span>
        {action}
      </div>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: "0.85rem" }}>
      <span style={{ color: "#888", minWidth: 180, flexShrink: 0 }}>{label}</span>
      <span style={{ color: ok ? "#4ade80" : "#f87171", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

function tryPrettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

const btnStyle: React.CSSProperties = {
  padding: "4px 12px",
  background: "#0066FF",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: "0.8rem",
  cursor: "pointer",
};

const preStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "#aaa",
  background: "#111",
  padding: "10px 12px",
  borderRadius: 6,
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
  marginTop: 4,
};

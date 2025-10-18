"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Sign up failed");
      localStorage.setItem("yim_user", JSON.stringify(data.user || {}));
      router.replace("/tasks");
    } catch (e) {
      setErr(e.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleCredential(credential) {
    try {
      const res = await fetch(`${API}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Google sign-up failed");
      localStorage.setItem("yim_user", JSON.stringify(data.user || {}));
      router.replace("/tasks");
    } catch (e) {
      setErr(e.message || "Google sign-up failed");
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.bg} aria-hidden />
      <form onSubmit={onSubmit} style={styles.card}>
        <div style={styles.title}>Create your account</div>

        <div style={styles.row2}>
          <div style={styles.field}>
            <input
              type="text"
              placeholder="First name"
              value={form.first_name}
              onChange={(e) => setField("first_name", e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <input
              type="text"
              placeholder="Last name"
              value={form.last_name}
              onChange={(e) => setField("last_name", e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.field}>
          <input
            type="text"
            placeholder="Username (optional)"
            value={form.username}
            onChange={(e) => setField("username", e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <input
            type="email"
            placeholder="email@example.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={{ ...styles.field, position: "relative" }}>
          <input
            type="password"
            placeholder="Create a password (min 8 chars)"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            style={{ ...styles.input, paddingRight: 64 }}
          />
          <span style={styles.key} aria-hidden>🔑</span>
        </div>

        <button disabled={loading} type="submit" style={styles.button}>
          {loading ? "Creating…" : "Create Account"}
        </button>

        <div style={styles.divider}>or</div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={(r) => onGoogleCredential(r.credential)}
            onError={() => setErr("Google sign-up failed")}
            useOneTap={false}
          />
        </div>

        <div style={styles.subtle}>
          Already have an account?{" "}
          <a href="/login" style={styles.link}>Sign in</a>
        </div>

        {err && <div style={styles.error}>{err}</div>}
      </form>
    </main>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100dvh",
    fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
    color: "#0f172a",
  },
  bg: {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    background: "linear-gradient(180deg,#f59e0b 0%,#ec4899 40%,#3b82f6 100%)",
  },
  // Wider card + bigger side padding so Safari's password pill stays inside
  card: {
    width: 720,
    maxWidth: "95vw",
    margin: "10vh auto 0",
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 30px 90px rgba(15,23,42,.22)",
    padding: "32px 44px 28px",     // generous side padding
  },
  title: { fontWeight: 900, fontSize: 24, marginBottom: 14 },
  // Keep all fields centered with a unified wrapper to avoid overflow
  field: {
    width: "100%",
    boxSizing: "border-box",
    marginBottom: 12,
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 0,
  },
  input: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 14px",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  },
  key: {
    position: "absolute",
    right: 18,
    top: "50%",
    transform: "translateY(-50%)",
    opacity: 0.6,
    fontSize: 18,
    pointerEvents: "none",
  },
  button: {
    width: "100%",
    height: 46,
    border: 0,
    borderRadius: 12,
    background: "#93c5fd",
    color: "#0f172a",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 4,
  },
  divider: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
    margin: "12px 0",
  },
  subtle: { textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 6 },
  link: { textDecoration: "none", color: "#2563eb", fontWeight: 700 },
  error: { textAlign: "center", color: "#b91c1c", fontWeight: 700, marginTop: 10 },
};

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();                    // <-- defined INSIDE component
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.detail || "Invalid email or password");
      }
      const j = await res.json();
      localStorage.setItem("yim_user", JSON.stringify(j.user || {}));
      router.replace("/dashboard");              // <-- safe to use here
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.bg} aria-hidden />
      <form onSubmit={onSubmit} style={styles.card}>
        <div style={styles.brand}>YIM BOT</div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          style={styles.input}
        />
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{ ...styles.input, paddingRight: 36 }}
          />
          <span style={styles.keyIcon} aria-hidden>🔑</span>
        </div>

        <button disabled={loading} type="submit" style={styles.button}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <a href="/register" style={styles.link}>Create Account</a>

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
    position: "fixed", inset: 0, zIndex: -1,
    background: "linear-gradient(180deg,#f59e0b 0%,#ec4899 40%,#3b82f6 100%)",
  },
  card: {
    width: 420, maxWidth: "92vw",
    margin: "18vh auto 0",
    background: "rgba(255,255,255,.95)",
    borderRadius: 14,
    boxShadow: "0 24px 60px rgba(15,23,42,.22)",
    padding: 22,
    display: "grid", gap: 12, justifyItems: "stretch",
  },
  brand: { fontWeight: 900, fontSize: 20, marginBottom: 6 },
  input: {
    width: "100%",
    borderRadius: 10, border: "1px solid #d1d5db",
    padding: "12px 12px", fontSize: 14, outline: "none",
  },
  keyIcon: { position: "absolute", right: 10, top: 10, opacity: .6 },
  button: {
    border: 0, padding: "12px 14px", borderRadius: 10,
    background: "#93c5fd", color: "#0f172a", fontWeight: 800, cursor: "pointer"
  },
  link: { textAlign: "center", textDecoration: "none", color: "#2563eb", fontWeight: 700 },
  error: { textAlign: "center", color: "#b91c1c", fontWeight: 700, marginTop: 4 },
};

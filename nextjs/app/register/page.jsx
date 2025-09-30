"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegisterPage() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (!email || !password) {
      setMsg({ type: "error", text: "Email and password are required." });
      return;
    }
    if (password.length < 8) {
      setMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: first || null,
          last_name: last || null,
          username: (username || "").trim() || null,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Sign up failed");
      setMsg({ type: "success", text: "Account created. You can sign in now." });
      // OPTIONAL: redirect to login
      // setTimeout(() => (window.location.href = "/login"), 800);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.brandRow}>
          <Image src="/yim-logo.png" width={40} height={40} alt="YIM BOT" />
          <h1 style={{ margin: 0, fontSize: 22 }}>YIM BOT</h1>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              style={styles.input}
              placeholder="First Name (optional)"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
            <input
              style={styles.input}
              placeholder="Last Name (optional)"
              value={last}
              onChange={(e) => setLast(e.target.value)}
            />
          </div>

          <input
            style={styles.input}
            placeholder="Username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            style={styles.input}
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password (min 8 chars) *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button style={styles.btn} disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link href="/login" style={styles.link}>Back to Sign in</Link>
        </div>

        {msg && (
          <p style={{ ...styles.msg, color: msg.type === "error" ? "#b91c1c" : "#166534" }}>
            {msg.text}
          </p>
        )}
      </div>
    </main>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(180deg,#f59e0b 0%,#ec4899 40%,#3b82f6 100%)",
    padding: 16,
  },
  card: {
    width: 720,
    maxWidth: "100%",
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,.08)",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  input: { padding: "12px 14px", borderRadius: 8, border: "1px solid #cbd5e1", outline: "none" },
  btn: { padding: "12px 16px", borderRadius: 10, background: "#93c5fd", border: 0, fontWeight: 700, cursor: "pointer" },
  link: { fontWeight: 700, color: "#2563eb", textDecoration: "none" },
  msg: { marginTop: 10, textAlign: "center", fontWeight: 600 },
};

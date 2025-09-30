"use client";
import { useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PathGenerator() {
  // params
  const [width, setWidth] = useState(40);
  const [length, setLength] = useState(25);
  const [height, setHeight] = useState(8);
  const [gap, setGap] = useState(3);
  const [avgSpeed, setAvgSpeed] = useState(2.5);
  const [maxAlt, setMaxAlt] = useState(6);
  const [name, setName] = useState("warehouse-scan");

  // history
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  // make serpentine waypoints
  const waypoints = useMemo(() => {
    const pts = [];
    const rows = Math.max(1, Math.floor(length / gap));
    const stepY = length / rows;
    let y = 0;
    for (let i = 0; i <= rows; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const xStart = dir === 1 ? 0 : width;
      const xEnd = dir === 1 ? width : 0;
      const altitude =
        Math.min(maxAlt, height * (0.6 + 0.4 * (i / Math.max(1, rows))));
      pts.push({ x: xStart, y, z: altitude });
      pts.push({ x: xEnd, y, z: altitude });
      y = Math.min(length, y + stepY);
    }
    return pts;
  }, [width, length, gap, height, maxAlt]);

  const totalMeters = useMemo(() => {
    let s = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const a = waypoints[i - 1],
        b = waypoints[i];
      s += Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
    }
    return s;
  }, [waypoints]);

  const estMinutes = useMemo(
    () => totalMeters / Math.max(0.1, avgSpeed) / 60,
    [totalMeters, avgSpeed]
  );

  async function saveAndExport() {
    try {
      setSaving(true);
      const payload = { name, params: { width, length, height, gap, avgSpeed, maxAlt }, waypoints };
      const res = await fetch(`${API}/paths`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Save failed");
      // export
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name || "path"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      await loadHistory();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setName("warehouse-scan");
    setWidth(40);
    setLength(25);
    setHeight(8);
    setGap(3);
    setAvgSpeed(2.5);
    setMaxAlt(6);
  }

  async function loadHistory() {
    try {
      const r = await fetch(`${API}/paths?limit=10`);
      const j = await r.json();
      setHistory(j.items || []);
    } catch {
      setHistory([]);
    }
  }
  useEffect(() => {
    loadHistory();
  }, []);

  // SVG helpers
  const W = 360,
    H = 240,
    pad = 24;
  const xScale = (x) => pad + (x / Math.max(1, width)) * (W - 2 * pad);
  const yScale = (y) => H - pad - (y / Math.max(1, length)) * (H - 2 * pad);
  const d = waypoints
    .map((p, i) => `${i ? "L" : "M"} ${xScale(p.x)},${yScale(p.y)}`)
    .join(" ");

  return (
    <main style={styles.page}>
      <div style={styles.bg} aria-hidden />

      <header style={styles.header}>
        <h1 style={styles.h1}>Path generator</h1>
        <a href="/tasks" style={styles.back}>
          ← Back
        </a>
      </header>

      {/* top panel */}
      <section style={styles.panel}>
        <div>
          <h3 style={styles.panelTitle}>Path generator</h3>
          <div style={styles.canvasCard}>
            <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
              <line
                x1={pad}
                y1={H - pad}
                x2={W - pad}
                y2={H - pad}
                stroke="#9ca3af"
                strokeWidth="1"
              />
              <line
                x1={pad}
                y1={pad}
                x2={pad}
                y2={H - pad}
                stroke="#9ca3af"
                strokeWidth="1"
              />
              <path d={d} fill="none" stroke="#ef4444" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div>
          <div style={styles.grid}>
            <Field label="Warehouse width (m)" value={width} set={setWidth} />
            <Field label="Warehouse length (m)" value={length} set={setLength} />
            <Field label="Warehouse height (m)" value={height} set={setHeight} />
            <Field label="Zigzag gap (m)" value={gap} set={setGap} />
            <Field
              label="Avg Speed (m/s)"
              value={avgSpeed}
              set={setAvgSpeed}
              step="0.1"
            />
            <Field label="Max Altitude (m)" value={maxAlt} set={setMaxAlt} />
          </div>

          <div style={{ marginTop: 8, opacity: 0.9 }}>
            <div>
              <b>Total:</b> {totalMeters.toFixed(1)} m
            </div>
            <div>
              <b>Est. time:</b> {estMinutes.toFixed(1)} min
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Path name"
              style={styles.name}
            />
            <button onClick={saveAndExport} disabled={saving} style={styles.save}>
              {saving ? "Saving..." : "Save & Export"}
            </button>
            <button onClick={discard} style={styles.discard}>
              Discard
            </button>
          </div>
        </div>
      </section>

      {/* history */}
      <section style={styles.historyWrap}>
        <h3 style={styles.panelTitle}>History</h3>
        <div style={styles.historyList}>
          {history.length === 0 && (
            <div style={styles.empty}>No saved paths yet.</div>
          )}
          {history.map((p) => (
            <button
              key={p.id}
              style={styles.historyItem}
              onClick={() => {
                setName(p.name || "path");
                const params = p.params || {};
                setWidth(params.width ?? width);
                setLength(params.length ?? length);
                setHeight(params.height ?? height);
                setGap(params.gap ?? gap);
                setAvgSpeed(params.avgSpeed ?? avgSpeed);
                setMaxAlt(params.maxAlt ?? maxAlt);
              }}
              title="Load params"
            >
              <div style={{ fontWeight: 700 }}>{p.name || "path"}</div>
              <div style={{ opacity: 0.8, fontSize: 12 }}>
                {new Date(p.created_at).toLocaleString()} •{" "}
                {Array.isArray(p.waypoints) ? p.waypoints.length : 0} pts
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, set, step = "1" }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        style={styles.input}
      />
    </label>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100dvh",
    fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
    color: "#fff",
  },
  bg: {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    background:
      "linear-gradient(180deg,#f59e0b 0%,#ec4899 40%,#3b82f6 100%)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
  },
  h1: { margin: 0, opacity: 0.9 },
  back: { color: "#fff", textDecoration: "none", fontWeight: 700 },
  panel: {
    display: "grid",
    gridTemplateColumns: "minmax(320px,420px) 1fr",
    gap: 18,
    background: "rgba(255,255,255,0.2)",
    margin: "8px 12px",
    padding: 16,
    borderRadius: 12,
  },
  panelTitle: { margin: "0 0 10px", fontWeight: 800 },
  canvasCard: {
    background: "rgba(255,255,255,.85)",
    borderRadius: 12,
    padding: 10,
    color: "#0f172a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 10,
  },
  field: { display: "grid", gap: 6 },
  label: { fontSize: 12, opacity: 0.9 },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,.5)",
    background: "rgba(255,255,255,.8)",
    color: "#0f172a",
  },
  name: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.6)",
    background: "rgba(255,255,255,.9)",
    color: "#0f172a",
  },
  save: {
    border: 0,
    padding: "10px 14px",
    borderRadius: 10,
    background: "#22c55e",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  discard: {
    border: 0,
    padding: "10px 14px",
    borderRadius: 10,
    background: "#ef4444",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  historyWrap: {
    background: "rgba(255,255,255,0.22)",
    margin: "10px 12px 18px",
    padding: 16,
    borderRadius: 12,
  },
  historyList: { display: "grid", gap: 8, maxHeight: 260, overflowY: "auto", paddingRight: 8 },
  historyItem: {
    textAlign: "left",
    border: 0,
    borderRadius: 10,
    padding: "10px 12px",
    background: "rgba(255,255,255,.85)",
    color: "#0f172a",
    cursor: "pointer",
  },
  empty: {
    opacity: 0.9,
    background: "rgba(255,255,255,.75)",
    color: "#0f172a",
    padding: "12px",
    borderRadius: 10,
  },
};

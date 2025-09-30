"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DbDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // require login
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("yim_user") || "null");
      if (!u) router.replace("/login");
      else setUser(u);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/stats/overview`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const usersSeries = stats?.users_last7_by_day ?? [];
  const pathsSeries = stats?.paths_last7_by_day ?? [];
  const maxUsers = Math.max(...usersSeries.map(d => d.cnt || 0), 1);
  const maxPaths = Math.max(...pathsSeries.map(d => d.cnt || 0), 1);

  const logout = () => {
    localStorage.removeItem("yim_user");
    router.replace("/login");
  };

  return (
    <main style={styles.page}>
      <div style={styles.bg} aria-hidden />

      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Database Dashboard</h1>
          <div style={{opacity:.9}}>Live counts from PostgreSQL</div>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          {user && <span style={{color:"#fff", opacity:.9, fontSize:14}}>{user.email}</span>}
          <a href="/tasks" style={{...styles.btn, background:"rgba(255,255,255,.4)", color:"#0f172a"}}>Tasks</a>
          <button onClick={logout} style={{...styles.btn, background:"#ef4444", color:"#fff"}}>Log out</button>
        </div>
      </header>

      {/* metrics */}
      <section style={styles.metrics}>
        <Metric title="Total users" value={stats?.users_count ?? (loading ? "…" : 0)} />
        <Metric title="Total paths" value={stats?.paths_count ?? (loading ? "…" : 0)} />
        <Metric title="New users (7d)" value={usersSeries.reduce((a,b)=>a+(b.cnt||0),0)} />
        <Metric title="Paths saved (7d)" value={pathsSeries.reduce((a,b)=>a+(b.cnt||0),0)} />
      </section>

      {/* charts + tables */}
      <section style={styles.grid}>
        <Card title="Users (last 7 days)">
          <Bars series={usersSeries} max={maxUsers} color="#22c55e" />
        </Card>

        <Card title="Paths (last 7 days)">
          <Bars series={pathsSeries} max={maxPaths} color="#3b82f6" />
        </Card>

        <Card title="Recent users">
          <Table
            headers={["Name", "Email", "Created"]}
            rows={(stats?.recent_users || []).map(u => [
              [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || "—",
              u.email,
              u.created_at ? new Date(u.created_at).toLocaleString() : "—",
            ])}
            empty="No users yet."
          />
        </Card>

        <Card title="Recent paths">
          <Table
            headers={["Name", "Points", "Created"]}
            rows={(stats?.recent_paths || []).map(p => [
              p.name || "path",
              String(p.points ?? 0),
              p.created_at ? new Date(p.created_at).toLocaleString() : "—",
            ])}
            empty="No paths saved yet."
          />
          <div style={{marginTop:10, display:"flex", gap:10}}>
            <a href="/tasks/path-generator" style={{...styles.btn, background:"transparent", border:"2px solid #fff", color:"#fff", textDecoration:"none"}}>Open Path generator</a>
            <a href="/tasks/position" style={{...styles.btn, background:"transparent", border:"2px solid #fff", color:"#fff", textDecoration:"none"}}>Open Position</a>
          </div>
        </Card>
      </section>
    </main>
  );
}

/* --- small components --- */

function Metric({ title, value }) {
  return (
    <div style={styles.metric}>
      <div style={{opacity:.85, fontSize:13}}>{title}</div>
      <div style={{fontWeight:900, fontSize:22}}>{String(value)}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>{title}</div>
      <div>{children}</div>
    </div>
  );
}

function Bars({ series, max, color }) {
  // series: [{day: '2025-09-27', cnt: 3}, ...]
  return (
    <div style={styles.canvasCard}>
      <div style={styles.barRow}>
        {series.map(d => {
          const h = max ? (d.cnt / max) : 0;
          return (
            <div key={String(d.day)} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:6}}>
              <div style={{height:120, display:"flex", alignItems:"flex-end"}}>
                <div style={{
                  width:22, height: Math.max(4, 120*h),
                  background: color, borderRadius:6
                }}/>
              </div>
              <div style={{fontSize:11, opacity:.8}}>
                {new Date(d.day).toLocaleDateString(undefined,{month:"short", day:"2-digit"})}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Table({ headers, rows, empty }) {
  if (!rows.length) return <div style={styles.empty}>{empty}</div>;
  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {headers.map(h => <th key={h} style={styles.th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => <td key={j} style={styles.td}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* --- styles --- */
const styles = {
  page:{
    position:"relative",
    minHeight:"100dvh",
    fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
    color:"#fff",
  },
  bg:{
    position:"fixed", inset:0, zIndex:-1,
    background:"linear-gradient(180deg,#f59e0b 0%,#ec4899 40%,#3b82f6 100%)",
  },
  header:{
    display:"flex", alignItems:"flex-end", justifyContent:"space-between",
    padding:"16px 16px 8px",
  },
  h1:{ margin:"0 0 4px 0", lineHeight:1 },
  btn:{
    border:0, padding:"8px 12px", borderRadius:10, fontWeight:800, cursor:"pointer"
  },

  metrics:{
    display:"grid",
    gridTemplateColumns:"repeat(4,minmax(160px,1fr))",
    gap:12, padding:"0 12px", marginTop:6
  },
  metric:{
    background:"rgba(255,255,255,.28)", backdropFilter:"blur(4px)",
    padding:"14px", borderRadius:12, boxShadow:"0 10px 30px rgba(15,23,42,.16)"
  },

  grid:{
    display:"grid",
    gridTemplateColumns:"minmax(280px,1fr) minmax(280px,1fr)",
    gap:12, padding:"12px"
  },
  card:{
    background:"rgba(255,255,255,.26)", borderRadius:12, padding:14,
    boxShadow:"0 20px 50px rgba(15,23,42,.18)"
  },
  cardHeader:{ fontWeight:900, marginBottom:8 },

  canvasCard:{
    background:"rgba(255,255,255,.95)", borderRadius:12, padding:10, color:"#0f172a"
  },

  barRow:{
    display:"grid",
    gridTemplateColumns:"repeat(7,1fr)",
    alignItems:"end",
    gap:12,
  },

  tableWrap:{ background:"rgba(255,255,255,.95)", borderRadius:12, padding:10, color:"#0f172a" },
  table:{ width:"100%", borderCollapse:"collapse" },
  th:{ textAlign:"left", fontWeight:800, padding:"8px" },
  td:{ padding:"8px", borderTop:"1px solid #e5e7eb" },

  empty:{
    background:"rgba(255,255,255,.9)", color:"#0f172a",
    borderRadius:10, padding:"12px", opacity:.9
  },
};

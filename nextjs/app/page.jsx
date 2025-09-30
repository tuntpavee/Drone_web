// app/page.jsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Landing() {
  const router = useRouter();

  return (
    <main style={styles.page}>
      {/* Top nav */}
      <header style={styles.nav}>
        <div style={styles.brand}>YIM BOT</div>
        <nav style={styles.navRight}>
          <a href="#features" style={styles.link}>Features</a>
          <a href="#how" style={styles.link}>How it works</a>
          <a href="#faq" style={styles.link}>FAQ</a>
          <Link href="/login" style={styles.link}>Log in</Link>
          <button onClick={() => router.push("/register")} style={styles.ctaSm}>
            Get started
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.badge}>Lobby</div>

          <div style={styles.heroCard}>
            <div style={styles.heroImageWrap}>
              <Image
                src="/yim-logo.png"  // put your logo in nextjs/public/yim-logo.png
                alt="YIM BOT logo"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            <div style={styles.heroText}>
              <h1 style={styles.title}>YIM BOT</h1>
              <p style={styles.subtitle}>
                Autonomous drone assistant that monitors, maps, and responds — safely and in real time.
              </p>
              <div style={styles.heroButtons}>
                <button onClick={() => router.push("/register")} style={styles.cta}>
                  Create account
                </button>
                <button onClick={() => router.push("/login")} style={styles.secondary}>
                  Log in
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.section}>
        <h2 style={styles.h2}>Why YIM BOT</h2>
        <div style={styles.grid3}>
          <Feature title="Auto-charge & cooldown" text="Smart dock cycles charge and cooling with safety interlocks and logs." />
          <Feature title="Precision landing" text="Marker-based landing with visual-inertial odometry and fallback beacons." />
          <Feature title="Live telemetry" text="FastAPI backend streams health, position, battery and alerts to your dashboard." />
          <Feature title="Map & count" text="SLAM + detection to create semantic maps and population estimates." />
          <Feature title="Open APIs" text="Simple REST endpoints for missions, waypoints, and event webhooks." />
          <Feature title="Secure accounts" text="Accounts stored with salted hashes and audit timestamps in PostgreSQL." />
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={styles.section}>
        <h2 style={styles.h2}>How it works</h2>
        <ol style={styles.steps}>
          <li><b>Connect</b> your drone and dock to the YIM BOT FastAPI server.</li>
          <li><b>Plan</b> missions in the web app and set alert triggers.</li>
          <li><b>Launch</b> autonomous routines; monitor telemetry live.</li>
          <li><b>Return</b> to dock for auto-charge and cooldown cycles.</li>
        </ol>
      </section>

      {/* CTA band */}
      <section style={styles.ctaBand}>
        <h3 style={{ margin: 0 }}>Ready to deploy your first mission?</h3>
        <button onClick={() => router.push("/register")} style={styles.ctaDark}>
          Get started
        </button>
      </section>

      {/* FAQ */}
      <section id="faq" style={styles.section}>
        <h2 style={styles.h2}>FAQ</h2>
        <details style={styles.qa}><summary>What hardware do I need?</summary>
          Works with PX4-based drones, a supported dock, and a small server (or your laptop) running Docker.
        </details>
        <details style={styles.qa}><summary>Can I bring my own models?</summary>
          Yes. Plug in your own detection models; the API exposes frames and events.
        </details>
        <details style={styles.qa}><summary>Do you support offline?</summary>
          Mission logic runs locally; syncs when the link is available.
        </details>
      </section>

      <footer style={styles.footer}>
        <span>© {new Date().getFullYear()} YIM BOT</span>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="/privacy" style={styles.link}>Privacy</a>
          <a href="/terms" style={styles.link}>Terms</a>
          <a href="/contact" style={styles.link}>Contact</a>
        </div>
      </footer>
    </main>
  );
}

function Feature({ title, text }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardText}>{text}</p>
    </div>
  );
}

const styles = {
  page: { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#0f172a" },
  nav: {
    height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 20px", position: "sticky", top: 0, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", zIndex: 50
  },
  brand: { fontWeight: 800, letterSpacing: 0.5 },
  navRight: { display: "flex", alignItems: "center", gap: 16 },
  link: { textDecoration: "none", color: "#0f172a", opacity: 0.85 },
  ctaSm: { border: 0, padding: "10px 14px", borderRadius: 10, background: "#22c55e", color: "#fff", fontWeight: 700, cursor: "pointer" },

  hero: { background: "linear-gradient(180deg,#f59e0b 0%,#ec4899 40%,#3b82f6 100%)", padding: "60px 20px" },
  heroInner: { maxWidth: 1100, margin: "0 auto" },
  badge: { color: "#fff", opacity: 0.8, fontWeight: 600, marginBottom: 12 },
  heroCard: { background: "rgba(255,255,255,0.9)", borderRadius: 20, padding: 24, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "center" },
  heroImageWrap: { position: "relative", width: "100%", height: 260, borderRadius: 16, overflow: "hidden" },
  heroText: {},
  title: { fontSize: 56, lineHeight: 1.05, margin: "0 0 8px" },
  subtitle: { margin: 0, opacity: 0.85, fontSize: 18 },
  heroButtons: { display: "flex", gap: 12, marginTop: 18 },
  cta: { border: 0, padding: "14px 18px", borderRadius: 12, background: "#22c55e", color: "#fff", fontWeight: 800, cursor: "pointer" },
  secondary: { border: "2px solid #0f172a", padding: "12px 16px", borderRadius: 12, background: "transparent", fontWeight: 700, cursor: "pointer" },

  section: { maxWidth: 1100, margin: "56px auto", padding: "0 20px" },
  h2: { fontSize: 32, marginBottom: 18 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 },
  card: { background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" },
  cardTitle: { margin: "0 0 6px", fontSize: 18 },
  cardText: { margin: 0, opacity: 0.8 },

  steps: { margin: "10px 0 0 20px", lineHeight: 1.7 },

  ctaBand: {
    margin: "56px 0", padding: "28px 20px", background: "#0f172a", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, borderRadius: 16,
    boxShadow: "0 12px 40px rgba(15,23,42,0.25)", width: "calc(100% - 40px)", marginInline: "auto"
  },
  ctaDark: { border: 0, padding: "12px 16px", borderRadius: 12, background: "#22c55e", color: "#fff", fontWeight: 800, cursor: "pointer" },

  footer: { maxWidth: 1100, margin: "40px auto 24px", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.8 },
};

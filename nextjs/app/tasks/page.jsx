"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Tasks() {
  const router = useRouter();
  const scrollerRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("yim_user") || "null");
      if (!u) router.replace("/login");
      else setUser(u);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("yim_user");
    router.replace("/login");
  };

  // Wheel → horizontal
  const onWheel = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  // Drag to scroll (desktop-friendly)
  const drag = useRef({ down: false, startX: 0, startLeft: 0 });
  const onDown = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = {
      down: true,
      startX: e.pageX || e.touches?.[0]?.pageX || 0,
      startLeft: el.scrollLeft,
    };
  };
  const onMove = (e) => {
    const el = scrollerRef.current;
    if (!el || !drag.current.down) return;
    const x = e.pageX || e.touches?.[0]?.pageX || 0;
    el.scrollLeft = drag.current.startLeft - (x - drag.current.startX);
  };
  const onUp = () => (drag.current.down = false);

  const scrollBy = (dx) =>
    scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  const cards = [
    { title: "Path generator", href: "/tasks/path-generator", emoji: "🛣️" },
    { title: "Position", href: "/tasks/position", emoji: "📍" },
    { title: "Visualization", href: "/tasks/visualization", emoji: "🗺️" },
    { title: "Remote command", href: "/tasks/remote-command", emoji: "🛰️" },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.bg} aria-hidden />

      <header style={styles.header}>
        <div style={styles.brand}>Task Selection</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user && <span style={{ opacity: 0.9, color: "#fff" }}>{user.email}</span>}
          <button onClick={logout} style={styles.logout}>Log out</button>
        </div>
      </header>

      <section style={styles.content}>
        <div style={styles.rowWrap}>
          <button aria-label="prev" onClick={() => scrollBy(-400)} style={styles.arrow}>
            ◀
          </button>

          <div
            ref={scrollerRef}
            className="hideScroll"
            style={styles.scroller}
            onWheel={onWheel}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseLeave={onUp}
            onMouseUp={onUp}
            onTouchStart={onDown}
            onTouchMove={onMove}
            onTouchEnd={onUp}
          >
            {cards.map((c) => (
              <Link key={c.title} href={c.href} style={styles.card}>
                <div style={styles.cardInner}>
                  <div style={styles.cardEmoji}>{c.emoji}</div>
                  <div style={styles.cardTitle}>{c.title}</div>
                </div>
              </Link>
            ))}
          </div>

          <button aria-label="next" onClick={() => scrollBy(400)} style={styles.arrow}>
            ▶
          </button>
        </div>
      </section>

      <style jsx global>{`
        .hideScroll::-webkit-scrollbar { display: none; }
        html, body { margin: 0; height: 100%; }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100dvh",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    color: "#0f172a",
    overflowX: "hidden",
  },
  bg: {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    background: "linear-gradient(180deg,#f59e0b 0%,#ec4899 40%,#3b82f6 100%)",
  },
  header: {
    height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 16px", color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.25)",
  },
  brand: { fontWeight: 800, fontSize: 22, letterSpacing: .3 },
  logout: {
    border: 0, padding: "8px 12px", borderRadius: 10, background: "#ef4444",
    color: "#fff", fontWeight: 700, cursor: "pointer"
  },
  content: { padding: "16px 12px 28px" },

  rowWrap: {
    display: "grid",
    gridTemplateColumns: "40px 1fr 40px",
    alignItems: "center",
    gap: 8,
  },
  arrow: {
    border: 0, background: "rgba(255,255,255,0.5)", backdropFilter: "blur(6px)",
    width: 40, height: 40, borderRadius: 10, cursor: "pointer", fontSize: 16,
    boxShadow: "0 8px 20px rgba(15,23,42,0.15)"
  },

  scroller: {
    display: "flex",
    gap: 24,
    overflowX: "auto",
    padding: "8px 8px 24px",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
  },

  // key: width always big enough to overflow, but capped
  card: {
    flex: "0 0 clamp(260px, 60vw, 420px)",
    height: "min(60vh, 360px)",
    borderRadius: 18,
    textDecoration: "none",
    color: "inherit",
    background: "rgba(255,255,255,0.35)",
    backdropFilter: "blur(6px)",
    scrollSnapAlign: "start",
    boxShadow: "0 20px 50px rgba(15,23,42,0.18)",
    transition: "transform .15s ease",
  },
  cardInner: {
    height: "100%",
    borderRadius: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 18,
    background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0.10) 100%)",
  },
  cardEmoji: { fontSize: 48, marginTop: 24, alignSelf: "center", opacity: .95, marginBottom: "auto" },
  cardTitle: { fontWeight: 800, color: "rgba(15,23,42,.95)", paddingTop: 8 },
};

export default function RemoteCommand() {
  return (
    <main style={s.page}>
      <h1 style={s.h1}>Remote command</h1>
      <p>Send commands and manage missions.</p>
      <a href="/tasks" style={s.link}>← Back to tasks</a>
    </main>
  );
}
const s = { page:{padding:24}, h1:{margin:"0 0 8px"}, link:{color:"#2563eb",textDecoration:"none",fontWeight:700} };


import { useState, useRef } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────
const C = {
  brand:    "#FF6B4A",
  brandDk:  "#D93A18",
  brandLt:  "#FFF1EE",
  teal:     "#1FA8A5",
  tealLt:   "#EDFAFA",
  base:     "#FAFAF9",
  raised:   "#FFFFFF",
  overlay:  "#F5F4F2",
  n900:     "#1C1917",
  n800:     "#292524",
  n700:     "#44403C",
  n600:     "#57534E",
  n500:     "#78746C",
  n400:     "#A8A49C",
  n300:     "#D1CEC8",
  n200:     "#E8E6E1",
  n100:     "#F5F4F2",
  green:    "#16A34A",
  greenLt:  "#DCFCE7",
  amber:    "#D97706",
  amberLt:  "#FEF3C7",
  red:      "#DC2626",
  redLt:    "#FEE2E2",
  blue:     "#2563EB",
  blueLt:   "#EFF6FF",
};

// ─── SCREENS ──────────────────────────────────────────────────
const SCREENS = [
  { id: "dashboard",    label: "Dashboard",          icon: "⚡" },
  { id: "planner",     label: "Event Planner",       icon: "📋" },
  { id: "reg-online",  label: "Online Registration", icon: "🌐" },
  { id: "reg-onsite",  label: "On-site Registration",icon: "📲" },
  { id: "checkin",     label: "Check-in / Scanner",  icon: "✅" },
  { id: "seating",     label: "Seating & Tables",    icon: "🪑" },
  { id: "guests",      label: "Guest Management",    icon: "👥" },
  { id: "staff",       label: "Staff & Roles",       icon: "🎽" },
  { id: "analytics",   label: "Live Analytics",      icon: "📊" },
  { id: "comms",       label: "Announcements",        icon: "📣" },
  { id: "qr",         label: "QR Generator",         icon: "⬛" },
  { id: "program",    label: "Program / Rundown",    icon: "🎬" },
  { id: "vendor",     label: "Vendors & Suppliers",  icon: "🤝" },
  { id: "catering",   label: "Catering & Menu",      icon: "🍽️" },
  { id: "feedback",   label: "Feedback & Surveys",   icon: "⭐" },
  { id: "payment",    label: "Payments & Finance",   icon: "💰" },
  { id: "incidents",  label: "Incident Log",         icon: "🚨" },
  { id: "waitlist",   label: "Waitlist & Capacity",  icon: "⏳" },
  { id: "events",     label: "My Events",            icon: "📅" },
];

export default function Wireframe() {
  const [active, setActive] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const screen = SCREENS.find(s => s.id === active);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: C.base, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Top Bar ── */}
      <div style={{ background: C.n900, padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, borderBottom: `1px solid ${C.n800}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setMenuOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: 9999, background: menuOpen ? C.brand : C.n800, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, transition: "background 150ms" }}>☰</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9999, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>E</div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>EventPH</span>
            <span style={{ color: C.n500, fontSize: 12 }}>· Santos Reunion 2026</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Pill color="green" label="● LIVE" />
          <div style={{ width: 32, height: 32, borderRadius: 9999, background: C.n800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔔</div>
          <div style={{ width: 32, height: 32, borderRadius: 9999, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>L</div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, position: "relative" }}>

        {/* ── Sidebar ── */}
        <div style={{
          width: menuOpen ? 240 : 0,
          minWidth: menuOpen ? 240 : 0,
          background: C.n900,
          overflow: "hidden",
          transition: "width 280ms cubic-bezier(0.4,0,0.2,1), min-width 280ms cubic-bezier(0.4,0,0.2,1)",
          borderRight: `1px solid ${C.n800}`,
          display: "flex", flexDirection: "column",
          position: "sticky", top: 52, height: "calc(100vh - 52px)",
        }}>
          <div style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
            <p style={{ color: C.n500, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 8px", marginBottom: 4 }}>On-Site Tools</p>
            {SCREENS.map(s => (
              <button key={s.id} onClick={() => { setActive(s.id); setMenuOpen(false); }} style={{
                width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                background: active === s.id ? C.brand : "transparent",
                color: active === s.id ? "#fff" : C.n400,
                textAlign: "left", fontFamily: "inherit", fontWeight: 600, fontSize: 13,
                display: "flex", alignItems: "center", gap: 10, marginBottom: 2,
                transition: "all 150ms",
              }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          <div style={{ padding: "12px 10px", borderTop: `1px solid ${C.n800}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9999, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>L</div>
              <div>
                <p style={{ margin: 0, color: "#fff", fontSize: 12, fontWeight: 700 }}>Lito Lagbas</p>
                <p style={{ margin: 0, color: C.n500, fontSize: 11 }}>Organizer</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", maxWidth: 960, width: "100%" }}>

          {/* Screen label */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                {SCREENS.map(s => (
                  <button key={s.id} onClick={() => setActive(s.id)} style={{
                    padding: "5px 12px", borderRadius: 9999, border: "none", cursor: "pointer",
                    background: active === s.id ? C.brand : C.n100,
                    color: active === s.id ? "#fff" : C.n600,
                    fontWeight: 700, fontSize: 11, fontFamily: "inherit",
                    transition: "all 150ms", whiteSpace: "nowrap",
                  }}>{s.icon} {s.label}</button>
                ))}
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.n900, letterSpacing: "-0.02em" }}>
                {screen.icon} {screen.label}
              </h1>
            </div>
          </div>

          {/* Screen Renderer */}
          {active === "dashboard"   && <Dashboard setActive={setActive} />}
          {active === "planner"     && <EventPlanner />}
          {active === "reg-online"  && <OnlineRegistration />}
          {active === "reg-onsite"  && <OnsiteRegistration />}
          {active === "checkin"     && <CheckIn />}
          {active === "seating"     && <SeatingTable />}
          {active === "guests"      && <GuestManagement />}
          {active === "staff"       && <StaffRoles />}
          {active === "analytics"   && <Analytics />}
          {active === "comms"       && <Announcements />}
          {active === "qr"          && <QRGenerator />}
          {active === "program"     && <ProgramRundown />}
          {active === "vendor"      && <VendorSuppliers />}
          {active === "catering"    && <CateringMenu />}
          {active === "feedback"    && <FeedbackSurveys />}
          {active === "payment"     && <PaymentsFinance />}
          {active === "incidents"   && <IncidentLog />}
          {active === "waitlist"    && <WaitlistCapacity />}
          {active === "events"      && <MyEvents setActive={setActive} />}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 1 — Dashboard
// ──────────────────────────────────────────────────────────────
function Dashboard({ setActive }) {
  return (
    <div>
      {/* Event header card */}
      <div style={{ background: `linear-gradient(135deg, ${C.n900} 0%, #3D0A00 100%)`, borderRadius: 16, padding: "20px 20px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: 9999, background: C.brand, opacity: 0.15 }} />
        <Pill color="brand" label="● LIVE NOW" />
        <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: "8px 0 4px", letterSpacing: "-0.02em" }}>Santos Family Reunion 2026</h2>
        <p style={{ color: C.n400, fontSize: 13, margin: "0 0 14px" }}>📍 SMX Davao Convention Center · June 15, 2026 · 6:00 PM</p>
        <div style={{ display: "flex", gap: 10 }}>
          <StatChip icon="👥" value="234" label="Registered" />
          <StatChip icon="✅" value="178" label="Checked In" />
          <StatChip icon="⏳" value="56" label="Pending" />
          <StatChip icon="🪑" value="12" label="Tables" />
        </div>
      </div>

      {/* Quick Actions */}
      <p style={{ fontSize: 11, fontWeight: 700, color: C.n500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Quick Actions</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { icon: "📲", label: "Check-in\nScanner",   screen: "checkin",  color: C.brand },
          { icon: "📝", label: "Walk-in\nReg",         screen: "reg-onsite", color: C.teal },
          { icon: "🪑", label: "Seating\nMap",         screen: "seating",  color: "#8B5CF6" },
          { icon: "📊", label: "Live\nAnalytics",      screen: "analytics", color: C.amber },
        ].map(a => (
          <button key={a.screen} onClick={() => setActive(a.screen)} style={{ background: a.color + "15", border: `1.5px solid ${a.color}33`, borderRadius: 14, padding: "14px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: "inherit", transition: "all 150ms" }}>
            <span style={{ fontSize: 24 }}>{a.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: a.color, whiteSpace: "pre", textAlign: "center", lineHeight: 1.3 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Attendance Progress */}
      <Card title="Attendance Progress" mb={16}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: C.n600 }}>178 of 234 checked in</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.brand }}>76%</span>
        </div>
        <ProgressBar value={76} color={C.brand} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
          <MiniStat label="VIP" value="42/45" color="#8B5CF6" pct={93} />
          <MiniStat label="General" value="121/168" color={C.teal} pct={72} />
          <MiniStat label="Staff" value="15/21" color={C.amber} pct={71} />
        </div>
      </Card>

      {/* Live Feed */}
      <Card title="Live Activity Feed" mb={16}>
        {[
          { time: "6:42 PM", msg: "Maria Santos checked in", type: "checkin" },
          { time: "6:41 PM", msg: "Walk-in: Juan dela Cruz registered (Table 4)", type: "walkin" },
          { time: "6:40 PM", msg: "VIP guest Ana Reyes arrived", type: "vip" },
          { time: "6:39 PM", msg: "Table 7 reassigned — 2 guests moved", type: "seating" },
          { time: "6:38 PM", msg: "Payment received: ₱500 (cash, Gate 2)", type: "payment" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: i < 4 ? `1px solid ${C.n200}` : "none", alignItems: "center" }}>
            <span style={{ fontSize: 16 }}>{feedIcon(f.type)}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, color: C.n800, fontWeight: 500 }}>{f.msg}</p>
            </div>
            <span style={{ fontSize: 11, color: C.n400, whiteSpace: "nowrap" }}>{f.time}</span>
          </div>
        ))}
      </Card>

      {/* Staff Status */}
      <Card title="On-Duty Staff">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[["Pedro G.", "Gate 1", "green"],["Lyn R.", "Gate 2", "green"],["Mike T.", "Reception", "green"],["Ana C.", "Seating", "amber"],["Joe M.", "Roving", "green"]].map(([name, role, status]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, background: C.n100, borderRadius: 9999, padding: "6px 12px 6px 8px" }}>
              <div style={{ width: 8, height: 8, borderRadius: 9999, background: status === "green" ? C.green : C.amber }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.n800 }}>{name}</span>
              <span style={{ fontSize: 11, color: C.n500 }}>· {role}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 2 — Event Planner
// ──────────────────────────────────────────────────────────────
function EventPlanner() {
  const tasks = [
    { phase: "Pre-Event", items: [
      { done: true,  label: "Create event & set ticket types" },
      { done: true,  label: "Set up online registration page" },
      { done: true,  label: "Send invitations via SMS/email" },
      { done: true,  label: "Configure seating floor plan" },
      { done: false, label: "Print guest name badges" },
      { done: false, label: "Brief event staff on roles" },
    ]},
    { phase: "Event Day — Setup", items: [
      { done: false, label: "Open gate check-in stations" },
      { done: false, label: "Test QR scanner on all devices" },
      { done: false, label: "Activate walk-in registration kiosk" },
      { done: false, label: "Confirm table assignments" },
    ]},
    { phase: "Event Day — Live", items: [
      { done: false, label: "Monitor live attendance dashboard" },
      { done: false, label: "Handle walk-in registrations" },
      { done: false, label: "Manage seating conflicts" },
      { done: false, label: "Send real-time announcements" },
    ]},
    { phase: "Post-Event", items: [
      { done: false, label: "Export attendance report" },
      { done: false, label: "Sync offline check-ins to cloud" },
      { done: false, label: "Send post-event feedback survey" },
    ]},
  ];

  return (
    <div>
      {/* Event Info */}
      <Card title="Event Details" mb={16}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            ["Event Name", "Santos Family Reunion 2026"],
            ["Date & Time", "June 15, 2026 · 5:00 PM – 11:00 PM"],
            ["Venue", "SMX Davao Convention Center, Hall B"],
            ["Expected Guests", "250 pax"],
            ["Ticket Types", "VIP (₱500) · General (₱250) · Staff (Free)"],
            ["Event Manager", "Lito Lagbas · +63 912 345 6789"],
          ].map(([label, value]) => (
            <div key={label}>
              <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 700, color: C.n400, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, color: C.n800, fontWeight: 500 }}>{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Timeline Checklist */}
      {tasks.map((phase, pi) => (
        <Card key={pi} title={phase.phase} mb={12}>
          {phase.items.map((item, ii) => (
            <div key={ii} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: ii < phase.items.length - 1 ? `1px solid ${C.n200}` : "none" }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${item.done ? C.green : C.n300}`, background: item.done ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {item.done && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: item.done ? C.n400 : C.n800, textDecoration: item.done ? "line-through" : "none", fontWeight: item.done ? 400 : 500 }}>{item.label}</span>
              {!item.done && <span style={{ marginLeft: "auto", fontSize: 11, color: C.n400, background: C.n100, borderRadius: 9999, padding: "2px 8px" }}>Todo</span>}
            </div>
          ))}
        </Card>
      ))}

      {/* Budget Tracker */}
      <Card title="Budget Tracker" mb={0}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
          <BudgetStat label="Total Budget" value="₱85,000" color={C.brand} />
          <BudgetStat label="Spent" value="₱62,400" color={C.amber} />
          <BudgetStat label="Remaining" value="₱22,600" color={C.green} />
        </div>
        {[
          ["Venue", 25000, 25000],
          ["Catering", 30000, 22000],
          ["AV/Sound", 12000, 8500],
          ["Decorations", 8000, 4900],
          ["Printing", 5000, 2000],
          ["Miscellaneous", 5000, 0],
        ].map(([cat, budget, spent]) => (
          <div key={cat} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 12, color: C.n700, fontWeight: 600 }}>{cat}</span>
              <span style={{ fontSize: 12, color: C.n500 }}>₱{spent.toLocaleString()} / ₱{budget.toLocaleString()}</span>
            </div>
            <ProgressBar value={Math.round(spent / budget * 100)} color={spent / budget > 0.9 ? C.red : C.teal} height={6} />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 3 — Online Registration
// ──────────────────────────────────────────────────────────────
function OnlineRegistration() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <StatCard icon="🌐" label="Online Registrations" value="189" sub="+12 today" color={C.teal} />
        <StatCard icon="💳" label="Revenue Collected" value="₱48,250" sub="Via GCash/Maya" color={C.brand} />
      </div>

      {/* Registration Form Preview */}
      <Card title="Registration Form Builder" mb={16}>
        <p style={{ fontSize: 12, color: C.n500, marginBottom: 12 }}>These fields appear on your public registration page at <span style={{ color: C.brand, fontWeight: 700 }}>eventph.app/santos-reunion</span></p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Full Name",    type: "text",   required: true,  locked: true  },
            { label: "Phone Number", type: "phone",  required: true,  locked: true  },
            { label: "Email",        type: "email",  required: false, locked: false },
            { label: "Ticket Type",  type: "select", required: true,  locked: false },
            { label: "Meal Choice",  type: "select", required: false, locked: false },
            { label: "Table Preference", type: "text", required: false, locked: false },
          ].map((field, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: C.n100, borderRadius: 10, padding: "10px 12px" }}>
              <span style={{ fontSize: 14 }}>⠿</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.n800 }}>{field.label}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.n400 }}>{field.type} field</p>
              </div>
              {field.required && <Pill color="brand" label="Required" />}
              {field.locked ? <span style={{ fontSize: 14, color: C.n400 }}>🔒</span> : <span style={{ fontSize: 14, color: C.n400 }}>✏️</span>}
            </div>
          ))}
        </div>
        <button style={btnOutline}>+ Add Custom Field</button>
      </Card>

      {/* Ticket Types */}
      <Card title="Ticket Types & Pricing" mb={16}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { type: "VIP", price: "₱500", sold: 42, total: 50, color: "#8B5CF6" },
            { type: "General Admission", price: "₱250", sold: 121, total: 180, color: C.teal },
            { type: "Staff / Crew", price: "Free", sold: 15, total: 25, color: C.amber },
          ].map(t => (
            <div key={t.type} style={{ border: `1.5px solid ${C.n200}`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 9999, background: t.color }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.n900 }}>{t.type}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: t.color }}>{t.price}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.n500 }}>{t.sold} sold of {t.total}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: t.color }}>{Math.round(t.sold / t.total * 100)}%</span>
              </div>
              <ProgressBar value={Math.round(t.sold / t.total * 100)} color={t.color} height={6} />
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Gateway */}
      <Card title="Payment Methods" mb={0}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[["GCash","✅ Active"],["Maya","✅ Active"],["Credit Card","✅ Active"],["Cash (On-site)","✅ Active"],["Bank Transfer","❌ Disabled"]].map(([method, status]) => (
            <div key={method} style={{ display: "flex", alignItems: "center", gap: 6, background: C.n100, borderRadius: 9999, padding: "6px 12px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.n800 }}>{method}</span>
              <span style={{ fontSize: 11, color: status.includes("✅") ? C.green : C.n400 }}>{status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 4 — On-site Registration
// ──────────────────────────────────────────────────────────────
function OnsiteRegistration() {
  const [step, setStep] = useState(1);

  return (
    <div>
      {/* Walk-in Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        <StatCard icon="🚶" label="Walk-ins Today" value="27" color={C.brand} />
        <StatCard icon="💵" label="Cash Collected" value="₱6,750" color={C.green} />
        <StatCard icon="⏱️" label="Avg Reg. Time" value="45s" color={C.teal} />
      </div>

      {/* Registration Steps */}
      <Card title="Walk-in Registration Form" mb={16}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
          {["Guest Info", "Ticket", "Payment", "Badge"].map((s, i) => (
            <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              {i < 3 && <div style={{ position: "absolute", top: 14, left: "50%", right: "-50%", height: 2, background: i < step - 1 ? C.brand : C.n200, zIndex: 0 }} />}
              <div style={{ width: 28, height: 28, borderRadius: 9999, border: `2px solid ${i < step ? C.brand : C.n300}`, background: i < step ? C.brand : "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, marginBottom: 4 }}>
                {i < step - 1 ? <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>✓</span> : <span style={{ fontSize: 11, fontWeight: 800, color: i < step ? "#fff" : C.n400 }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: i < step ? C.brand : C.n400, textAlign: "center" }}>{s}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FormField label="Full Name *" placeholder="e.g. Maria Santos" />
            <FormField label="Phone Number *" placeholder="+63 9XX XXX XXXX" type="tel" />
            <FormField label="Email (optional)" placeholder="maria@email.com" type="email" />
            <button onClick={() => setStep(2)} style={btnPrimary}>Next: Choose Ticket →</button>
          </div>
        )}
        {step === 2 && (
          <div>
            <p style={{ fontSize: 13, color: C.n600, marginBottom: 12 }}>Select ticket type:</p>
            {[["VIP", "₱500", "#8B5CF6"],["General", "₱250", C.teal],["Staff", "Free", C.amber]].map(([t, p, c]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${C.n200}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}>
                <div style={{ width: 18, height: 18, borderRadius: 9999, border: `2px solid ${c}` }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.n800 }}>{t}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: c }}>{p}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={() => setStep(1)} style={btnGhost}>← Back</button>
              <button onClick={() => setStep(3)} style={{ ...btnPrimary, flex: 1 }}>Next: Payment →</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <p style={{ fontSize: 13, color: C.n600, marginBottom: 12 }}>Accept payment:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {[["💵", "Cash", "₱250 received"],["📱", "GCash QR", "Show QR to guest"],["💳", "Card", "Tap or swipe"]].map(([icon, method, desc]) => (
                <div key={method} style={{ display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${C.n200}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer" }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.n800 }}>{method}</p>
                    <p style={{ margin: 0, fontSize: 12, color: C.n500 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)} style={btnGhost}>← Back</button>
              <button onClick={() => setStep(4)} style={{ ...btnPrimary, flex: 1 }}>Confirm Payment →</button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: 9999, background: C.greenLt, border: `3px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.green, margin: "0 0 4px" }}>Registered!</h3>
            <p style={{ color: C.n600, fontSize: 13, margin: "0 0 16px" }}>Maria Santos · General · Table 4</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={btnOutline}>🖨 Print Badge</button>
              <button style={btnOutline}>📱 Send QR via SMS</button>
              <button onClick={() => setStep(1)} style={btnPrimary}>+ Next Guest</button>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Walk-ins */}
      <Card title="Recent Walk-ins">
        {[
          { name: "Carlos Reyes",   ticket: "General", time: "6:41 PM", table: 4, paid: "Cash" },
          { name: "Sheila Lim",     ticket: "VIP",     time: "6:38 PM", table: 1, paid: "GCash" },
          { name: "Ramon Aquino",   ticket: "General", time: "6:35 PM", table: 7, paid: "Cash" },
        ].map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 2 ? `1px solid ${C.n200}` : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9999, background: C.tealLt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: C.teal, flexShrink: 0 }}>{g.name.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.n800 }}>{g.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: C.n500 }}>Table {g.table} · {g.paid} · {g.time}</p>
            </div>
            <Pill color={g.ticket === "VIP" ? "purple" : "teal"} label={g.ticket} />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 5 — Check-in Scanner
// ──────────────────────────────────────────────────────────────
function CheckIn() {
  const [lastScan, setLastScan] = useState(null);
  const scans = [
    { name: "Ana Reyes",    status: "success", ticket: "VIP",     time: "6:43 PM" },
    { name: "Bob Cruz",     status: "success", ticket: "General", time: "6:42 PM" },
    { name: "Unknown QR",   status: "error",   ticket: "—",       time: "6:41 PM" },
    { name: "Maria Santos", status: "warning", ticket: "General", time: "6:40 PM", note: "Already checked in" },
  ];

  return (
    <div>
      {/* Scanner Viewfinder */}
      <Card title="QR Code Scanner" mb={16}>
        <div style={{ background: C.n900, borderRadius: 14, height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", marginBottom: 12 }}>
          {/* Camera feed placeholder */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", opacity: 0.95 }} />
          {/* Scan frame */}
          <div style={{ position: "relative", width: 140, height: 140, zIndex: 1 }}>
            {/* Corner brackets */}
            {[["top-0 left-0","border-t-2 border-l-2"],["top-0 right-0","border-t-2 border-r-2"],["bottom-0 left-0","border-b-2 border-l-2"],["bottom-0 right-0","border-b-2 border-r-2"]].map(([pos, border], i) => (
              <div key={i} style={{ position: "absolute", width: 24, height: 24, borderColor: C.brand, borderWidth: 3, borderStyle: "solid", ...(pos.includes("top") ? { top: 0 } : { bottom: 0 }), ...(pos.includes("left") ? { left: 0, borderRight: "none", borderBottom: "none" } : { right: 0, borderLeft: "none", borderBottom: pos.includes("top") ? "none" : undefined, borderTop: pos.includes("bottom") ? "none" : undefined }), borderRadius: pos.includes("top-0 left-0") ? "4px 0 0 0" : pos.includes("top-0 right-0") ? "0 4px 0 0" : pos.includes("bottom-0 left-0") ? "0 0 0 4px" : "0 0 4px 0" }} />
            ))}
            {/* Scan line */}
            <div style={{ position: "absolute", top: "40%", left: 4, right: 4, height: 2, background: `linear-gradient(90deg, transparent, ${C.brand}, transparent)`, animation: "scan 1.5s ease-in-out infinite" }} />
            <div style={{ width: 48, height: 48, background: C.n800, borderRadius: 8, position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📷</div>
          </div>
          <p style={{ color: C.n400, fontSize: 12, marginTop: 12, zIndex: 1, position: "relative" }}>Point at guest QR code</p>
        </div>

        {/* Manual search */}
        <div style={{ display: "flex", gap: 8 }}>
          <input style={{ flex: 1, height: 40, borderRadius: 9999, border: `1.5px solid ${C.n200}`, background: C.n100, padding: "0 16px", fontSize: 13, color: C.n800, fontFamily: "inherit" }} placeholder="Search by name or ticket ID..." />
          <button style={{ ...btnPrimary, height: 40, padding: "0 16px", fontSize: 13 }}>Search</button>
        </div>
      </Card>

      {/* Last Scan Result */}
      <Card title="Last Scan" mb={16}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 0" }}>
          <div style={{ width: 48, height: 48, borderRadius: 9999, background: C.greenLt, border: `3px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✅</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.green }}>CHECK-IN SUCCESS</p>
            <p style={{ margin: 0, fontSize: 14, color: C.n800, fontWeight: 600 }}>Ana Reyes · VIP · Table 1</p>
            <p style={{ margin: 0, fontSize: 12, color: C.n500 }}>6:43 PM · Scanned at Gate 1</p>
          </div>
        </div>
      </Card>

      {/* Scan Log */}
      <Card title="Scan Log">
        {scans.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < scans.length - 1 ? `1px solid ${C.n200}` : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9999, background: s.status === "success" ? C.greenLt : s.status === "error" ? C.redLt : C.amberLt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
              {s.status === "success" ? "✅" : s.status === "error" ? "❌" : "⚠️"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.n800 }}>{s.name}</p>
              {s.note && <p style={{ margin: 0, fontSize: 11, color: C.amber }}>{s.note}</p>}
            </div>
            <div style={{ textAlign: "right" }}>
              <Pill color={s.ticket === "VIP" ? "purple" : s.ticket === "General" ? "teal" : "neutral"} label={s.ticket} />
              <p style={{ margin: "3px 0 0", fontSize: 11, color: C.n400 }}>{s.time}</p>
            </div>
          </div>
        ))}
      </Card>

      <style>{`@keyframes scan { 0%,100%{top:10%} 50%{top:80%} }`}</style>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 6 — Seating & Table Management
// ──────────────────────────────────────────────────────────────
function SeatingTable() {
  const [selectedTable, setSelectedTable] = useState(null);
  const tables = [
    { id: 1, label: "T1", x: 40,  y: 80,  cap: 10, guests: 10, type: "VIP"     },
    { id: 2, label: "T2", x: 155, y: 80,  cap: 10, guests: 8,  type: "VIP"     },
    { id: 3, label: "T3", x: 270, y: 80,  cap: 10, guests: 6,  type: "General" },
    { id: 4, label: "T4", x: 40,  y: 190, cap: 10, guests: 10, type: "General" },
    { id: 5, label: "T5", x: 155, y: 190, cap: 10, guests: 4,  type: "General" },
    { id: 6, label: "T6", x: 270, y: 190, cap: 10, guests: 9,  type: "General" },
    { id: 7, label: "T7", x: 40,  y: 300, cap: 8,  guests: 7,  type: "Family"  },
    { id: 8, label: "T8", x: 155, y: 300, cap: 8,  guests: 5,  type: "Family"  },
    { id: 9, label: "T9", x: 270, y: 300, cap: 8,  guests: 8,  type: "Family"  },
  ];

  const sel = tables.find(t => t.id === selectedTable);

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
        <StatCard icon="🪑" label="Tables" value="12" color={C.brand} small />
        <StatCard icon="✅" label="Full"   value="4"  color={C.green} small />
        <StatCard icon="🔶" label="Partial" value="6" color={C.amber} small />
        <StatCard icon="⬜" label="Empty"  value="2"  color={C.n400} small />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
        {/* Floor plan */}
        <Card title="Floor Plan — Drag to Rearrange">
          {/* Legend */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            {[["Full","#DC2626"],["Partial","#D97706"],["Available","#16A34A"],["VIP","#8B5CF6"]].map(([l, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 9999, background: c }} />
                <span style={{ fontSize: 11, color: C.n600, fontWeight: 600 }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Canvas */}
          <div style={{ position: "relative", height: 400, background: "#F8F7F5", borderRadius: 12, border: `1.5px dashed ${C.n300}`, overflow: "hidden" }}>
            {/* Grid */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              {Array.from({length:7}).map((_,i)=><line key={`v${i}`} x1={i*55} y1={0} x2={i*55} y2={400} stroke={C.n200} strokeWidth={1}/>)}
              {Array.from({length:8}).map((_,i)=><line key={`h${i}`} x1={0} y1={i*55} x2={380} y2={i*55} stroke={C.n200} strokeWidth={1}/>)}
            </svg>

            {/* Stage */}
            <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", background: C.n900, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 20px", borderRadius: 9999, letterSpacing: "0.08em" }}>STAGE / FRONT</div>

            {/* Tables */}
            {tables.map(t => {
              const pct = t.guests / t.cap;
              const color = t.type === "VIP" ? "#8B5CF6" : pct >= 1 ? C.red : pct >= 0.7 ? C.amber : C.green;
              const isSelected = selectedTable === t.id;
              return (
                <div key={t.id} onClick={() => setSelectedTable(isSelected ? null : t.id)} style={{ position: "absolute", left: t.x, top: t.y, width: 76, height: 76, borderRadius: 9999, background: isSelected ? color : "#fff", border: `3px solid ${color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: isSelected ? `0 0 0 4px ${color}33` : "0 2px 8px rgba(0,0,0,0.08)", transition: "all 150ms", zIndex: isSelected ? 5 : 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: isSelected ? "#fff" : C.n900 }}>{t.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: isSelected ? "rgba(255,255,255,0.8)" : color }}>{t.guests}/{t.cap}</span>
                  {/* Chair dots */}
                  {[0,45,90,135,180,225,270,315].slice(0, t.cap).map((angle,ci) => (
                    <div key={ci} style={{ position: "absolute", width: 9, height: 9, borderRadius: 9999, background: ci < t.guests ? color : C.n200, border: `1.5px solid ${ci < t.guests ? color : C.n300}`, left: 38 + 42*Math.cos(angle*Math.PI/180) - 4.5, top: 38 + 42*Math.sin(angle*Math.PI/180) - 4.5 }} />
                  ))}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Table detail */}
        <div>
          {sel ? (
            <Card title={`Table ${sel.id} Details`} mb={12}>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ width: 60, height: 60, borderRadius: 9999, background: C.brandLt, border: `3px solid ${C.brand}`, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: C.brand }}>{sel.label}</div>
                <Pill color={sel.type === "VIP" ? "purple" : "teal"} label={sel.type} />
                <p style={{ fontSize: 20, fontWeight: 800, color: C.n900, margin: "8px 0 2px" }}>{sel.guests}/{sel.cap}</p>
                <p style={{ fontSize: 12, color: C.n500, margin: 0 }}>seats filled</p>
                <ProgressBar value={Math.round(sel.guests/sel.cap*100)} color={C.brand} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["Ana Reyes","Pedro Santos","Liza Cruz","Maria Gomez","Jun Dela Torre"].slice(0, sel.guests > 5 ? 5 : sel.guests).map((g, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < 4 ? `1px solid ${C.n100}` : "none" }}>
                    <div style={{ width: 26, height: 26, borderRadius: 9999, background: C.brandLt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.brand }}>{g.charAt(0)}</div>
                    <span style={{ fontSize: 12, color: C.n700, fontWeight: 500 }}>{g}</span>
                  </div>
                ))}
                {sel.guests > 5 && <span style={{ fontSize: 11, color: C.n400, textAlign: "center" }}>+{sel.guests - 5} more</span>}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                <button style={{ ...btnOutline, flex: 1, fontSize: 12 }}>Move Guests</button>
                <button style={{ ...btnPrimary, flex: 1, fontSize: 12 }}>Add Guest</button>
              </div>
            </Card>
          ) : (
            <Card title="Table Details" mb={12}>
              <div style={{ textAlign: "center", padding: "20px 0", color: C.n400 }}>
                <p style={{ fontSize: 24, margin: "0 0 8px" }}>🪑</p>
                <p style={{ fontSize: 13 }}>Tap a table on the floor plan to see details</p>
              </div>
            </Card>
          )}

          <Card title="Quick Assign">
            <p style={{ fontSize: 12, color: C.n500, marginBottom: 10 }}>Find a seat for a guest</p>
            <input style={{ width: "100%", height: 36, borderRadius: 9999, border: `1.5px solid ${C.n200}`, background: C.n100, padding: "0 14px", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 8 }} placeholder="Search guest..." />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[["T5","General","6 seats free"],["T2","VIP","2 seats free"],["T8","Family","3 seats free"]].map(([t,type,seats]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: C.n100, borderRadius: 10, cursor: "pointer" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.brand }}>{t}</span>
                  <span style={{ fontSize: 12, color: C.n600 }}>{type}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: C.green, fontWeight: 700 }}>{seats}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 7 — Guest Management
// ──────────────────────────────────────────────────────────────
function GuestManagement() {
  const guests = [
    { name: "Ana Reyes",     ticket: "VIP",     table: 1, status: "checked-in", phone: "+63 912 111 2222" },
    { name: "Pedro Santos",  ticket: "General", table: 4, status: "checked-in", phone: "+63 917 333 4444" },
    { name: "Maria Gomez",   ticket: "VIP",     table: 1, status: "pending",    phone: "+63 918 555 6666" },
    { name: "Juan Cruz",     ticket: "General", table: 6, status: "pending",    phone: "+63 919 777 8888" },
    { name: "Liza Mangubat", ticket: "Staff",   table: null, status: "checked-in", phone: "+63 920 999 0000" },
    { name: "Carlos Reyes",  ticket: "General", table: 4, status: "walk-in",    phone: "+63 921 000 1111" },
  ];
  const [filter, setFilter] = useState("All");

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
        <StatCard icon="👥" label="Total"      value="234" color={C.brand}  small />
        <StatCard icon="✅" label="Checked In" value="178" color={C.green}  small />
        <StatCard icon="⏳" label="Pending"    value="56"  color={C.amber}  small />
        <StatCard icon="🚶" label="Walk-ins"   value="27"  color={C.teal}   small />
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input style={{ flex: 1, height: 38, borderRadius: 9999, border: `1.5px solid ${C.n200}`, background: C.n100, padding: "0 14px", fontSize: 13, fontFamily: "inherit" }} placeholder="🔍 Search guests..." />
        <button style={btnOutline}>Filter ▾</button>
        <button style={btnOutline}>Export CSV</button>
      </div>

      {/* Status filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {["All","Checked In","Pending","VIP","Walk-in","Staff"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", borderRadius: 9999, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", background: filter === f ? C.brand : C.n100, color: filter === f ? "#fff" : C.n600, whiteSpace: "nowrap", transition: "all 150ms" }}>{f}</button>
        ))}
      </div>

      {/* Guest list */}
      <Card title={`Guest List (${guests.length} shown)`}>
        {guests.map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: i < guests.length - 1 ? `1px solid ${C.n200}` : "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 9999, background: statusBg(g.status), border: `2px solid ${statusColor2(g.status)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: statusColor2(g.status), flexShrink: 0 }}>
              {g.status === "checked-in" ? "✓" : g.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.n800 }}>{g.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: C.n500 }}>{g.phone} {g.table ? `· Table ${g.table}` : ""}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <Pill color={g.ticket === "VIP" ? "purple" : g.ticket === "Staff" ? "teal" : "neutral"} label={g.ticket} />
              <Pill color={g.status === "checked-in" ? "green" : g.status === "walk-in" ? "brand" : "amber"} label={g.status === "checked-in" ? "In" : g.status === "walk-in" ? "Walk-in" : "Pending"} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 8 — Staff & Roles
// ──────────────────────────────────────────────────────────────
function StaffRoles() {
  const staff = [
    { name: "Pedro Gomez",   role: "Gate Scanner",  station: "Gate 1",   status: "active",   scans: 67 },
    { name: "Lyn Reyes",     role: "Gate Scanner",  station: "Gate 2",   status: "active",   scans: 54 },
    { name: "Mike Torres",   role: "Receptionist",  station: "Reception",status: "active",   scans: 0  },
    { name: "Ana Corpuz",    role: "Seating Guide",  station: "Hall B",   status: "active",   scans: 0  },
    { name: "Joe Manalo",    role: "Roving Staff",   station: "Roving",   status: "break",    scans: 31 },
    { name: "Cris Dela Cruz",role: "Walk-in Reg",    station: "Lobby",    status: "active",   scans: 0  },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        <StatCard icon="🎽" label="Total Staff" value="6"  color={C.brand} />
        <StatCard icon="🟢" label="On Duty"     value="5"  color={C.green} />
        <StatCard icon="☕" label="On Break"    value="1"  color={C.amber} />
      </div>

      {/* Invite staff */}
      <Card title="Invite Staff Member" mb={16}>
        <div style={{ display: "flex", gap: 8 }}>
          <input style={{ flex: 1, height: 38, borderRadius: 9999, border: `1.5px solid ${C.n200}`, background: C.n100, padding: "0 14px", fontSize: 13, fontFamily: "inherit" }} placeholder="Phone number or email..." />
          <select style={{ height: 38, borderRadius: 9999, border: `1.5px solid ${C.n200}`, background: C.n100, padding: "0 14px", fontSize: 13, fontFamily: "inherit", color: C.n700 }}>
            <option>Gate Scanner</option>
            <option>Receptionist</option>
            <option>Seating Guide</option>
            <option>Walk-in Reg</option>
          </select>
          <button style={btnPrimary}>Invite</button>
        </div>
      </Card>

      {/* Staff cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {staff.map((s, i) => (
          <div key={i} style={{ background: C.raised, borderRadius: 12, border: `1.5px solid ${C.n200}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 9999, background: C.brandLt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: C.brand, flexShrink: 0 }}>{s.name.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.n800 }}>{s.name}</p>
                <div style={{ width: 7, height: 7, borderRadius: 9999, background: s.status === "active" ? C.green : C.amber }} />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: C.n500 }}>{s.role} · {s.station}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              {s.scans > 0 && <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.brand }}>{s.scans} scans</p>}
              <Pill color={s.status === "active" ? "green" : "amber"} label={s.status === "active" ? "Active" : "Break"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 9 — Live Analytics
// ──────────────────────────────────────────────────────────────
function Analytics() {
  const hourly = [12,8,34,51,42,28,18,9];
  const labels = ["3PM","4PM","5PM","6PM","7PM","8PM","9PM","10PM"];
  const maxVal = Math.max(...hourly);

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
        <KPICard label="Total Registered"  value="234"    change="+12 today"  color={C.brand}  icon="👥" />
        <KPICard label="Checked In"        value="178"    change="76% rate"   color={C.green}  icon="✅" />
        <KPICard label="Revenue"           value="₱55,000" change="+₱6,750"  color="#8B5CF6"  icon="💰" />
        <KPICard label="Avg Check-in Time" value="38s"    change="⬇ 12s faster" color={C.teal} icon="⚡" />
      </div>

      {/* Check-in timeline bar chart */}
      <Card title="Check-ins Per Hour" mb={16}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100, marginBottom: 4 }}>
          {hourly.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: C.n500, fontWeight: 600 }}>{v}</span>
              <div style={{ width: "100%", borderRadius: "6px 6px 0 0", background: i === 3 ? C.brand : C.brandLt, height: `${(v / maxVal) * 80}px`, transition: "height 400ms" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {labels.map(l => <div key={l} style={{ flex: 1, textAlign: "center", fontSize: 10, color: C.n400, fontWeight: 600 }}>{l}</div>)}
        </div>
        <p style={{ fontSize: 11, color: C.n400, textAlign: "center", marginTop: 8 }}>Peak: 6 PM–7 PM (51 guests)</p>
      </Card>

      {/* Ticket breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Card title="Ticket Split">
          {[["VIP","42","18%","#8B5CF6"],["General","121","52%",C.teal],["Staff","15","6%",C.amber],["Walk-in","27","12%",C.brand]].map(([t,n,pct,c]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 9999, background: c, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: C.n700, fontWeight: 600 }}>{t}</span>
              <span style={{ fontSize: 12, color: C.n800, fontWeight: 700 }}>{n}</span>
              <span style={{ fontSize: 11, color: C.n400 }}>{pct}</span>
            </div>
          ))}
        </Card>

        <Card title="Gate Activity">
          {[["Gate 1","Pedro G.","67 scans"],["Gate 2","Lyn R.","54 scans"],["Walk-in","Cris DC","27 reg"]].map(([gate,staff,count]) => (
            <div key={gate} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: C.n700, fontWeight: 600 }}>{gate}</span>
                <span style={{ fontSize: 11, color: C.n500 }}>{count}</span>
              </div>
              <ProgressBar value={parseInt(count) / 1.4} color={C.brand} height={5} />
              <span style={{ fontSize: 10, color: C.n400 }}>{staff}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Export */}
      <Card title="Export Reports">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Attendance Report (CSV)","Revenue Summary (PDF)","Guest List (Excel)","Check-in Log (CSV)","Seating Chart (PDF)"].map(r => (
            <button key={r} style={{ ...btnOutline, fontSize: 12, padding: "6px 14px" }}>⬇ {r}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 10 — Announcements
// ──────────────────────────────────────────────────────────────
function Announcements() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        <StatCard icon="📣" label="Sent Today"  value="3"    color={C.brand} />
        <StatCard icon="👀" label="Avg Open Rate" value="94%" color={C.green} />
        <StatCard icon="📱" label="Via FCM Push" value="178"  color={C.teal} />
      </div>

      {/* Compose */}
      <Card title="Send Announcement" mb={16}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: C.n600 }}>Audience</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["All Guests (178)","VIP Only (42)","Pending (56)","Staff (15)"].map(a => (
                <button key={a} style={{ padding: "5px 12px", borderRadius: 9999, border: `1.5px solid ${C.n200}`, background: a.includes("All") ? C.brand : C.n100, color: a.includes("All") ? "#fff" : C.n600, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>{a}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: C.n600 }}>Channel</p>
            <div style={{ display: "flex", gap: 6 }}>
              {[["📱 Push Notification",true],["💬 SMS",false],["📺 Screen Display",false]].map(([ch, active]) => (
                <button key={ch} style={{ padding: "5px 12px", borderRadius: 9999, border: `1.5px solid ${active ? C.brand : C.n200}`, background: active ? C.brandLt : C.n100, color: active ? C.brandDk : C.n600, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>{ch}</button>
              ))}
            </div>
          </div>
          <textarea rows={3} style={{ borderRadius: 10, border: `1.5px solid ${C.n200}`, background: C.n100, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", color: C.n800, resize: "none" }} placeholder="Type your announcement here... e.g. 'Program will start in 10 minutes. Please proceed to your seats.'" />
          <button style={btnPrimary}>📣 Send Now</button>
        </div>
      </Card>

      {/* Announcement history */}
      <Card title="Sent Announcements">
        {[
          { time: "6:30 PM", msg: "Welcome to the Santos Family Reunion 2026! Please proceed to your assigned tables.", audience: "All", channel: "Push+SMS" },
          { time: "6:00 PM", msg: "VIP guests: Your welcome cocktail reception is now open at the VIP Lounge.", audience: "VIP", channel: "Push" },
          { time: "5:45 PM", msg: "Gates are now open! Please have your QR code ready for scanning.", audience: "All", channel: "SMS" },
        ].map((a, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: i < 2 ? `1px solid ${C.n200}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <Pill color="teal" label={a.audience} />
                <Pill color="neutral" label={a.channel} />
              </div>
              <span style={{ fontSize: 11, color: C.n400 }}>{a.time}</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: C.n700, lineHeight: 1.5 }}>{a.msg}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 11 — QR Generator
// ──────────────────────────────────────────────────────────────

// Pure SVG QR code renderer — no external libraries
// Encodes data as a visual QR-like matrix for wireframe fidelity
function QRCode({ value = "", size = 160, color = "#1C1917", bg = "#FFFFFF" }) {
  // Deterministic cell pattern from string hash — looks like real QR
  const cells = 21;
  const cell  = size / cells;

  function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
    return Math.abs(h);
  }

  function isFixed(r, c) {
    // Finder patterns (top-left, top-right, bottom-left)
    const inFinder = (r, c, or, oc) => r >= or && r <= or + 6 && c >= oc && c <= oc + 6;
    if (inFinder(r, c, 0, 0) || inFinder(r, c, 0, 14) || inFinder(r, c, 14, 0)) return true;
    return false;
  }

  function isFinderDark(r, c) {
    const finderCell = (r, c, or, oc) => {
      const lr = r - or, lc = c - oc;
      if (lr < 0 || lr > 6 || lc < 0 || lc > 6) return null;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    };
    return finderCell(r, c, 0, 0) ?? finderCell(r, c, 0, 14) ?? finderCell(r, c, 14, 0);
  }

  const h = hash(value);
  const rects = [];

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      let dark = false;
      if (isFixed(r, c)) {
        dark = isFinderDark(r, c) ?? false;
      } else {
        // Timing patterns
        if (r === 6 || c === 6) { dark = (r + c) % 2 === 0; }
        else {
          const seed = h ^ (r * 31 + c * 17) ^ (r * c);
          dark = (seed & 1) === 1;
        }
      }
      if (dark) {
        rects.push(
          <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={color} />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} style={{ display: "block", borderRadius: 4 }}>
      <rect width={size} height={size} fill={bg} />
      {rects}
    </svg>
  );
}

function QRGenerator() {
  const [tab,         setTab]         = useState("individual");
  const [selected,    setSelected]    = useState(null);
  const [bulkFilter,  setBulkFilter]  = useState("All");
  const [badgeStyle,  setBadgeStyle]  = useState("minimal");
  const [customInput, setCustomInput] = useState("");
  const [sendMethod,  setSendMethod]  = useState("sms");

  const guests = [
    { id: "EVT-001", name: "Ana Reyes",      ticket: "VIP",     table: 1,  phone: "+63 912 111 2222", email: "ana@email.com",   checkedIn: true  },
    { id: "EVT-002", name: "Pedro Santos",   ticket: "General", table: 4,  phone: "+63 917 333 4444", email: "pedro@email.com", checkedIn: true  },
    { id: "EVT-003", name: "Maria Gomez",    ticket: "VIP",     table: 1,  phone: "+63 918 555 6666", email: "maria@email.com", checkedIn: false },
    { id: "EVT-004", name: "Juan Cruz",      ticket: "General", table: 6,  phone: "+63 919 777 8888", email: "juan@email.com",  checkedIn: false },
    { id: "EVT-005", name: "Liza Mangubat",  ticket: "Staff",   table: null, phone: "+63 920 999 0000", email: "liza@email.com",  checkedIn: true  },
    { id: "EVT-006", name: "Carlos Reyes",   ticket: "General", table: 4,  phone: "+63 921 000 1111", email: "",                checkedIn: false },
    { id: "EVT-007", name: "Sheila Lim",     ticket: "VIP",     table: 2,  phone: "+63 922 222 3333", email: "sheila@email.com",checkedIn: false },
    { id: "EVT-008", name: "Ramon Aquino",   ticket: "General", table: 7,  phone: "+63 923 444 5555", email: "",                checkedIn: false },
  ];

  const sel = guests.find(g => g.id === selected);
  const filteredGuests = guests.filter(g =>
    bulkFilter === "All"        ? true :
    bulkFilter === "VIP"        ? g.ticket === "VIP" :
    bulkFilter === "Not Sent"   ? !g.checkedIn :
    bulkFilter === "No Email"   ? !g.email :
    true
  );

  const qrValue = sel
    ? `EVENTPH|${sel.id}|${sel.name}|${sel.ticket}|TABLE:${sel.table ?? "N/A"}`
    : customInput || "EVENTPH|PREVIEW|Sample Guest|General|TABLE:1";

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        <StatCard icon="⬛" label="QRs Generated" value="234"  color={C.brand}  small />
        <StatCard icon="📱" label="Sent via SMS"  value="189"  color={C.teal}   small />
        <StatCard icon="📧" label="Sent via Email" value="142" color="#8B5CF6"  small />
        <StatCard icon="🖨" label="Printed"        value="45"  color={C.amber}  small />
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[
          ["individual", "⬛ Individual QR"],
          ["bulk",       "📦 Bulk Generate"],
          ["badge",      "🪪 Badge Designer"],
          ["custom",     "✏️ Custom QR"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "7px 16px", borderRadius: 9999, border: "none", cursor: "pointer",
            background: tab === id ? C.brand : C.n100,
            color: tab === id ? "#fff" : C.n600,
            fontWeight: 700, fontSize: 12, fontFamily: "inherit", transition: "all 150ms",
          }}>{label}</button>
        ))}
      </div>

      {/* ── TAB: Individual QR ── */}
      {tab === "individual" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14 }}>

          {/* Guest list */}
          <Card title="Select Guest to Generate QR">
            <input style={{ width: "100%", height: 38, borderRadius: 9999, border: `1.5px solid ${C.n200}`, background: C.n100, padding: "0 14px", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10 }} placeholder="🔍 Search guest..." />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {guests.map(g => (
                <div key={g.id} onClick={() => setSelected(g.id === selected ? null : g.id)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                  border: `1.5px solid ${selected === g.id ? C.brand : C.n200}`,
                  background: selected === g.id ? C.brandLt : C.raised,
                  transition: "all 150ms",
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9999, background: g.checkedIn ? C.greenLt : C.brandLt, border: `2px solid ${g.checkedIn ? C.green : C.brand}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: g.checkedIn ? C.green : C.brand, flexShrink: 0 }}>
                    {g.checkedIn ? "✓" : g.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.n800 }}>{g.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.n500 }}>{g.id} · {g.phone}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <Pill color={g.ticket === "VIP" ? "purple" : g.ticket === "Staff" ? "teal" : "neutral"} label={g.ticket} />
                    {g.table && <span style={{ fontSize: 10, color: C.n400 }}>Table {g.table}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* QR Preview + Actions */}
          <div>
            <Card title="QR Code Preview" mb={12}>
              {sel ? (
                <div>
                  {/* Guest info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 12px", background: C.n100, borderRadius: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 9999, background: C.brandLt, border: `2px solid ${C.brand}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: C.brand, flexShrink: 0 }}>{sel.name.charAt(0)}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.n800 }}>{sel.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: C.n500 }}>{sel.id} · {sel.ticket}</p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    <div style={{ padding: 16, background: "#fff", borderRadius: 14, border: `1.5px solid ${C.n200}`, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", display: "inline-block" }}>
                      <QRCode value={qrValue} size={160} />
                    </div>
                  </div>

                  {/* Encoded data */}
                  <div style={{ background: C.n900, borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
                    <p style={{ margin: 0, fontSize: 9, color: C.n500, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>Encoded Data</p>
                    <p style={{ margin: 0, fontSize: 10, color: C.teal, fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.5 }}>{qrValue}</p>
                  </div>

                  {/* Send options */}
                  <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: C.n600 }}>Send To Guest</p>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    {[["sms","📱 SMS"],["email","📧 Email"],["whatsapp","💬 WhatsApp"]].map(([m, label]) => (
                      <button key={m} onClick={() => setSendMethod(m)} style={{ flex: 1, padding: "7px 0", borderRadius: 9999, border: `1.5px solid ${sendMethod === m ? C.brand : C.n200}`, background: sendMethod === m ? C.brandLt : C.n100, color: sendMethod === m ? C.brandDk : C.n600, fontWeight: 700, fontSize: 11, fontFamily: "inherit", cursor: "pointer", transition: "all 150ms" }}>{label}</button>
                    ))}
                  </div>

                  {sendMethod === "sms" && (
                    <div style={{ background: C.n100, borderRadius: 10, padding: "10px 12px", marginBottom: 10, fontSize: 12, color: C.n700, lineHeight: 1.6 }}>
                      <strong>Preview SMS:</strong><br />
                      "Hi {sel.name.split(" ")[0]}! Your EventPH QR code for Santos Reunion 2026. Show this at the gate: https://eventph.app/qr/{sel.id} — EventPH"
                    </div>
                  )}
                  {sendMethod === "email" && (
                    <div style={{ background: C.n100, borderRadius: 10, padding: "10px 12px", marginBottom: 10, fontSize: 12, color: C.n700 }}>
                      <strong>To:</strong> {sel.email || <span style={{ color: C.red }}>No email on file</span>}<br />
                      <strong>Subject:</strong> Your QR Ticket — Santos Reunion 2026
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ ...btnPrimary, flex: 1, fontSize: 12 }}>
                      {sendMethod === "sms" ? "📱 Send SMS" : sendMethod === "email" ? "📧 Send Email" : "💬 Send WhatsApp"}
                    </button>
                    <button style={{ ...btnOutline, padding: "0 12px", fontSize: 12 }}>🖨 Print</button>
                    <button style={{ ...btnOutline, padding: "0 12px", fontSize: 12 }}>⬇</button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "30px 0", color: C.n400 }}>
                  <div style={{ margin: "0 auto 12px", opacity: 0.25 }}>
                    <QRCode value="select-guest" size={100} color={C.n400} />
                  </div>
                  <p style={{ fontSize: 13, margin: 0 }}>Select a guest from the list to generate their QR code</p>
                </div>
              )}
            </Card>

            {/* QR Data Format */}
            <Card title="QR Data Format">
              <div style={{ background: C.n900, borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: C.n500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Format Spec</p>
                <code style={{ fontSize: 11, color: "#86EFAC", fontFamily: "monospace", lineHeight: 1.8, display: "block" }}>
                  EVENTPH|{"<ID>"}|{"<NAME>"}|{"<TICKET>"}|TABLE:{"<N>"}<br />
                  <span style={{ color: C.n500 }}># Example:</span><br />
                  <span style={{ color: C.teal }}>EVENTPH|EVT-001|Ana Reyes|VIP|TABLE:1</span>
                </code>
              </div>
              <p style={{ fontSize: 11, color: C.n500, margin: "8px 0 0", lineHeight: 1.5 }}>Scanner reads and validates this format. Invalid or tampered QRs are flagged as errors during check-in.</p>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB: Bulk Generate ── */}
      {tab === "bulk" && (
        <div>
          <Card title="Bulk QR Generation" mb={14}>
            <p style={{ fontSize: 13, color: C.n600, marginBottom: 14 }}>Generate and dispatch QR codes for multiple guests at once.</p>

            {/* Filter */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {["All (234)","VIP (45)","General (168)","Staff (21)","Not Sent (89)","No Email (42)"].map(f => {
                const key = f.split(" ")[0];
                return (
                  <button key={key} onClick={() => setBulkFilter(key)} style={{ padding: "6px 14px", borderRadius: 9999, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", background: bulkFilter === key ? C.brand : C.n100, color: bulkFilter === key ? "#fff" : C.n600, transition: "all 150ms" }}>{f}</button>
                );
              })}
            </div>

            {/* Bulk action bar */}
            <div style={{ background: C.n100, borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${C.brand}`, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.n800 }}>{filteredGuests.length} guests selected</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
                <button style={{ ...btnPrimary, fontSize: 12, padding: "7px 16px" }}>📱 Send All via SMS</button>
                <button style={{ ...btnOutline, fontSize: 12, padding: "7px 14px" }}>📧 Send All via Email</button>
                <button style={{ ...btnOutline, fontSize: 12, padding: "7px 14px" }}>⬇ Download All (ZIP)</button>
                <button style={{ ...btnOutline, fontSize: 12, padding: "7px 14px" }}>🖨 Print All</button>
              </div>
            </div>

            {/* Guest table */}
            <div style={{ border: `1px solid ${C.n200}`, borderRadius: 12, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 80px 70px 80px 100px", gap: 10, padding: "9px 14px", background: C.n100, borderBottom: `1px solid ${C.n200}` }}>
                {["","Guest","Ticket","Table","Status","Action"].map((h, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 700, color: C.n500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                ))}
              </div>
              {filteredGuests.map((g, i) => (
                <div key={g.id} style={{ display: "grid", gridTemplateColumns: "24px 1fr 80px 70px 80px 100px", gap: 10, padding: "10px 14px", alignItems: "center", borderBottom: i < filteredGuests.length - 1 ? `1px solid ${C.n200}` : "none", background: i % 2 === 0 ? "#fff" : C.n100 + "55" }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${C.n300}`, background: "#fff" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.n800 }}>{g.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.n500 }}>{g.id}</p>
                  </div>
                  <Pill color={g.ticket === "VIP" ? "purple" : g.ticket === "Staff" ? "teal" : "neutral"} label={g.ticket} />
                  <span style={{ fontSize: 12, color: C.n600 }}>{g.table ? `T${g.table}` : "—"}</span>
                  <Pill color={g.checkedIn ? "green" : "amber"} label={g.checkedIn ? "Sent ✓" : "Pending"} />
                  <button onClick={() => { setSelected(g.id); setTab("individual"); }} style={{ ...btnOutline, fontSize: 11, padding: "4px 10px" }}>View QR</button>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.n600 }}>QR codes sent</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.brand }}>189 / 234 (81%)</span>
              </div>
              <ProgressBar value={81} color={C.brand} />
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB: Badge Designer ── */}
      {tab === "badge" && (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14 }}>

          {/* Style options */}
          <Card title="Badge Style">
            <p style={{ fontSize: 12, color: C.n500, marginBottom: 10 }}>Choose a badge template:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["minimal",  "Minimal",    "Clean, white, QR prominent"],
                ["colorful", "Colorful",   "Ticket-type color coding"],
                ["lanyard",  "Lanyard",    "Tall format with hole punch"],
                ["sticker",  "Sticker",    "Small, round, 5cm diameter"],
              ].map(([id, name, desc]) => (
                <div key={id} onClick={() => setBadgeStyle(id)} style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${badgeStyle === id ? C.brand : C.n200}`, background: badgeStyle === id ? C.brandLt : C.raised, cursor: "pointer", transition: "all 150ms" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: badgeStyle === id ? C.brandDk : C.n800 }}>{name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.n500 }}>{desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.n200}` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.n600, margin: "0 0 8px" }}>Include Fields</p>
              {[["Guest Name", true],["Ticket Type", true],["Table Number", true],["QR Code", true],["Event Logo", true],["Phone Number", false]].map(([field, checked]) => (
                <div key={field} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${checked ? C.brand : C.n300}`, background: checked ? C.brand : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {checked && <span style={{ color: "#fff", fontSize: 9, fontWeight: 800 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12, color: C.n700 }}>{field}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Badge Preview */}
          <Card title="Badge Preview">
            <p style={{ fontSize: 12, color: C.n500, marginBottom: 14 }}>Live preview — showing Ana Reyes (VIP, Table 1)</p>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              {badgeStyle === "minimal" && (
                <div style={{ width: 220, background: "#fff", borderRadius: 14, border: `2px solid ${C.n200}`, padding: "20px 16px", textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, color: C.n400, letterSpacing: "0.1em", textTransform: "uppercase" }}>Santos Family Reunion 2026</p>
                  <div style={{ margin: "12px auto", display: "inline-block", padding: 8, background: "#fff", borderRadius: 8, border: `1px solid ${C.n200}` }}>
                    <QRCode value="EVENTPH|EVT-001|Ana Reyes|VIP|TABLE:1" size={100} />
                  </div>
                  <p style={{ margin: "8px 0 2px", fontSize: 18, fontWeight: 800, color: C.n900 }}>ANA REYES</p>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: C.n500 }}>Table 1 · EVT-001</p>
                  <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 9999, background: "#F3E8FF", color: "#7C3AED", fontSize: 12, fontWeight: 800 }}>VIP</div>
                </div>
              )}
              {badgeStyle === "colorful" && (
                <div style={{ width: 220, background: "#fff", borderRadius: 14, border: `2px solid #8B5CF6`, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                  <div style={{ background: "#8B5CF6", padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Santos Reunion 2026</p>
                    <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "#fff" }}>VIP</p>
                  </div>
                  <div style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{ margin: "0 auto 10px", display: "inline-block" }}>
                      <QRCode value="EVENTPH|EVT-001|Ana Reyes|VIP|TABLE:1" size={90} />
                    </div>
                    <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 800, color: C.n900 }}>Ana Reyes</p>
                    <p style={{ margin: 0, fontSize: 12, color: C.n500 }}>Table 1 · EVT-001</p>
                  </div>
                </div>
              )}
              {badgeStyle === "lanyard" && (
                <div style={{ width: 160, background: "#fff", borderRadius: 10, border: `2px solid ${C.n200}`, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                  <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 0" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 9999, border: `2px solid ${C.n300}`, background: C.n100 }} />
                  </div>
                  <div style={{ height: 4, background: C.brand, margin: "6px 0" }} />
                  <div style={{ padding: "8px 12px 14px", textAlign: "center" }}>
                    <p style={{ margin: "0 0 8px", fontSize: 10, color: C.n400, fontWeight: 600 }}>SANTOS REUNION 2026</p>
                    <div style={{ margin: "0 auto 8px", display: "inline-block" }}>
                      <QRCode value="EVENTPH|EVT-001|Ana Reyes|VIP|TABLE:1" size={80} />
                    </div>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 800, color: C.n900 }}>ANA REYES</p>
                    <p style={{ margin: "0 0 6px", fontSize: 10, color: C.n500 }}>Table 1</p>
                    <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 9999, background: "#F3E8FF", color: "#7C3AED", fontSize: 10, fontWeight: 800 }}>VIP</div>
                  </div>
                </div>
              )}
              {badgeStyle === "sticker" && (
                <div style={{ width: 160, height: 160, borderRadius: 9999, background: "#fff", border: `3px solid ${C.brand}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                  <QRCode value="EVENTPH|EVT-001|Ana Reyes|VIP|TABLE:1" size={70} />
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: C.n900 }}>ANA REYES</p>
                  <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: 9999, background: "#F3E8FF", color: "#7C3AED", fontSize: 9, fontWeight: 800 }}>VIP · T1</div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={btnPrimary}>🖨 Print All Badges</button>
              <button style={btnOutline}>⬇ Download PDF</button>
              <button style={btnOutline}>⬇ Download PNG</button>
            </div>

            <div style={{ marginTop: 14, background: C.n100, borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ margin: 0, fontSize: 12, color: C.n600 }}>
                <strong>Print settings:</strong> A4 paper · 4 badges per sheet · 300 DPI · Avery 5388 compatible
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB: Custom QR ── */}
      {tab === "custom" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14 }}>
          <Card title="Custom QR Code Generator">
            <p style={{ fontSize: 13, color: C.n600, marginBottom: 14 }}>Generate a QR code for any content — links, venue WiFi, emergency contacts, event schedule, payment links.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Quick presets */}
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: C.n600 }}>Quick Presets</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    ["🌐 Event Page",   "https://eventph.app/santos-reunion"],
                    ["📋 Program",      "https://eventph.app/santos-reunion/program"],
                    ["📷 Photo Upload", "https://eventph.app/santos-reunion/photos"],
                    ["💰 GCash Payment","https://gcash.me/santos-event"],
                    ["📶 Venue WiFi",   "WIFI:T:WPA;S:SantosReunion2026;P:santos2026;;"],
                    ["📞 Emergency",    "tel:+639123456789"],
                  ].map(([label, val]) => (
                    <button key={label} onClick={() => setCustomInput(val)} style={{ padding: "6px 12px", borderRadius: 9999, border: `1.5px solid ${C.n200}`, background: customInput === val ? C.brandLt : C.n100, color: customInput === val ? C.brandDk : C.n700, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", transition: "all 150ms" }}>{label}</button>
                  ))}
                </div>
              </div>

              {/* Custom input */}
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: C.n600 }}>QR Content</p>
                <textarea value={customInput} onChange={e => setCustomInput(e.target.value)} rows={3} placeholder="Enter URL, text, WiFi credentials, phone number, or any data to encode..." style={{ width: "100%", borderRadius: 10, border: `1.5px solid ${C.n200}`, background: C.n100, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", color: C.n800, resize: "vertical", boxSizing: "border-box" }} />
              </div>

              {/* Customization */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: C.n600 }}>QR Color</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[C.n900, C.brand, C.teal, "#8B5CF6", C.green].map(color => (
                      <div key={color} style={{ width: 28, height: 28, borderRadius: 9999, background: color, cursor: "pointer", border: "2px solid transparent", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: C.n600 }}>Size</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Small","Medium","Large"].map(s => (
                      <button key={s} style={{ flex: 1, padding: "6px 0", borderRadius: 9999, border: `1.5px solid ${s === "Medium" ? C.brand : C.n200}`, background: s === "Medium" ? C.brandLt : C.n100, color: s === "Medium" ? C.brandDk : C.n600, fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error correction */}
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: C.n600 }}>Error Correction Level</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["L","Low — 7%"],["M","Medium — 15%"],["Q","High — 25%"],["H","Max — 30%"]].map(([level, desc]) => (
                    <div key={level} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: `1.5px solid ${level === "M" ? C.brand : C.n200}`, background: level === "M" ? C.brandLt : C.n100, cursor: "pointer", textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: level === "M" ? C.brand : C.n700 }}>{level}</p>
                      <p style={{ margin: 0, fontSize: 9, color: C.n500 }}>{desc.split("—")[1]}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button style={btnPrimary}>Generate QR →</button>
            </div>
          </Card>

          {/* Preview */}
          <Card title="Generated QR">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ padding: 20, background: "#fff", borderRadius: 16, border: `1.5px solid ${C.n200}`, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", display: "inline-block" }}>
                <QRCode value={customInput || "https://eventph.app/santos-reunion"} size={160} />
              </div>
            </div>

            <div style={{ background: C.n900, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 10, color: C.n500, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Encodes</p>
              <p style={{ margin: 0, fontSize: 11, color: C.teal, fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.5 }}>
                {customInput || "https://eventph.app/santos-reunion"}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button style={{ ...btnPrimary, width: "100%" }}>⬇ Download PNG</button>
              <button style={{ ...btnOutline, width: "100%" }}>⬇ Download SVG</button>
              <button style={{ ...btnOutline, width: "100%" }}>🖨 Print</button>
              <button style={{ ...btnOutline, width: "100%" }}>📋 Copy Link</button>
            </div>

            <div style={{ marginTop: 12, padding: "10px 12px", background: C.amberLt, borderRadius: 10, border: `1px solid ${C.amber}33` }}>
              <p style={{ margin: 0, fontSize: 11, color: C.amber, fontWeight: 600 }}>⚠️ Test your QR before printing in bulk — scan with your device camera to verify.</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


// ──────────────────────────────────────────────────────────────
// SCREEN 12 — Program / Rundown
// ──────────────────────────────────────────────────────────────
function ProgramRundown() {
  const [items, setItems] = useState([
    { id:1,  time:"5:00 PM", duration:30, title:"Guest Arrival & Reception",    category:"logistics", pic:"Pedro G.",  status:"done",    notes:"Gate 1 & 2 open" },
    { id:2,  time:"5:30 PM", duration:15, title:"Opening Prayer",               category:"program",   pic:"Fr. Santos",status:"done",    notes:"" },
    { id:3,  time:"5:45 PM", duration:20, title:"National Anthem & Welcome",    category:"program",   pic:"Lito L.",   status:"done",    notes:"" },
    { id:4,  time:"6:05 PM", duration:45, title:"Cocktail Hour & Photo Ops",    category:"social",    pic:"All Guests",status:"current", notes:"Photo booth open" },
    { id:5,  time:"6:50 PM", duration:30, title:"Dinner Service — 1st Wave",    category:"catering",  pic:"Chef Reyes",status:"upcoming",notes:"Tables 1-6 first" },
    { id:6,  time:"7:20 PM", duration:15, title:"Emcee Introduction",           category:"program",   pic:"MC Jay",    status:"upcoming",notes:"" },
    { id:7,  time:"7:35 PM", duration:20, title:"Family Tribute Video",         category:"program",   pic:"AV Team",   status:"upcoming",notes:"Check HDMI" },
    { id:8,  time:"7:55 PM", duration:45, title:"Dinner Service — 2nd Wave",    category:"catering",  pic:"Chef Reyes",status:"upcoming",notes:"Tables 7-12" },
    { id:9,  time:"8:40 PM", duration:60, title:"Live Band & Open Program",     category:"social",    pic:"Band: Luna",status:"upcoming",notes:"3 sets planned" },
    { id:10, time:"9:40 PM", duration:20, title:"Raffle Draw",                  category:"program",   pic:"Lito L.",   status:"upcoming",notes:"6 prizes" },
    { id:11, time:"10:00 PM",duration:30, title:"Disco & Free Dance",           category:"social",    pic:"DJ Mike",   status:"upcoming",notes:"" },
    { id:12, time:"10:30 PM",duration:15, title:"Closing Remarks & Group Photo",category:"program",   pic:"Lito L.",   status:"upcoming",notes:"" },
  ]);
  const [editId, setEditId] = useState(null);
  const catColor = { logistics:"#2563EB", program:"#FF6B4A", catering:"#16A34A", social:"#8B5CF6" };
  const catBg    = { logistics:"#EFF6FF", program:"#FFF1EE", catering:"#DCFCE7", social:"#F3E8FF" };
  const current  = items.find(i => i.status === "current");
  const nextItem = items.find(i => i.status === "upcoming");

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        <div style={{ background:`linear-gradient(135deg, ${C.brand}, ${C.brandDk})`, borderRadius:14, padding:"14px 16px", color:"#fff" }}>
          <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:700, opacity:0.7, letterSpacing:"0.1em", textTransform:"uppercase" }}>▶ NOW</p>
          <p style={{ margin:"0 0 2px", fontSize:15, fontWeight:800 }}>{current?.title}</p>
          <p style={{ margin:0, fontSize:12, opacity:0.8 }}>{current?.time} · {current?.pic}</p>
        </div>
        <div style={{ background:C.n900, borderRadius:14, padding:"14px 16px", color:"#fff" }}>
          <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:700, opacity:0.5, letterSpacing:"0.1em", textTransform:"uppercase" }}>NEXT UP</p>
          <p style={{ margin:"0 0 2px", fontSize:15, fontWeight:800 }}>{nextItem?.title}</p>
          <p style={{ margin:0, fontSize:12, color:C.n400 }}>{nextItem?.time} · {nextItem?.pic}</p>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {Object.entries(catColor).map(([cat,color]) => (
          <div key={cat} style={{ display:"flex", alignItems:"center", gap:5, background:catBg[cat], borderRadius:9999, padding:"4px 10px" }}>
            <div style={{ width:8, height:8, borderRadius:9999, background:color }} />
            <span style={{ fontSize:11, fontWeight:700, color, textTransform:"capitalize" }}>{cat}</span>
          </div>
        ))}
      </div>
      <Card title={`Program Rundown (${items.length} items)`}>
        {items.map((item, i) => (
          <div key={item.id} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom: i < items.length-1 ? `1px solid ${C.n200}` : "none", opacity: item.status==="done" ? 0.55 : 1 }}>
            <div style={{ width:56, flexShrink:0, textAlign:"right" }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.n700 }}>{item.time}</p>
              <p style={{ margin:0, fontSize:10, color:C.n400 }}>{item.duration}min</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{ width:10, height:10, borderRadius:9999, background: item.status==="current" ? C.brand : item.status==="done" ? C.green : C.n300, flexShrink:0, marginTop:2 }} />
              {i < items.length-1 && <div style={{ width:2, flex:1, background:C.n200, marginTop:2 }} />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontSize:14 }}>{item.status==="done" ? "✅" : item.status==="current" ? "▶️" : "⏳"}</span>
                <span style={{ fontSize:13, fontWeight:700, color:C.n800 }}>{item.title}</span>
                <span style={{ marginLeft:"auto", fontSize:11, padding:"2px 8px", borderRadius:9999, background:catBg[item.category], color:catColor[item.category], fontWeight:700 }}>{item.category}</span>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:11, color:C.n500 }}>👤 {item.pic}</span>
                {item.notes && <span style={{ fontSize:11, color:C.amber }}>Note: {item.notes}</span>}
                <button onClick={() => setEditId(editId===item.id ? null : item.id)} style={{ marginLeft:"auto", fontSize:11, padding:"3px 10px", borderRadius:9999, border:`1px solid ${C.n200}`, background:C.n100, color:C.n600, cursor:"pointer", fontFamily:"inherit" }}>{editId===item.id ? "Close" : "Edit"}</button>
              </div>
              {editId === item.id && (
                <div style={{ marginTop:8, padding:"10px 12px", background:C.n100, borderRadius:10 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div><p style={{ margin:"0 0 4px", fontSize:11, fontWeight:700, color:C.n500 }}>TIME</p><input defaultValue={item.time} style={{ width:"100%", height:32, borderRadius:8, border:`1px solid ${C.n200}`, padding:"0 8px", fontSize:12, fontFamily:"inherit", boxSizing:"border-box" }} /></div>
                    <div><p style={{ margin:"0 0 4px", fontSize:11, fontWeight:700, color:C.n500 }}>DURATION (min)</p><input defaultValue={item.duration} type="number" style={{ width:"100%", height:32, borderRadius:8, border:`1px solid ${C.n200}`, padding:"0 8px", fontSize:12, fontFamily:"inherit", boxSizing:"border-box" }} /></div>
                    <div style={{ gridColumn:"1/-1" }}><p style={{ margin:"0 0 4px", fontSize:11, fontWeight:700, color:C.n500 }}>TITLE</p><input defaultValue={item.title} style={{ width:"100%", height:32, borderRadius:8, border:`1px solid ${C.n200}`, padding:"0 8px", fontSize:12, fontFamily:"inherit", boxSizing:"border-box" }} /></div>
                    <div><p style={{ margin:"0 0 4px", fontSize:11, fontWeight:700, color:C.n500 }}>PIC</p><input defaultValue={item.pic} style={{ width:"100%", height:32, borderRadius:8, border:`1px solid ${C.n200}`, padding:"0 8px", fontSize:12, fontFamily:"inherit", boxSizing:"border-box" }} /></div>
                    <div><p style={{ margin:"0 0 4px", fontSize:11, fontWeight:700, color:C.n500 }}>STATUS</p><select defaultValue={item.status} style={{ width:"100%", height:32, borderRadius:8, border:`1px solid ${C.n200}`, padding:"0 8px", fontSize:12, fontFamily:"inherit" }}>{["done","current","upcoming"].map(s => <option key={s}>{s}</option>)}</select></div>
                    <div style={{ gridColumn:"1/-1" }}><p style={{ margin:"0 0 4px", fontSize:11, fontWeight:700, color:C.n500 }}>NOTES</p><input defaultValue={item.notes} style={{ width:"100%", height:32, borderRadius:8, border:`1px solid ${C.n200}`, padding:"0 8px", fontSize:12, fontFamily:"inherit", boxSizing:"border-box" }} /></div>
                  </div>
                  <div style={{ display:"flex", gap:6, marginTop:8 }}>
                    <button style={{ ...btnPrimary, fontSize:12, padding:"6px 16px" }}>Save</button>
                    <button style={{ ...btnGhost, fontSize:12, padding:"6px 12px" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <button style={{ ...btnOutline, marginTop:12, width:"100%" }}>+ Add Program Item</button>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 13 — Vendor & Supplier Management
// ──────────────────────────────────────────────────────────────
function VendorSuppliers() {
  const vendors = [
    { name:"Chef Reyes Catering",  category:"Catering",   contact:"+63 917 111 2222", status:"confirmed", paid:true,  amount:28000, notes:"Menu finalized. 2 servers assigned." },
    { name:"Soundwave AV Rentals", category:"AV/Sound",   contact:"+63 918 333 4444", status:"confirmed", paid:true,  amount:8500,  notes:"Setup by 3PM. HDMI + Wireless mic." },
    { name:"Blooms & Petals",      category:"Decorations",contact:"+63 919 555 6666", status:"confirmed", paid:false, amount:4900,  notes:"Centerpieces + backdrop. Balance due." },
    { name:"Snap & Click Studio",  category:"Photo/Video",contact:"+63 920 777 8888", status:"confirmed", paid:true,  amount:6500,  notes:"Photo + video + same-day slideshow." },
    { name:"Luna & The Moons",     category:"Live Band",  contact:"+63 921 999 0000", status:"confirmed", paid:false, amount:12000, notes:"3 sets: 8:40, 9:10, 9:40PM." },
    { name:"DJ Mike Torino",       category:"DJ",         contact:"+63 922 111 3333", status:"confirmed", paid:true,  amount:3500,  notes:"Disco set 10PM onwards." },
    { name:"SMX Davao Hall B",     category:"Venue",      contact:"+63 82 234 5678",  status:"confirmed", paid:true,  amount:25000, notes:"Hall B. Setup 2PM. Teardown 11PM." },
    { name:"Aiza Transport",       category:"Transport",  contact:"+63 923 444 5555", status:"pending",   paid:false, amount:2000,  notes:"Shuttle: Airport to venue 4PM." },
  ];
  const catIcon = { "Catering":"🍽️","AV/Sound":"🎤","Decorations":"🌸","Photo/Video":"📸","Live Band":"🎸","DJ":"🎧","Venue":"🏛️","Transport":"🚐" };
  const totalBudget = vendors.reduce((s,v) => s + v.amount, 0);
  const totalPaid   = vendors.filter(v => v.paid).reduce((s,v) => s + v.amount, 0);

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        <StatCard icon="🤝" label="Total Vendors"  value={vendors.length} color={C.brand} />
        <StatCard icon="✅" label="Confirmed" value={vendors.filter(v=>v.status==="confirmed").length} color={C.green} />
        <StatCard icon="⏳" label="Pending"  value={vendors.filter(v=>v.status==="pending").length} color={C.amber} />
      </div>
      <Card title="Payment Summary" mb={14}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:10 }}>
          <BudgetStat label="Total Contracted" value={`₱${totalBudget.toLocaleString()}`} color={C.brand} />
          <BudgetStat label="Paid"             value={`₱${totalPaid.toLocaleString()}`}   color={C.green} />
          <BudgetStat label="Balance Due"      value={`₱${(totalBudget-totalPaid).toLocaleString()}`} color={C.red} />
        </div>
        <ProgressBar value={Math.round(totalPaid/totalBudget*100)} color={C.green} />
      </Card>
      {vendors.map((v, i) => (
        <div key={i} style={{ background:C.raised, borderRadius:14, border:`1.5px solid ${v.status==="pending" ? C.amber+"55" : C.n200}`, padding:"14px 16px", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:C.n100, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{catIcon[v.category] || "📦"}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                <p style={{ margin:0, fontSize:14, fontWeight:800, color:C.n900 }}>{v.name}</p>
                <Pill color="neutral" label={v.category} />
                <Pill color={v.status==="confirmed" ? "green" : "amber"} label={v.status} />
                <Pill color={v.paid ? "green" : "red"} label={v.paid ? "✅ Paid" : "⚠️ Balance"} />
              </div>
              <div style={{ display:"flex", gap:16, marginBottom:5 }}>
                <span style={{ fontSize:12, color:C.n600 }}>📞 {v.contact}</span>
                <span style={{ fontSize:14, fontWeight:800, color: v.paid ? C.green : C.red }}>₱{v.amount.toLocaleString()}</span>
              </div>
              <p style={{ margin:0, fontSize:12, color:C.n500, fontStyle:"italic" }}>{v.notes}</p>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button style={{ ...btnOutline, fontSize:11, padding:"5px 10px" }}>Edit</button>
              {!v.paid && <button style={{ ...btnPrimary, fontSize:11, padding:"5px 10px" }}>Mark Paid</button>}
            </div>
          </div>
        </div>
      ))}
      <button style={{ ...btnOutline, width:"100%" }}>+ Add Vendor</button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 14 — Catering & Menu
// ──────────────────────────────────────────────────────────────
function CateringMenu() {
  const menu = [
    { course:"Appetizer",   items:["Fresh Lumpia (v)","Kinilaw na Isda","Chicharon Bulaklak"],        served:true  },
    { course:"Soup",        items:["Sinigang na Baboy","Cream of Mushroom (v)"],                       served:true  },
    { course:"Main Course", items:["Lechon Baboy","Beef Caldereta","Chicken Inasal","Pinakbet (v)"],   served:false },
    { course:"Rice",        items:["Steamed Rice","Garlic Fried Rice"],                                served:false },
    { course:"Dessert",     items:["Leche Flan","Halo-Halo","Fresh Fruit Platter"],                   served:false },
    { course:"Drinks",      items:["Buko Juice","Iced Tea","Mineral Water","Softdrinks"],              served:false },
  ];
  const waves = [
    { label:"1st Wave", tables:"T1–T6",  time:"6:50 PM", status:"served",   guests:60  },
    { label:"2nd Wave", tables:"T7–T12", time:"7:55 PM", status:"pending",  guests:54  },
    { label:"Buffet",   tables:"Dessert",time:"8:30 PM", status:"upcoming", guests:234 },
  ];
  const alerts = [
    { guest:"Pedro Santos", alert:"Shellfish allergy",    table:4, sev:"high"   },
    { guest:"Sheila Lim",   alert:"Gluten-free required", table:2, sev:"medium" },
    { guest:"Baby Cruz",    alert:"No spicy food (child)",table:7, sev:"low"    },
  ];

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
        {[["🍽️","Standard",168,C.teal],["⭐","VIP Package",45,"#8B5CF6"],["🌿","Vegetarian",12,C.green],["🧸","Kids Meal",9,C.amber]].map(([icon,label,count,color]) => (
          <StatCard key={label} icon={icon} label={label} value={count} color={color} small />
        ))}
      </div>
      <Card title="Service Status" mb={14}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {waves.map(w => (
            <div key={w.label} style={{ background: w.status==="served" ? C.greenLt : w.status==="pending" ? C.amberLt : C.n100, borderRadius:12, padding:"12px 14px", border:`1.5px solid ${w.status==="served" ? C.green+"33" : w.status==="pending" ? C.amber+"33" : C.n200}` }}>
              <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:800, color:C.n900 }}>{w.label}</p>
              <p style={{ margin:"0 0 6px", fontSize:11, color:C.n500 }}>{w.tables} · {w.time}</p>
              <Pill color={w.status==="served" ? "green" : w.status==="pending" ? "amber" : "neutral"} label={w.status==="served" ? "✅ Served" : w.status==="pending" ? "▶️ Active" : "⏳ Upcoming"} />
            </div>
          ))}
        </div>
      </Card>
      <Card title="Menu" mb={14}>
        {menu.map((course, i) => (
          <div key={i} style={{ marginBottom: i < menu.length-1 ? 14 : 0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <Pill color={course.served ? "green" : "neutral"} label={course.served ? "✅ Served" : "⏳ Pending"} />
              <span style={{ fontSize:13, fontWeight:800, color:C.n800 }}>{course.course}</span>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {course.items.map((item, j) => (
                <span key={j} style={{ fontSize:12, padding:"4px 12px", borderRadius:9999, background: item.includes("(v)") ? C.greenLt : C.n100, color: item.includes("(v)") ? C.green : C.n700, border:`1px solid ${item.includes("(v)") ? C.green+"33" : C.n200}`, fontWeight:500 }}>
                  {item.includes("(v)") ? "🌿 " : ""}{item}
                </span>
              ))}
            </div>
            {i < menu.length-1 && <div style={{ height:1, background:C.n200, marginTop:12 }} />}
          </div>
        ))}
      </Card>
      <Card title="Dietary Alerts">
        {alerts.map((a, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom: i < alerts.length-1 ? `1px solid ${C.n200}` : "none" }}>
            <span style={{ fontSize:18 }}>{a.sev==="high" ? "🚨" : a.sev==="medium" ? "⚠️" : "ℹ️"}</span>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.n800 }}>{a.guest}</p>
              <p style={{ margin:0, fontSize:12, color:C.n500 }}>{a.alert} · Table {a.table}</p>
            </div>
            <Pill color={a.sev==="high" ? "red" : a.sev==="medium" ? "amber" : "blue"} label={a.sev} />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 15 — Feedback & Surveys
// ──────────────────────────────────────────────────────────────
function FeedbackSurveys() {
  const [tab, setTab] = useState("results");
  const ratings = { overall:4.7, venue:4.8, food:4.5, program:4.6, staff:4.9 };
  const responses = [
    { name:"Ana Reyes",    rating:5, comment:"Sobrang ganda ng event! Proud to be a Santos. See you in 5 years!", time:"9:12 PM" },
    { name:"Pedro Santos", rating:5, comment:"The food was excellent. Lechon was the best! Staff very professional.", time:"9:05 PM" },
    { name:"Anonymous",    rating:4, comment:"Program was a bit delayed but overall very enjoyable. Great effort!", time:"8:58 PM" },
    { name:"Maria G.",     rating:4, comment:"Venue was great. Parking was a bit tight. Band was amazing!", time:"8:44 PM" },
    { name:"Anonymous",    rating:3, comment:"Food ran out early at Table 8. Hope to fix that next time.", time:"8:30 PM" },
  ];
  function Stars({ n }) { return <span style={{ color:"#F59E0B", fontSize:16 }}>{"★".repeat(n)}{"☆".repeat(5-n)}</span>; }

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
        {[["⭐","Avg Rating","4.7/5","#F59E0B"],["💬","Responses","89",C.teal],["😊","Positive","94%",C.green],["📊","Response Rate","50%",C.brand]].map(([icon,label,val,color]) => (
          <StatCard key={label} icon={icon} label={label} value={val} color={color} small />
        ))}
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {[["results","📊 Results"],["builder","🔧 Builder"],["live","📡 Live Poll"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding:"7px 16px", borderRadius:9999, border:"none", cursor:"pointer", background: tab===id ? C.brand : C.n100, color: tab===id ? "#fff" : C.n600, fontWeight:700, fontSize:12, fontFamily:"inherit" }}>{label}</button>
        ))}
      </div>
      {tab === "results" && (
        <div>
          <Card title="Category Ratings" mb={14}>
            {Object.entries(ratings).map(([cat, score]) => (
              <div key={cat} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:13, color:C.n700, fontWeight:600, textTransform:"capitalize" }}>{cat}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:"#F59E0B" }}>{score} ★</span>
                </div>
                <ProgressBar value={score/5*100} color="#F59E0B" height={6} />
              </div>
            ))}
          </Card>
          <Card title="Guest Comments">
            {responses.map((r, i) => (
              <div key={i} style={{ padding:"11px 0", borderBottom: i < responses.length-1 ? `1px solid ${C.n200}` : "none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:30, height:30, borderRadius:9999, background:C.brandLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:C.brand }}>{r.name.charAt(0)}</div>
                    <div><p style={{ margin:0, fontSize:12, fontWeight:700, color:C.n800 }}>{r.name}</p><Stars n={r.rating} /></div>
                  </div>
                  <span style={{ fontSize:11, color:C.n400 }}>{r.time}</span>
                </div>
                <p style={{ margin:0, fontSize:13, color:C.n700, lineHeight:1.5, paddingLeft:38 }}>{r.comment}</p>
              </div>
            ))}
          </Card>
        </div>
      )}
      {tab === "builder" && (
        <Card title="Survey Builder">
          <p style={{ fontSize:13, color:C.n600, marginBottom:12 }}>Questions sent to guests after check-in via SMS/app:</p>
          {[
            { q:"How would you rate the overall event?", type:"star-rating" },
            { q:"How was the food and catering?",        type:"star-rating" },
            { q:"How was the venue and setup?",          type:"star-rating" },
            { q:"Any suggestions for improvement?",      type:"text"        },
            { q:"Would you recommend EventPH?",          type:"yes-no"      },
          ].map((q, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom: i<4 ? `1px solid ${C.n200}` : "none" }}>
              <span style={{ fontSize:14 }}>≡</span>
              <p style={{ flex:1, margin:0, fontSize:13, color:C.n800 }}>{q.q}</p>
              <Pill color="neutral" label={q.type} />
            </div>
          ))}
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <button style={{ ...btnOutline, fontSize:12 }}>+ Add Question</button>
            <button style={{ ...btnPrimary, fontSize:12 }}>Send Survey Now</button>
          </div>
        </Card>
      )}
      {tab === "live" && (
        <Card title="Live Poll — Active">
          <div style={{ background:C.n900, borderRadius:12, padding:"16px", marginBottom:14, textAlign:"center" }}>
            <p style={{ color:C.n400, fontSize:11, margin:"0 0 8px" }}>Guests scan QR or tap in-app to vote</p>
            <p style={{ color:"#fff", fontSize:18, fontWeight:800, margin:"0 0 14px" }}>What's your favorite part so far?</p>
            {[["Food & Catering",62],["Live Band",51],["Photo Booth",38],["Raffle",29]].map(([opt,votes]) => (
              <div key={opt} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:12, color:"#fff" }}>{opt}</span>
                  <span style={{ fontSize:12, color:C.brand, fontWeight:700 }}>{votes} votes</span>
                </div>
                <div style={{ height:8, background:"rgba(255,255,255,0.1)", borderRadius:9999, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${votes/62*100}%`, background:C.brand, borderRadius:9999 }} />
                </div>
              </div>
            ))}
            <p style={{ color:C.n500, fontSize:11, marginTop:10 }}>180 votes · Live</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button style={{ ...btnOutline, flex:1 }}>Close Poll</button>
            <button style={{ ...btnPrimary, flex:1 }}>New Poll</button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 16 — Payments & Finance
// ──────────────────────────────────────────────────────────────
function PaymentsFinance() {
  const txns = [
    { id:"TXN-001", name:"Ana Reyes",    amount:500,  method:"GCash", type:"ticket", status:"completed", time:"Jun 1 · 10:22 AM" },
    { id:"TXN-002", name:"Pedro Santos", amount:250,  method:"Maya",  type:"ticket", status:"completed", time:"Jun 1 · 11:05 AM" },
    { id:"TXN-003", name:"Maria Gomez",  amount:500,  method:"Card",  type:"ticket", status:"pending",   time:"Jun 1 · 2:14 PM"  },
    { id:"TXN-004", name:"Walk-in #27",  amount:250,  method:"Cash",  type:"walkin", status:"completed", time:"Jun 15 · 6:41 PM" },
    { id:"TXN-005", name:"Walk-in #28",  amount:500,  method:"GCash", type:"walkin", status:"completed", time:"Jun 15 · 6:43 PM" },
    { id:"TXN-006", name:"Juan Cruz",    amount:250,  method:"GCash", type:"ticket", status:"refunded",  time:"Jun 10 · 9:30 AM" },
  ];
  const revenue = txns.filter(t=>t.status==="completed").reduce((s,t)=>s+t.amount,0);
  const pending  = txns.filter(t=>t.status==="pending").reduce((s,t)=>s+t.amount,0);

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:14 }}>
        <KPICard label="Total Revenue"    value={`₱${revenue.toLocaleString()}`} change="+₱6,750 today" color={C.green}  icon="💰" />
        <KPICard label="Pending Payments" value={`₱${pending.toLocaleString()}`} change="⚠️ 1 pending"  color={C.amber}  icon="⏳" />
      </div>
      <Card title="Revenue by Payment Method" mb={14}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {[["📱","GCash","₱24,500",C.teal],["💳","Card","₱15,000",C.blue],["💵","Cash","₱8,250",C.amber],["💸","Maya","₱6,750","#8B5CF6"]].map(([icon,method,amt,color]) => (
            <div key={method} style={{ background:color+"11", borderRadius:12, padding:"10px 12px", border:`1px solid ${color}33`, textAlign:"center" }}>
              <span style={{ fontSize:20 }}>{icon}</span>
              <p style={{ margin:"4px 0 2px", fontSize:14, fontWeight:800, color }}>{amt}</p>
              <p style={{ margin:0, fontSize:11, color:C.n500 }}>{method}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Transaction Log">
        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          {["All","Completed","Pending","Refunded"].map(f => (
            <button key={f} style={{ padding:"4px 12px", borderRadius:9999, border:"none", cursor:"pointer", fontWeight:700, fontSize:11, fontFamily:"inherit", background:f==="All" ? C.brand : C.n100, color:f==="All" ? "#fff" : C.n600 }}>{f}</button>
          ))}
        </div>
        {txns.map((t, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom: i < txns.length-1 ? `1px solid ${C.n200}` : "none" }}>
            <div style={{ width:36, height:36, borderRadius:10, background: t.method==="GCash" ? C.tealLt : t.method==="Cash" ? C.amberLt : C.blueLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
              {t.method==="GCash" ? "📱" : t.method==="Cash" ? "💵" : t.method==="Card" ? "💳" : "💸"}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.n800 }}>{t.name}</p>
              <p style={{ margin:0, fontSize:11, color:C.n500 }}>{t.id} · {t.method} · {t.time}</p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:800, color: t.status==="refunded" ? C.red : t.status==="pending" ? C.amber : C.green }}>{t.status==="refunded" ? "-" : "+"}₱{t.amount}</p>
              <Pill color={t.status==="completed" ? "green" : t.status==="pending" ? "amber" : "red"} label={t.status} />
            </div>
          </div>
        ))}
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          <button style={{ ...btnOutline, flex:1 }}>Export CSV</button>
          <button style={{ ...btnOutline, flex:1 }}>Export PDF</button>
        </div>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 17 — Incident Log
// ──────────────────────────────────────────────────────────────
function IncidentLog() {
  const [showForm, setShowForm] = useState(false);
  const incidents = [
    { id:"INC-001", type:"medical",   severity:"high",   title:"Guest with chest pain at Table 3",   reporter:"Ana C.",  time:"6:55 PM", status:"resolved", action:"First aid administered. Guest resting. Family notified." },
    { id:"INC-002", type:"technical", severity:"medium", title:"Microphone feedback at podium",       reporter:"Mike T.", time:"7:12 PM", status:"resolved", action:"AV team adjusted gain. Resolved in 3 min." },
    { id:"INC-003", type:"security",  severity:"low",    title:"Unauthorized person at VIP table",    reporter:"Pedro G.",time:"7:40 PM", status:"resolved", action:"Escorted to general section. No confrontation." },
    { id:"INC-004", type:"logistics", severity:"medium", title:"Food ran out at Table 8 (Main Course)",reporter:"Lyn R.", time:"7:58 PM", status:"open",     action:"Caterer replenishing. ETA 10 mins." },
    { id:"INC-005", type:"technical", severity:"low",    title:"Projector flickering during video",    reporter:"Mike T.",time:"8:02 PM", status:"open",     action:"Restarting HDMI connection." },
  ];
  const typeIcon = { medical:"🏥", technical:"🔧", security:"🔒", logistics:"📦", other:"ℹ️" };

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
        <StatCard icon="🚨" label="Total"        value={incidents.length} color={C.brand} small />
        <StatCard icon="🔴" label="Open"         value={incidents.filter(i=>i.status==="open").length} color={C.red} small />
        <StatCard icon="✅" label="Resolved"     value={incidents.filter(i=>i.status==="resolved").length} color={C.green} small />
        <StatCard icon="⚠️" label="High Priority" value={incidents.filter(i=>i.severity==="high").length} color={C.amber} small />
      </div>
      <button onClick={() => setShowForm(!showForm)} style={{ ...btnPrimary, width:"100%", marginBottom:14 }}>{showForm ? "✕ Cancel" : "🚨 Log New Incident"}</button>
      {showForm && (
        <div style={{ background:C.raised, borderRadius:14, border:`1.5px solid ${C.red}44`, padding:"16px", marginBottom:14, display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <p style={{ margin:"0 0 5px", fontSize:12, fontWeight:700, color:C.n600 }}>Type</p>
              <select style={{ width:"100%", height:38, borderRadius:8, border:`1.5px solid ${C.n200}`, padding:"0 10px", fontFamily:"inherit", fontSize:13 }}>
                {["Medical","Technical","Security","Logistics","Other"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <p style={{ margin:"0 0 5px", fontSize:12, fontWeight:700, color:C.n600 }}>Severity</p>
              <select style={{ width:"100%", height:38, borderRadius:8, border:`1.5px solid ${C.n200}`, padding:"0 10px", fontFamily:"inherit", fontSize:13 }}>
                {["High","Medium","Low"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><p style={{ margin:"0 0 5px", fontSize:12, fontWeight:700, color:C.n600 }}>Description</p><textarea rows={2} style={{ width:"100%", borderRadius:8, border:`1.5px solid ${C.n200}`, padding:"8px 12px", fontFamily:"inherit", fontSize:13, resize:"none", boxSizing:"border-box" }} placeholder="What happened? Where?" /></div>
          <div><p style={{ margin:"0 0 5px", fontSize:12, fontWeight:700, color:C.n600 }}>Action Taken</p><textarea rows={2} style={{ width:"100%", borderRadius:8, border:`1.5px solid ${C.n200}`, padding:"8px 12px", fontFamily:"inherit", fontSize:13, resize:"none", boxSizing:"border-box" }} placeholder="What was done to address it?" /></div>
          <button style={btnPrimary}>Submit Incident Report</button>
        </div>
      )}
      <Card title="Incident Log">
        {incidents.map((inc, i) => (
          <div key={inc.id} style={{ padding:"12px 0", borderBottom: i < incidents.length-1 ? `1px solid ${C.n200}` : "none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:18 }}>{typeIcon[inc.type]}</span>
              <span style={{ fontSize:13, fontWeight:700, color:C.n900, flex:1 }}>{inc.title}</span>
              <Pill color={inc.severity==="high" ? "red" : inc.severity==="medium" ? "amber" : "teal"} label={inc.severity} />
              <Pill color={inc.status==="open" ? "red" : "green"} label={inc.status} />
            </div>
            <div style={{ display:"flex", gap:12, marginBottom:6 }}>
              <span style={{ fontSize:11, color:C.n500 }}>{inc.id}</span>
              <span style={{ fontSize:11, color:C.n500 }}>👤 {inc.reporter}</span>
              <span style={{ fontSize:11, color:C.n500 }}>⏰ {inc.time}</span>
            </div>
            <div style={{ background: inc.status==="open" ? C.amberLt : C.greenLt, borderRadius:8, padding:"8px 10px" }}>
              <p style={{ margin:0, fontSize:12, color: inc.status==="open" ? C.amber : C.green, fontWeight:500 }}>📄 {inc.action}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 18 — Waitlist & Capacity
// ──────────────────────────────────────────────────────────────
function WaitlistCapacity() {
  const total = 250, registered = 234, checkedIn = 178;
  const available = total - registered;
  const pct = Math.round(registered / total * 100);
  const waitlist = [
    { pos:1, name:"Rizza Mendoza",  phone:"+63 924 111 2222", requested:"General", since:"Jun 10", notified:false },
    { pos:2, name:"Bong Castillo",  phone:"+63 925 333 4444", requested:"VIP",     since:"Jun 11", notified:false },
    { pos:3, name:"Tricia Navarro", phone:"+63 926 555 6666", requested:"General", since:"Jun 12", notified:true  },
    { pos:4, name:"Roy Villanueva", phone:"+63 927 777 8888", requested:"General", since:"Jun 13", notified:false },
    { pos:5, name:"Cathy Soriano",  phone:"+63 928 999 0000", requested:"General", since:"Jun 14", notified:false },
  ];

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
        <StatCard icon="🏟️" label="Capacity"   value={total}     color={C.brand} small />
        <StatCard icon="📝" label="Registered" value={registered} color={C.teal}  small />
        <StatCard icon="✅" label="Checked In" value={checkedIn}  color={C.green} small />
        <StatCard icon="⚠️" label="Available"  value={available}  color={available > 10 ? C.green : C.red} small />
      </div>
      <Card title="Venue Capacity" mb={14}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:13, color:C.n600, fontWeight:600 }}>Capacity utilization</span>
          <span style={{ fontSize:14, fontWeight:800, color: pct >= 95 ? C.red : pct >= 80 ? C.amber : C.green }}>{pct}%</span>
        </div>
        <div style={{ height:16, background:C.n100, borderRadius:9999, overflow:"hidden", position:"relative" }}>
          <div style={{ height:"100%", width:`${pct}%`, background: pct >= 95 ? C.red : pct >= 80 ? C.amber : C.green, borderRadius:9999 }} />
        </div>
        <div style={{ background: pct >= 95 ? C.redLt : pct >= 80 ? C.amberLt : C.greenLt, borderRadius:10, padding:"10px 14px", marginTop:10 }}>
          <p style={{ margin:0, fontSize:13, fontWeight:600, color: pct >= 95 ? C.red : pct >= 80 ? C.amber : C.green }}>
            {pct >= 95 ? "🚨 Venue nearly full! Only " + available + " spots remain." : "⚠️ " + available + " spots still available."}
          </p>
        </div>
      </Card>
      <Card title="Availability by Ticket Type" mb={14}>
        {[["VIP",50,45,"#8B5CF6"],["General",180,168,C.teal],["Staff",25,21,C.amber]].map(([type,total,sold,color]) => (
          <div key={type} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:9999, background:color }} />
                <span style={{ fontSize:13, fontWeight:700, color:C.n800 }}>{type}</span>
              </div>
              <span style={{ fontSize:13, color:C.n600 }}>{sold}/{total} · <strong style={{ color: total-sold < 3 ? C.red : C.green }}>{total-sold} left</strong></span>
            </div>
            <ProgressBar value={Math.round(sold/total*100)} color={color} height={8} />
          </div>
        ))}
      </Card>
      <Card title={`Waitlist (${waitlist.length} people)`}>
        <div style={{ background:C.amberLt, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
          <p style={{ margin:0, fontSize:12, color:C.amber, fontWeight:600 }}>⚠️ {available} spots available. Approve waitlist members to fill them.</p>
        </div>
        {waitlist.map((w, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom: i < waitlist.length-1 ? `1px solid ${C.n200}` : "none" }}>
            <div style={{ width:28, height:28, borderRadius:9999, background:C.n100, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:C.n600, flexShrink:0 }}>#{w.pos}</div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.n800 }}>{w.name}</p>
              <p style={{ margin:0, fontSize:11, color:C.n500 }}>{w.phone} · {w.requested} · Since {w.since}</p>
            </div>
            {w.notified && <Pill color="teal" label="📱 Notified" />}
            <div style={{ display:"flex", gap:6 }}>
              <button style={{ ...btnPrimary, fontSize:11, padding:"5px 12px" }}>Approve</button>
              <button style={{ ...btnGhost,   fontSize:11, padding:"5px 10px" }}>Remove</button>
            </div>
          </div>
        ))}
        <button style={{ ...btnOutline, marginTop:12, width:"100%", fontSize:12 }}>📱 Notify All Waitlisted</button>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SCREEN 19 — My Events (Multi-event hub)
// ──────────────────────────────────────────────────────────────
function MyEvents({ setActive }) {
  const events = [
    { id:1, title:"Santos Family Reunion 2026", type:"Reunion",   date:"Jun 15, 2026", guests:234, status:"live",     revenue:"₱55,000", venue:"SMX Davao"        },
    { id:2, title:"Dela Cruz Wedding",          type:"Wedding",   date:"Jul 4, 2026",  guests:180, status:"upcoming", revenue:"₱48,000", venue:"Marco Polo Hotel" },
    { id:3, title:"Davao Tech Summit 2026",     type:"Corporate", date:"Jul 22, 2026", guests:350, status:"upcoming", revenue:"₱87,500", venue:"SMX Hall A"       },
    { id:4, title:"Buhangin Barangay Fiesta",   type:"Community", date:"May 3, 2026",  guests:420, status:"past",     revenue:"₱32,000", venue:"Barangay Plaza"   },
    { id:5, title:"St. Peter Parish Gala",      type:"Fundraiser",date:"Apr 20, 2026", guests:95,  status:"past",     revenue:"₱28,750", venue:"Parish Hall"      },
    { id:6, title:"SPNHS '90 School Reunion",   type:"Reunion",   date:"Aug 10, 2026", guests:0,   status:"draft",    revenue:"₱0",      venue:"TBD"              },
  ];
  const typeIcon = { Reunion:"👨‍👩‍👧‍👦", Wedding:"💍", Corporate:"🏢", Community:"🎉", Fundraiser:"❤️", School:"🎓" };

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
        <StatCard icon="📅" label="Total"     value={events.length}                          color={C.brand} small />
        <StatCard icon="🔴" label="Live Now"  value={events.filter(e=>e.status==="live").length}     color={C.red}   small />
        <StatCard icon="⏳" label="Upcoming"  value={events.filter(e=>e.status==="upcoming").length} color={C.teal}  small />
        <StatCard icon="✅" label="Completed" value={events.filter(e=>e.status==="past").length}     color={C.green} small />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {["All","Live","Upcoming","Past","Draft"].map(f => (
            <button key={f} style={{ padding:"5px 12px", borderRadius:9999, border:"none", cursor:"pointer", fontWeight:700, fontSize:11, fontFamily:"inherit", background:f==="All" ? C.brand : C.n100, color:f==="All" ? "#fff" : C.n600 }}>{f}</button>
          ))}
        </div>
        <button style={btnPrimary}>+ New Event</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {events.map((ev) => (
          <div key={ev.id} style={{ background:C.raised, borderRadius:14, border:`1.5px solid ${ev.status==="live" ? C.brand+"66" : C.n200}`, padding:"14px 16px", cursor:"pointer" }} onClick={() => setActive("dashboard")}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:12, background: ev.status==="live" ? C.brandLt : ev.status==="past" ? C.n100 : C.tealLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                {typeIcon[ev.type] || "🎉"}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                  <p style={{ margin:0, fontSize:14, fontWeight:800, color:C.n900 }}>{ev.title}</p>
                  <Pill color={ev.status==="live" ? "brand" : ev.status==="upcoming" ? "teal" : ev.status==="draft" ? "neutral" : "green"} label={ev.status==="live" ? "● LIVE" : ev.status} />
                </div>
                <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:C.n500 }}>📅 {ev.date}</span>
                  <span style={{ fontSize:11, color:C.n500 }}>📍 {ev.venue}</span>
                  <span style={{ fontSize:11, color:C.n500 }}>👥 {ev.guests} guests</span>
                  <span style={{ fontSize:11, fontWeight:700, color:C.green }}>{ev.revenue}</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {ev.status==="live"     && <button style={{ ...btnPrimary, fontSize:11, padding:"5px 12px" }} onClick={e=>{e.stopPropagation();setActive("dashboard");}}>Open →</button>}
                {ev.status==="upcoming" && <button style={{ ...btnOutline, fontSize:11, padding:"5px 12px" }}>Manage</button>}
                {ev.status==="draft"    && <button style={{ ...btnOutline, fontSize:11, padding:"5px 10px" }}>Edit</button>}
                {ev.status==="past"     && <button style={{ ...btnGhost,   fontSize:11, padding:"5px 10px" }}>Report</button>}
              </div>
            </div>
            {ev.status==="live" && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.n200}` }}>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.brand }}>178 checked in</span>
                  <span style={{ fontSize:12, color:C.n500 }}>of 234 registered</span>
                  <div style={{ flex:1 }}><ProgressBar value={76} color={C.brand} height={6} /></div>
                  <span style={{ fontSize:12, fontWeight:700, color:C.brand }}>76%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}



// ─── SHARED UI COMPONENTS ─────────────────────────────────────

function Card({ title, children, mb = 0 }) {
  return (
    <div style={{ background: C.raised, borderRadius: 14, border: `1.5px solid ${C.n200}`, padding: "14px 16px", marginBottom: mb }}>
      <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: C.n600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</p>
      {children}
    </div>
  );
}

function Pill({ color, label }) {
  const map = {
    brand:   [C.brandLt, C.brandDk],
    green:   [C.greenLt, C.green],
    amber:   [C.amberLt, C.amber],
    red:     [C.redLt,   C.red],
    teal:    [C.tealLt,  C.teal],
    blue:    [C.blueLt,  C.blue],
    purple:  ["#F3E8FF", "#7C3AED"],
    neutral: [C.n100,    C.n600],
  };
  const [bg, text] = map[color] ?? map.neutral;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 9999, background: bg, color: text, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span>;
}

function ProgressBar({ value, color, height = 8 }) {
  return (
    <div style={{ height, background: C.n100, borderRadius: 9999, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: color, borderRadius: 9999, transition: "width 400ms" }} />
    </div>
  );
}

function StatChip({ icon, value, label }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>{icon} {value}</p>
      <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{label}</p>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, small }) {
  return (
    <div style={{ background: C.raised, borderRadius: 12, border: `1.5px solid ${C.n200}`, padding: small ? "10px 12px" : "14px 14px" }}>
      <span style={{ fontSize: small ? 18 : 22 }}>{icon}</span>
      <p style={{ margin: "4px 0 2px", fontSize: small ? 20 : 24, fontWeight: 800, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: 11, color: C.n500, fontWeight: 600 }}>{label}</p>
      {sub && <p style={{ margin: "2px 0 0", fontSize: 11, color: C.green, fontWeight: 600 }}>{sub}</p>}
    </div>
  );
}

function KPICard({ label, value, change, color, icon }) {
  return (
    <div style={{ background: C.raised, borderRadius: 12, border: `1.5px solid ${C.n200}`, padding: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 11, color: C.green, fontWeight: 700, background: C.greenLt, padding: "2px 8px", borderRadius: 9999 }}>{change}</span>
      </div>
      <p style={{ margin: "8px 0 2px", fontSize: 22, fontWeight: 800, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: 11, color: C.n500, fontWeight: 600 }}>{label}</p>
    </div>
  );
}

function MiniStat({ label, value, color, pct }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: C.n600, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 700 }}>{pct}%</span>
      </div>
      <ProgressBar value={pct} color={color} height={5} />
      <span style={{ fontSize: 11, color: C.n400 }}>{value}</span>
    </div>
  );
}

function BudgetStat({ label, value, color }) {
  return (
    <div style={{ background: color + "11", borderRadius: 10, padding: "10px 12px", border: `1px solid ${color}33` }}>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: 11, color: C.n500, fontWeight: 600 }}>{label}</p>
    </div>
  );
}

function FormField({ label, placeholder, type = "text" }) {
  return (
    <div>
      <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 700, color: C.n600 }}>{label}</p>
      <input type={type} placeholder={placeholder} style={{ width: "100%", height: 40, borderRadius: 8, border: `1.5px solid ${C.n200}`, background: C.n100, padding: "0 14px", fontSize: 13, fontFamily: "inherit", color: C.n800, boxSizing: "border-box" }} />
    </div>
  );
}

function statusBg(s)     { return s === "checked-in" ? C.greenLt : s === "walk-in" ? C.brandLt : C.amberLt; }
function statusColor2(s) { return s === "checked-in" ? C.green   : s === "walk-in" ? C.brand   : C.amber;   }
function feedIcon(type)  { return type === "checkin" ? "✅" : type === "walkin" ? "🚶" : type === "vip" ? "⭐" : type === "seating" ? "🪑" : "💳"; }

const btnPrimary = { background: C.brand, color: "#fff", border: "none", borderRadius: 9999, padding: "10px 20px", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer" };
const btnOutline = { background: "transparent", color: C.brand, border: `1.5px solid ${C.brand}`, borderRadius: 9999, padding: "8px 16px", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer" };
const btnGhost   = { background: C.n100, color: C.n700, border: "none", borderRadius: 9999, padding: "10px 16px", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer" };
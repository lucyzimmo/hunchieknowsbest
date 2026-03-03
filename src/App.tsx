import { useState, useEffect, useRef, CSSProperties, ReactNode } from "react";

// ─── TYPES ────────────────────────────────────────────────────
type Mood = "happy" | "neutral" | "tired" | "excited";
type Screen = "onboarding1" | "session" | "break" | "summary" | "dashboard" | "settings";
type SettingsTab = "hunchie" | "goals" | "nudges" | "insights";
type DashTab = "today" | "week";
type NudgeIntensity = "gentle" | "standard" | "strong";
type NudgeTrigger = "stillness" | "posture" | "both";

interface Goals {
  posture: boolean;
  tension: boolean;
  mindful: boolean;
}

// ─── CONSTANTS ────────────────────────────────────────────────
const COLORS = {
  pink: "#F4A7B9",
  brown: "#6B3A2A",
  lavender: "#C9B8E8",
  yellow: "#F7D98B",
  mint: "#A8E6CF",
  teal: "#4ABCB0",
  white: "#FFFAF8",
  softGray: "#F5F0F0",
  text: "#3D2016",
  lightPink: "#FDE8EF",
  coral: "#F7A07A",
} as const;

// ─── SUB-COMPONENTS ───────────────────────────────────────────
const Hunchie = ({ mood = "happy" as Mood, size = 80, animate = false }) => {
  const colors: Record<Mood, { body: string; cheek: string; eye: string }> = {
    happy:   { body: "#C8956C", cheek: "#F4A7B9", eye: "#3D2016" },
    neutral: { body: "#C8956C", cheek: "#F7D98B", eye: "#3D2016" },
    tired:   { body: "#A07850", cheek: "#C9B8E8", eye: "#3D2016" },
    excited: { body: "#D4A574", cheek: "#F4A7B9", eye: "#3D2016" },
  };
  const c = colors[mood];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={animate ? { animation: "bounce 1s ease-in-out infinite" } : {}}
    >
      <ellipse cx="50" cy="55" rx="38" ry="32" fill="#8B6040" />
      {[...Array(8)].map((_, i) => (
        <ellipse
          key={i}
          cx={22 + i * 8}
          cy={26 + (i % 2) * 4}
          rx="4"
          ry="10"
          fill="#6B4020"
          transform={`rotate(${-20 + i * 5} ${22 + i * 8} ${26 + (i % 2) * 4})`}
        />
      ))}
      <ellipse cx="50" cy="62" rx="28" ry="24" fill={c.body} />
      <ellipse cx="50" cy="58" rx="22" ry="20" fill="#E8C09A" />
      <circle cx="42" cy="52" r="4" fill={c.eye} />
      <circle cx="58" cy="52" r="4" fill={c.eye} />
      <circle cx="43" cy="51" r="1.5" fill="white" />
      <circle cx="59" cy="51" r="1.5" fill="white" />
      <ellipse cx="50" cy="59" rx="4" ry="3" fill="#8B4050" />
      <ellipse cx="38" cy="60" rx="5" ry="3.5" fill={c.cheek} opacity="0.7" />
      <ellipse cx="62" cy="60" rx="5" ry="3.5" fill={c.cheek} opacity="0.7" />
      {mood === "happy" || mood === "excited" ? (
        <path d="M44 65 Q50 71 56 65" stroke={c.eye} strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : mood === "tired" ? (
        <path d="M44 67 Q50 65 56 67" stroke={c.eye} strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <line x1="44" y1="66" x2="56" y2="66" stroke={c.eye} strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
};

const ProgressBar = ({ value, max, color, height = 12 }: { value: number; max: number; color: string; height?: number }) => (
  <div style={{ background: "#E8D5D0", borderRadius: 999, height, overflow: "hidden", width: "100%" }}>
    <div style={{
      height: "100%",
      width: `${(value / max) * 100}%`,
      background: color,
      borderRadius: 999,
      transition: "width 0.5s ease",
    }} />
  </div>
);

const Pill = ({ children, active, onClick, color }: { children: ReactNode; active: boolean; onClick: () => void; color: string }) => (
  <button
    onClick={onClick}
    style={{
      padding: "6px 16px",
      borderRadius: 999,
      border: `2px solid ${active ? color : "#E0D0CC"}`,
      background: active ? color : "white",
      color: active ? "white" : COLORS.text,
      fontFamily: "'Josefin Sans', sans-serif",
      fontWeight: active ? 700 : 400,
      fontSize: 13,
      cursor: "pointer",
      transition: "all 0.2s",
    }}
  >
    {children}
  </button>
);

const Card = ({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{
    background: "white",
    borderRadius: 20,
    padding: "20px",
    boxShadow: "0 4px 20px rgba(107,58,42,0.08)",
    ...style,
  }}>
    {children}
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding1");
  const [onboardStep, setOnboardStep] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [hits, setHits] = useState(0);
  const [hp, setHp] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("hunchie");
  const [nudgeIntensity, setNudgeIntensity] = useState<NudgeIntensity>("standard");
  const [nudgeTrigger, setNudgeTrigger] = useState<NudgeTrigger>("both");
  const [goals, setGoals] = useState<Goals>({ posture: true, tension: false, mindful: true });
  const [dashTab, setDashTab] = useState<DashTab>("today");
  const [pairing, setPairing] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pairRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setSessionTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const formatTime = (s: number): string => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}hr ${m}min ${sec}s`;
  };

  const startPairing = () => {
    setOnboardStep(2);
    setPairing(0);
    pairRef.current = setInterval(() => {
      setPairing((p) => {
        if (p >= 100) {
          if (pairRef.current) clearInterval(pairRef.current);
          setOnboardStep(3);
          return 100;
        }
        return p + 5;
      });
    }, 150);
  };

  const handleHit = () => {
    setHits((h) => h + 1);
    setHp((h) => Math.max(0, h - 1));
  };

  const endSession = () => {
    setIsRunning(false);
    setScreen("summary");
  };

  // ─── SHARED STYLES ──────────────────────────────────────────
  const bgStyle: CSSProperties = {
    background: "linear-gradient(135deg, #FDE8EF 0%, #FFF5E8 50%, #E8F4FD 100%)",
    minHeight: "100vh",
    fontFamily: "'Outfit', 'Josefin Sans', sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  };

  const phoneStyle: CSSProperties = {
    width: 375,
    minHeight: 720,
    background: COLORS.white,
    borderRadius: 40,
    boxShadow: "0 30px 80px rgba(107,58,42,0.2)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  };

  const headerStyle: CSSProperties = {
    padding: "20px 24px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  // ─── INLINE COMPONENTS (need state access) ─────────────────
  const Title = ({ children, size = 22 }: { children: ReactNode; size?: number }) => (
    <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: size, color: COLORS.brown, letterSpacing: "0.02em" }}>
      {children}
    </div>
  );

  const Body = ({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) => (
    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: COLORS.text, lineHeight: 1.5, ...style }}>
      {children}
    </div>
  );

  const BigBtn = ({ children, onClick, color = COLORS.pink, style = {} }: {
    children: ReactNode;
    onClick: () => void;
    color?: string;
    style?: CSSProperties;
  }) => (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: 999,
        border: "none",
        background: color,
        color: "white",
        fontFamily: "'Josefin Sans', sans-serif",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
        boxShadow: `0 4px 15px ${color}80`,
        transition: "transform 0.1s, box-shadow 0.1s",
        ...style,
      }}
      onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );

  const NavBar = ({ active }: { active: Screen }) => {
    const tabs: { id: Screen; icon: string; label: string }[] = [
      { id: "dashboard", icon: "📊", label: "Today" },
      { id: "session",   icon: "▶️",  label: "Session" },
      { id: "settings",  icon: "⚙️",  label: "Settings" },
    ];
    return (
      <div style={{ display: "flex", borderTop: `1px solid ${COLORS.lightPink}`, padding: "8px 0 12px", background: "white" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setScreen(t.id)}
            style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{
              fontSize: 10,
              fontFamily: "'Josefin Sans', sans-serif",
              color: active === t.id ? COLORS.teal : "#B0A0A0",
              fontWeight: active === t.id ? 700 : 400,
            }}>
              {t.label}
            </span>
            {active === t.id && <div style={{ width: 4, height: 4, borderRadius: 999, background: COLORS.teal }} />}
          </button>
        ))}
      </div>
    );
  };

  // ─── ONBOARDING ──────────────────────────────────────────────
  if (screen === "onboarding1") {
    return (
      <div style={bgStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />
        <div style={phoneStyle}>
          <div style={{ flex: 1, padding: "32px 24px", display: "flex", flexDirection: "column" }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: 28, color: COLORS.brown }}>
                Welcome to Hunchie
              </div>
              <Body style={{ color: "#A08080", marginTop: 4 }}>Your posture companion 🌸</Body>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, marginTop: 20 }}>
              {[
                { step: 1, label: "Place Hunchie",  active: onboardStep === 0,                   done: onboardStep > 0  },
                { step: 2, label: "Pair Hunchie",   active: onboardStep >= 1 && onboardStep < 3, done: onboardStep >= 3 },
                { step: 3, label: "Start Session",  active: onboardStep >= 3,                    done: false            },
              ].map((s) => (
                <div
                  key={s.step}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", borderRadius: 14,
                    background: s.active ? COLORS.lightPink : s.done ? "#F0FBF7" : COLORS.softGray,
                    border: `2px solid ${s.active ? COLORS.pink : s.done ? COLORS.mint : "transparent"}`,
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: s.done ? COLORS.teal : s.active ? COLORS.pink : "#DDD",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: 13,
                  }}>
                    {s.done ? "✓" : s.step}
                  </div>
                  <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: s.active ? 700 : 400, fontSize: 15, color: s.active ? COLORS.brown : "#A090A0" }}>
                    STEP {s.step}: {s.label}
                  </span>
                </div>
              ))}
            </div>

            {onboardStep === 0 && (
              <div style={{ flex: 2, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🖥️</div>
                  <Body style={{ textAlign: "center", color: "#A08080" }}>
                    Place Hunchie at the <strong>edge of your desk</strong>, facing your workspace
                  </Body>
                </div>
                <BigBtn onClick={() => setOnboardStep(1)} color={COLORS.pink}>Next →</BigBtn>
              </div>
            )}

            {onboardStep === 1 && (
              <div style={{ flex: 2, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16 }}>
                <Hunchie mood="neutral" size={90} />
                <Body style={{ textAlign: "center", color: "#A08080" }}>Hold Hunchie for <strong>3 seconds</strong> to pair</Body>
                <BigBtn onClick={startPairing} color={COLORS.lavender} style={{ color: COLORS.brown }}>Hold to Pair</BigBtn>
              </div>
            )}

            {onboardStep === 2 && (
              <div style={{ flex: 2, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16 }}>
                <Hunchie mood="neutral" size={90} animate />
                <Body style={{ textAlign: "center", color: "#A08080" }}>Pairing… {Math.round((pairing / 100) * 5)} sec left</Body>
                <ProgressBar value={pairing} max={100} color={COLORS.teal} height={14} />
              </div>
            )}

            {onboardStep === 3 && (
              <div style={{ flex: 2, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16 }}>
                <Hunchie mood="happy" size={90} animate />
                <div style={{ textAlign: "center" }}>
                  <Title>Setup Complete!! 🎉</Title>
                  <Body style={{ color: "#A08080", marginTop: 4 }}>Hunchie is ready to support you</Body>
                </div>
                <BigBtn onClick={() => setScreen("session")} color={COLORS.teal}>Start Session</BigBtn>
                <button
                  onClick={() => setScreen("dashboard")}
                  style={{ background: "none", border: "none", color: "#A08080", fontFamily: "'Outfit', sans-serif", fontSize: 13, cursor: "pointer" }}
                >
                  ← Back to Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── SESSION ─────────────────────────────────────────────────
  if (screen === "session") {
    const mood: Mood = hits === 0 ? "happy" : hits <= 2 ? "neutral" : "tired";
    return (
      <div style={bgStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />
        <div style={phoneStyle}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {!isRunning && sessionTime === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", gap: 24, background: "linear-gradient(180deg, #C8E6FF 0%, #A8D8EA 40%, #A8E6CF 100%)" }}>
                <div style={{ position: "absolute", top: 20, right: 20, fontSize: 20, cursor: "pointer" }} onClick={() => setScreen("settings")}>⚙️</div>
                <Hunchie mood="happy" size={120} animate />
                <div style={{ textAlign: "center" }}>
                  <Title size={26}>Ready, Hunchie? 🌸</Title>
                  <Body style={{ color: "#5A7A6A", marginTop: 4 }}>Let's have a great session!</Body>
                </div>
                <BigBtn
                  onClick={() => { setIsRunning(true); setHits(0); setHp(5); setSessionTime(0); }}
                  color={COLORS.teal}
                  style={{ width: 200 }}
                >
                  Start
                </BigBtn>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #C8E6FF 0%, #A8D8EA 40%, #A8E6CF 100%)" }}>
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 12, color: "#4A7A6A" }}>
                    ⏱️ {formatTime(sessionTime)}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setIsRunning((r) => !r)}
                      style={{ background: "rgba(255,255,255,0.6)", border: "none", borderRadius: 999, width: 32, height: 32, cursor: "pointer", fontSize: 14 }}
                    >
                      {isRunning ? "⏸" : "▶"}
                    </button>
                    <button
                      onClick={() => setScreen("settings")}
                      style={{ background: "rgba(255,255,255,0.6)", border: "none", borderRadius: 999, width: 32, height: 32, cursor: "pointer", fontSize: 14 }}
                    >
                      ⚙️
                    </button>
                    <button
                      onClick={endSession}
                      style={{ background: "rgba(255,255,255,0.6)", border: "none", borderRadius: 999, padding: "4px 12px", height: 32, cursor: "pointer", fontFamily: "'Josefin Sans', sans-serif", fontSize: 12, color: "#C05050" }}
                    >
                      End
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Hunchie mood={mood} size={130} />
                  <Body style={{ color: "#4A7A6A", fontSize: 12 }}>
                    {mood === "happy" ? "Great posture! Keep it up 🌸" : mood === "neutral" ? "Watch your posture 🤔" : "Hunchie needs a treat! 🍎"}
                  </Body>
                </div>

                <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: "20px 20px 0 0", padding: "16px 20px 12px", backdropFilter: "blur(10px)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <Body style={{ fontSize: 11, color: "#A08080" }}>HP (Hunchie Power)</Body>
                      <ProgressBar value={hp} max={5} color={hp > 2 ? COLORS.teal : COLORS.coral} height={10} />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
                      <button
                        onClick={() => setHp((h) => Math.min(5, h + 1))}
                        style={{ background: COLORS.yellow, border: "none", borderRadius: 999, padding: "6px 14px", fontFamily: "'Josefin Sans', sans-serif", fontSize: 12, cursor: "pointer", fontWeight: 700 }}
                      >
                        Feed 🍎
                      </button>
                    </div>
                  </div>
                  <Body style={{ fontSize: 12, color: "#8A7070", marginTop: 4 }}># of times hit: <strong>{hits}</strong></Body>
                  <div style={{ marginTop: 12 }}>
                    <BigBtn onClick={handleHit} color={COLORS.coral} style={{ padding: "10px" }}>
                      🔔 Simulate Hit
                    </BigBtn>
                  </div>
                </div>
              </div>
            )}
            <NavBar active="session" />
          </div>
        </div>
      </div>
    );
  }

  // ─── BREAK ───────────────────────────────────────────────────
  if (screen === "break") {
    return (
      <div style={bgStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />
        <div style={phoneStyle}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 16, textAlign: "center" }}>
            <Hunchie mood="excited" size={100} animate />
            <div style={{ background: COLORS.lightPink, borderRadius: 20, padding: 20, width: "100%" }}>
              <Body style={{ fontSize: 13, color: "#A08080" }}>Break: exercised for</Body>
              <Title size={28}>5 minutes</Title>
              <div style={{ marginTop: 12, padding: "10px 16px", background: COLORS.yellow, borderRadius: 12 }}>
                <Title>CONGRATS !!! 🎉</Title>
              </div>
              <Body style={{ marginTop: 12, color: "#8A7070" }}>
                You received a treat! 🍎<br />Feed to Hunchie to recover HP
              </Body>
            </div>
            <BigBtn onClick={() => setScreen("session")} color={COLORS.teal}>Back to Session</BigBtn>
          </div>
          <NavBar active="session" />
        </div>
      </div>
    );
  }

  // ─── SUMMARY ─────────────────────────────────────────────────
  if (screen === "summary") {
    return (
      <div style={bgStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />
        <div style={phoneStyle}>
          <div style={{ flex: 1, padding: "24px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <Title size={24}>Session Summary 🌸</Title>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Hunchie mood={hits <= 2 ? "happy" : "neutral"} size={100} />
            </div>
            <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 13, color: "#A08080", textAlign: "center" }}>
              Hunchie's emotional state: {hits === 0 ? "😊 Great!" : hits <= 2 ? "🙂 Good" : "😐 Okay"}
            </div>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {[
                  { label: "Time spent",   value: formatTime(sessionTime).split(" ")[0], color: COLORS.brown },
                  { label: "# of hits",    value: String(hits),                          color: COLORS.coral },
                  { label: "HP remaining", value: `${hp}/5`,                             color: COLORS.teal  },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: 28, color }}>{value}</div>
                    <Body style={{ color: "#A08080", fontSize: 12 }}>{label}</Body>
                  </div>
                ))}
              </div>
            </Card>
            <Card style={{ background: COLORS.lightPink }}>
              <Title size={14}>How was your environment?</Title>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {["Chair 🪑", "Floor 🧘", "Cushion 💺", "Standing 🧍"].map((e) => (
                  <Pill key={e} active={false} onClick={() => {}} color={COLORS.pink}>{e}</Pill>
                ))}
              </div>
            </Card>
            <Card style={{ background: "#F0FBF7" }}>
              <Title size={14}>Noise level?</Title>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {["🔇 Silent", "🔉 Moderate", "🔊 Loud"].map((e) => (
                  <Pill key={e} active={false} onClick={() => {}} color={COLORS.teal}>{e}</Pill>
                ))}
              </div>
            </Card>
            <BigBtn onClick={() => { setScreen("session"); setSessionTime(0); setHits(0); setHp(5); }} color={COLORS.teal}>
              Start Again
            </BigBtn>
            <button
              onClick={() => setScreen("dashboard")}
              style={{ background: "none", border: "none", color: "#A08080", fontFamily: "'Outfit', sans-serif", fontSize: 13, cursor: "pointer", textAlign: "center" }}
            >
              View Dashboard →
            </button>
          </div>
          <NavBar active="session" />
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───────────────────────────────────────────────
  if (screen === "dashboard") {
    return (
      <div style={bgStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />
        <div style={phoneStyle}>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={headerStyle}>
              <Title size={26}>Dashboard</Title>
              <Hunchie mood="happy" size={40} />
            </div>
            <div style={{ display: "flex", gap: 8, padding: "0 24px 16px" }}>
              {(["today", "week"] as DashTab[]).map((t) => (
                <Pill key={t} active={dashTab === t} onClick={() => setDashTab(t)} color={COLORS.teal}>
                  {t === "today" ? "Today" : "This Week"}
                </Pill>
              ))}
            </div>
            <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {dashTab === "today" ? (
                <>
                  <Card>
                    <Title size={14}>TODAY</Title>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                      <div>
                        <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: 40, color: COLORS.brown }}>37</span>
                        <Body style={{ fontSize: 12, color: "#A08080" }}>mins spent today</Body>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: 40, color: COLORS.coral }}>4</span>
                        <Body style={{ fontSize: 12, color: "#A08080" }}>full hunches</Body>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <Body style={{ fontSize: 12, color: "#A08080" }}>HP status</Body>
                      <ProgressBar value={hp} max={5} color={COLORS.teal} />
                    </div>
                  </Card>
                  <Card style={{ background: "linear-gradient(135deg, #FDE8EF, #FFF5E8)" }}>
                    <Title size={14}>Today's Trend</Title>
                    <div style={{ marginTop: 10, height: 80, display: "flex", alignItems: "flex-end", gap: 6 }}>
                      {[30, 50, 20, 80, 40, 60, 35].map((h, i) => (
                        <div key={i} style={{ flex: 1, background: i === 4 ? COLORS.coral : COLORS.pink, borderRadius: "4px 4px 0 0", height: `${h}%`, opacity: 0.8 }} />
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      {["9am", "10", "11", "12", "1pm", "2", "3"].map((t) => (
                        <span key={t} style={{ fontSize: 9, color: "#B0A0A0", fontFamily: "'Outfit', sans-serif" }}>{t}</span>
                      ))}
                    </div>
                  </Card>
                </>
              ) : (
                <Card>
                  <Title size={14}>THIS WEEK</Title>
                  {[
                    { day: "Mon, Jun 27th", mins: 120, hunches: 2 },
                    { day: "Tue, Jun 28th", mins: 95,  hunches: 5 },
                    { day: "Wed, Jun 29th", mins: 145, hunches: 1 },
                    { day: "Thu, Jun 30th", mins: 60,  hunches: 8 },
                    { day: "Fri, Jul 1st",  mins: 37,  hunches: 4 },
                  ].map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${COLORS.lightPink}` : "none" }}>
                      <Body style={{ fontSize: 12 }}>{d.day}</Body>
                      <div style={{ display: "flex", gap: 12 }}>
                        <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, color: COLORS.teal, fontSize: 14 }}>{d.mins}m</span>
                        <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, color: COLORS.coral, fontSize: 14 }}>{d.hunches}🔔</span>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
            <div style={{ height: 20 }} />
          </div>
          <NavBar active="dashboard" />
        </div>
      </div>
    );
  }

  // ─── SETTINGS ────────────────────────────────────────────────
  if (screen === "settings") {
    return (
      <div style={bgStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />
        <div style={phoneStyle}>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={headerStyle}>
              <Title size={24}>Settings</Title>
            </div>
            <div style={{ display: "flex", gap: 6, padding: "0 20px 16px", overflowX: "auto" }}>
              {(["hunchie", "goals", "nudges", "insights"] as SettingsTab[]).map((t) => (
                <Pill key={t} active={settingsTab === t} onClick={() => setSettingsTab(t)} color={COLORS.brown}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Pill>
              ))}
            </div>

            <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {settingsTab === "hunchie" && (
                <Card>
                  <Title size={16}>Hunchie Device</Title>
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    {([
                      ["Status",  <span style={{ color: COLORS.teal, fontWeight: 700 }}>Connected ✓</span>],
                      ["Battery", "82%"],
                      ["Device",  "Hunchie 01"],
                    ] as [string, ReactNode][]).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${COLORS.lightPink}` }}>
                        <Body style={{ color: "#A08080" }}>{k}</Body>
                        <Body style={{ fontWeight: 500 }}>{v}</Body>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {["Rename", "Reconnect", "Disconnect"].map((a) => (
                        <button key={a} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: `1px solid ${COLORS.lavender}`, background: "white", fontFamily: "'Josefin Sans', sans-serif", fontSize: 11, cursor: "pointer", color: COLORS.brown }}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {settingsTab === "goals" && (
                <Card>
                  <Title size={16}>What are you working on?</Title>
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    {([
                      { key: "posture" as keyof Goals, label: "Posture 🧍" },
                      { key: "tension" as keyof Goals, label: "Tension 😤" },
                      { key: "mindful" as keyof Goals, label: "Stay Mindful 🧘" },
                    ]).map((g) => (
                      <label key={g.key} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={goals[g.key]}
                          onChange={(e) => setGoals((prev) => ({ ...prev, [g.key]: e.target.checked }))}
                          style={{ width: 20, height: 20, accentColor: COLORS.teal }}
                        />
                        <Body>{g.label}</Body>
                      </label>
                    ))}
                    <button style={{ marginTop: 8, background: "none", border: `2px dashed ${COLORS.pink}`, borderRadius: 10, padding: "8px", fontFamily: "'Josefin Sans', sans-serif", fontSize: 13, color: COLORS.pink, cursor: "pointer" }}>
                      + Add Custom
                    </button>
                  </div>
                </Card>
              )}

              {settingsTab === "nudges" && (
                <Card>
                  <Title size={16}>Nudges</Title>
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <Body style={{ fontWeight: 600, marginBottom: 8 }}>Intensity</Body>
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["gentle", "standard", "strong"] as NudgeIntensity[]).map((i) => (
                          <Pill key={i} active={nudgeIntensity === i} onClick={() => setNudgeIntensity(i)} color={COLORS.pink}>
                            {i.charAt(0).toUpperCase() + i.slice(1)}
                          </Pill>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Body style={{ fontWeight: 600, marginBottom: 8 }}>Trigger</Body>
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["stillness", "posture", "both"] as NudgeTrigger[]).map((t) => (
                          <Pill key={t} active={nudgeTrigger === t} onClick={() => setNudgeTrigger(t)} color={COLORS.lavender}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </Pill>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Body style={{ fontWeight: 600, marginBottom: 8 }}>Sensitivity</Body>
                      <input type="range" min={0} max={100} defaultValue={30} style={{ width: "100%", accentColor: COLORS.teal }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Body style={{ fontSize: 11, color: "#A08080" }}>Low</Body>
                        <Body style={{ fontSize: 11, color: "#A08080" }}>High</Body>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {settingsTab === "insights" && (
                <Card>
                  <Title size={16}>Insights</Title>
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Real-time nudges", val: "On"  },
                      { label: "Daily summary",    val: "7:30" },
                      { label: "Weekly report",    val: "On"  },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.lightPink}` }}>
                        <Body>{label}</Body>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Body style={{ color: COLORS.teal, fontWeight: 600 }}>{val}</Body>
                          <span style={{ color: "#C0B0B0" }}>›</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
            <div style={{ height: 20 }} />
          </div>
          <NavBar active="settings" />
        </div>
      </div>
    );
  }

  return null;
}
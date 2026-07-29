// Direction A — Confident Indigo
// Modern fintech: deep electric indigo, warm cream surfaces, geometric sans
// with italic-serif accents. Optimised for confident, clear data dashboards.

function DirectionA() {
  return (
    <div className="ab A col gap-24">
      {/* Top: identity + wordmark */}
      <div className="row gap-24" style={{ alignItems: 'stretch' }}>
        <div className="panel col gap-12" style={{ flex: '0 0 320px', alignItems: 'flex-start' }}>
          <div className="label">Mark</div>
          <svg viewBox="0 0 120 120" width="96" height="96" aria-hidden>
            <rect x="0" y="0" width="120" height="120" rx="26" fill="var(--brand)" />
            <path d="M28 86 V34 H56 C72 34 80 42 80 54 C80 62 75 68 67 70 L86 86 H72 L54 70 H40 V86 Z M40 60 H56 C64 60 68 57 68 52 C68 47 64 44 56 44 H40 Z"
                  fill="#fff" />
          </svg>
          <div className="col gap-4">
            <div className="h-sans" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
              Rateline
            </div>
            <div className="h-serif" style={{ fontSize: 14, color: 'var(--mute)' }}>
              <em>finance, on the line.</em>
            </div>
          </div>
        </div>

        <div className="panel col gap-12" style={{ flex: 1 }}>
          <div className="label">Voice</div>
          <div className="h-sans" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.03em' }}>
            Clarity, <span className="h-serif" style={{ color: 'var(--brand)' }}>compounded.</span>
          </div>
          <div style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 540 }}>
            Confident, plain-spoken, never gimmicky. We give brokers and underwriters the
            shortest line between the question and the number.
          </div>
          <div className="row gap-8" style={{ marginTop: 6 }}>
            <button className="btn btn-primary">New application →</button>
            <button className="btn btn-secondary">View pipeline</button>
            <button className="btn btn-ghost">Settings</button>
          </div>
        </div>
      </div>

      {/* Palette */}
      <div className="col gap-12">
        <div className="label">Palette</div>
        <div className="row gap-12">
          <div className="swatch" style={{ background: 'var(--brand)', color: '#fff' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Indigo / 600</div><div className="mono">#2A3AFF</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--brand-deep)', color: '#fff' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Indigo / 900</div><div className="mono">#161D7A</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--accent)', color: '#0b1020' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Highlight</div><div className="mono">#FFD84D</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--ink)', color: '#fff' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Ink</div><div className="mono">#0B1020</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--bg)', color: 'var(--ink)', border: '1px solid var(--line)' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Canvas</div><div className="mono">#FBFAF8</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--panel)', color: 'var(--ink)', border: '1px solid var(--line)' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Panel</div><div className="mono">#FFFFFF</div></div>
          </div>
        </div>
      </div>

      {/* Type */}
      <div className="row gap-24">
        <div className="panel col gap-8" style={{ flex: 1 }}>
          <div className="label">Display · Geist</div>
          <div className="h-sans" style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 0.95 }}>
            £1,284,920
          </div>
          <div className="h-sans" style={{ fontSize: 22, fontWeight: 600 }}>
            Pipeline value, week 21
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
            Body text sits at 14–15px. Tabular numerics across the system; the rate calculator
            uses Geist's <span className="mono">cv11</span> contextual alternates.
          </div>
        </div>
        <div className="panel col gap-8" style={{ flex: 1 }}>
          <div className="label">Accent · Instrument Serif</div>
          <div className="h-serif" style={{ fontSize: 56, lineHeight: 0.95 }}>
            <em>Decisioned</em>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
            Sparingly: hero italic words, empty-state warmth, magazine-style chart captions. Never UI labels.
          </div>
          <div className="row gap-8" style={{ marginTop: 4 }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--mute)' }}>Mono · JetBrains</span>
            <span className="mono" style={{ fontSize: 12 }}>APR 6.45% · LTV 0.78</span>
          </div>
        </div>
      </div>

      {/* Dashboard fragment */}
      <div className="col gap-12">
        <div className="label">Dashboard fragment</div>
        <div className="row gap-12">
          <div className="panel col gap-8" style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>Decisions today</div>
            <div className="stat-num">47<span className="unit">apps</span></div>
            <div className="row gap-6" style={{ alignItems: 'center' }}>
              <span className="pill" style={{ color: 'var(--ok)', background: 'rgba(17,158,111,0.08)', borderColor: 'transparent' }}>
                <span className="dot" /> +12%
              </span>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>vs. 7-day avg</span>
            </div>
          </div>
          <div className="panel col gap-8" style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>Avg. time to decision</div>
            <div className="stat-num">2.4<span className="unit">hrs</span></div>
            <div className="row gap-6" style={{ alignItems: 'center' }}>
              <span className="pill" style={{ color: 'var(--brand)', background: 'rgba(42,58,255,0.08)', borderColor: 'transparent' }}>
                <span className="dot" /> –18m
              </span>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>since Monday</span>
            </div>
          </div>
          <div className="panel col gap-8" style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>Default rate, 90d</div>
            <div className="stat-num">1.32<span className="unit">%</span></div>
            <div className="row gap-6" style={{ alignItems: 'center' }}>
              <span className="pill" style={{ color: 'var(--warn)', background: 'rgba(217,119,6,0.08)', borderColor: 'transparent' }}>
                <span className="dot" /> watch
              </span>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>1.18% target</span>
            </div>
          </div>
        </div>

        <div className="panel col gap-10" style={{ marginTop: 4 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="h-sans" style={{ fontWeight: 700, fontSize: 17 }}>
              Application queue · <span style={{ color: 'var(--mute)', fontWeight: 500 }}>Underwriting</span>
            </div>
            <div className="row gap-6">
              <span className="pill"><span className="dot" style={{ background: 'var(--ok)' }} /> 12 cleared</span>
              <span className="pill"><span className="dot" style={{ background: 'var(--warn)' }} /> 5 referred</span>
              <span className="pill"><span className="dot" style={{ background: 'var(--bad)' }} /> 2 declined</span>
            </div>
          </div>
          <table className="dt">
            <thead><tr>
              <th>Ref</th><th>Applicant</th><th>Asset</th><th>Broker</th>
              <th className="num">Advance</th><th className="num">APR</th><th>Status</th>
            </tr></thead>
            <tbody>
              <tr><td className="mono">RL-48201</td><td>Northgate Haulage Ltd</td><td>2× DAF XF tractor unit</td><td>K. Patel</td><td className="num">£186,400</td><td className="num">7.20%</td>
                  <td><span className="pill" style={{ color: 'var(--ok)' }}><span className="dot" /> Cleared</span></td></tr>
              <tr><td className="mono">RL-48214</td><td>Pell Engineering</td><td>CNC mill, refurb</td><td>S. Owusu</td><td className="num">£62,000</td><td className="num">8.95%</td>
                  <td><span className="pill" style={{ color: 'var(--warn)' }}><span className="dot" /> Referred</span></td></tr>
              <tr><td className="mono">RL-48222</td><td>Bluefield Coachworks</td><td>Spray booth installation</td><td>M. Adeyemi</td><td className="num">£24,750</td><td className="num">9.40%</td>
                  <td><span className="pill" style={{ color: 'var(--brand)' }}><span className="dot" /> In review</span></td></tr>
              <tr><td className="mono">RL-48229</td><td>Harland Solar Ltd</td><td>Battery + inverter stack</td><td>R. Owens</td><td className="num">£91,200</td><td className="num">6.75%</td>
                  <td><span className="pill" style={{ color: 'var(--ok)' }}><span className="dot" /> Cleared</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.DirectionA = DirectionA;

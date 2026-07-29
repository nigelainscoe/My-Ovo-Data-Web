// Direction B — Voltage on Slate
// Dark dashboard-first. Near-black surfaces with an electric lime primary
// and warm coral accent. Space Grotesk for personality. Built for ops teams
// who live in the tool all day; data sings against the dark.

function DirectionB() {
  return (
    <div className="ab B col gap-24">
      {/* Identity */}
      <div className="row gap-24" style={{ alignItems: 'stretch' }}>
        <div className="panel col gap-12" style={{ flex: '0 0 320px', alignItems: 'flex-start' }}>
          <div className="label">Mark</div>
          <svg viewBox="0 0 120 120" width="96" height="96" aria-hidden>
            <rect x="0" y="0" width="120" height="120" rx="22" fill="var(--brand)" />
            <path d="M34 24 H78 L60 60 H82 L46 96 L52 66 H30 Z" fill="#0e1117" />
          </svg>
          <div className="col gap-4">
            <div className="h-sans" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.035em' }}>
              Arclend
            </div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
              capital, current.
            </div>
          </div>
        </div>

        <div className="panel col gap-12" style={{ flex: 1 }}>
          <div className="label">Voice</div>
          <div className="h-sans" style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.03em' }}>
            Bright numbers,<br />
            <span style={{ color: 'var(--brand)' }}>quick</span> hands.
          </div>
          <div style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 540 }}>
            For ops who live inside the tool. Dark by default — the lime is the spotlight,
            and we save it for the thing you should look at right now.
          </div>
          <div className="row gap-8" style={{ marginTop: 6 }}>
            <button className="btn btn-primary">New decision →</button>
            <button className="btn btn-secondary">Open queue</button>
            <button className="btn btn-ghost">Filters</button>
          </div>
        </div>
      </div>

      {/* Palette */}
      <div className="col gap-12">
        <div className="label">Palette</div>
        <div className="row gap-12">
          <div className="swatch" style={{ background: 'var(--brand)', color: '#0e1117' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Lime / 500</div><div className="mono">#C4F24C</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--brand-deep)', color: '#0e1117' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Lime / 700</div><div className="mono">#9BC931</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--accent)', color: '#0e1117' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Coral</div><div className="mono">#FF7A59</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--bg)', color: '#fff', border: '1px solid var(--line)' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Canvas</div><div className="mono">#0E1117</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--panel)', color: '#fff', border: '1px solid var(--line)' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Panel</div><div className="mono">#161B22</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--panel-2)', color: '#fff', border: '1px solid var(--line)' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Surface 2</div><div className="mono">#1D242E</div></div>
          </div>
        </div>
      </div>

      {/* Type */}
      <div className="row gap-24">
        <div className="panel col gap-8" style={{ flex: 1 }}>
          <div className="label">Display · Space Grotesk</div>
          <div className="h-sans" style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 0.95 }}>
            £1,284,920
          </div>
          <div className="h-sans" style={{ fontSize: 22, fontWeight: 600 }}>
            Live pipeline value
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
            Space Grotesk's slight quirks (the 'a', the curves) give the system its personality
            without losing data legibility. Numerals are tabular.
          </div>
        </div>
        <div className="panel col gap-8" style={{ flex: 1 }}>
          <div className="label">Mono · JetBrains</div>
          <div className="mono" style={{ fontSize: 36, fontWeight: 500, color: 'var(--brand)' }}>
            APR 6.45%
          </div>
          <div className="mono" style={{ fontSize: 14, color: 'var(--ink-2)' }}>
            RL-48201 → underwrite.review
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
            Mono is used for IDs, codes, raw rates, and timestamps. It's a quiet way to mark
            "this is a primitive, not a label."
          </div>
        </div>
      </div>

      {/* Dashboard fragment */}
      <div className="col gap-12">
        <div className="label">Dashboard fragment</div>
        <div className="row gap-12">
          <div className="panel col gap-8" style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>Decisions today</div>
            <div className="stat-num" style={{ color: 'var(--brand)' }}>47<span className="unit">apps</span></div>
            <div className="row gap-6" style={{ alignItems: 'center' }}>
              <span className="pill" style={{ color: 'var(--ok)', background: 'rgba(74,222,128,0.12)', borderColor: 'transparent' }}>
                <span className="dot" /> +12%
              </span>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>vs. 7-day avg</span>
            </div>
          </div>
          <div className="panel col gap-8" style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>Avg. time to decision</div>
            <div className="stat-num">2.4<span className="unit">hrs</span></div>
            {/* sparkline */}
            <svg viewBox="0 0 200 40" width="100%" height="36" aria-hidden>
              <polyline fill="none" stroke="var(--brand)" strokeWidth="2"
                        points="0,28 20,24 40,26 60,18 80,22 100,14 120,16 140,10 160,12 180,6 200,8" />
              <circle cx="200" cy="8" r="3" fill="var(--brand)" />
            </svg>
          </div>
          <div className="panel col gap-8" style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>Default rate, 90d</div>
            <div className="stat-num">1.32<span className="unit">%</span></div>
            <div className="row gap-6" style={{ alignItems: 'center' }}>
              <span className="pill" style={{ color: 'var(--warn)', background: 'rgba(250,204,21,0.12)', borderColor: 'transparent' }}>
                <span className="dot" /> watch
              </span>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>1.18% target</span>
            </div>
          </div>
        </div>

        <div className="panel col gap-10" style={{ marginTop: 4 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="h-sans" style={{ fontWeight: 700, fontSize: 17 }}>
              Live queue · <span style={{ color: 'var(--mute)', fontWeight: 500 }}>Underwriting</span>
            </div>
            <div className="row gap-6">
              <span className="pill" style={{ color: 'var(--ok)' }}><span className="dot" /> 12 cleared</span>
              <span className="pill" style={{ color: 'var(--warn)' }}><span className="dot" /> 5 referred</span>
              <span className="pill" style={{ color: 'var(--accent)' }}><span className="dot" /> 2 declined</span>
            </div>
          </div>
          <table className="dt">
            <thead><tr>
              <th>Ref</th><th>Applicant</th><th>Asset</th><th>Broker</th>
              <th className="num">Advance</th><th className="num">APR</th><th>Status</th>
            </tr></thead>
            <tbody>
              <tr><td className="mono">AL-48201</td><td>Northgate Haulage Ltd</td><td>2× DAF XF tractor unit</td><td>K. Patel</td><td className="num">£186,400</td><td className="num">7.20%</td>
                  <td><span className="pill" style={{ color: 'var(--ok)' }}><span className="dot" /> Cleared</span></td></tr>
              <tr><td className="mono">AL-48214</td><td>Pell Engineering</td><td>CNC mill, refurb</td><td>S. Owusu</td><td className="num">£62,000</td><td className="num">8.95%</td>
                  <td><span className="pill" style={{ color: 'var(--warn)' }}><span className="dot" /> Referred</span></td></tr>
              <tr><td className="mono">AL-48222</td><td>Bluefield Coachworks</td><td>Spray booth installation</td><td>M. Adeyemi</td><td className="num">£24,750</td><td className="num">9.40%</td>
                  <td><span className="pill" style={{ color: 'var(--brand)' }}><span className="dot" /> In review</span></td></tr>
              <tr><td className="mono">AL-48229</td><td>Harland Solar Ltd</td><td>Battery + inverter stack</td><td>R. Owens</td><td className="num">£91,200</td><td className="num">6.75%</td>
                  <td><span className="pill" style={{ color: 'var(--ok)' }}><span className="dot" /> Cleared</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.DirectionB = DirectionB;

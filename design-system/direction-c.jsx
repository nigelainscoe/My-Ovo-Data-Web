// Direction C — Warm Teal & Cream
// Friendly editorial. Cream paper backgrounds, deep teal primary, warm
// terracotta accent. Inter for everything, Instrument Serif for warmth.
// Reads less like a fintech and more like a thoughtful B2B tool.

function DirectionC() {
  return (
    <div className="ab C col gap-24">
      {/* Identity */}
      <div className="row gap-24" style={{ alignItems: 'stretch' }}>
        <div className="panel col gap-12" style={{ flex: '0 0 320px', alignItems: 'flex-start' }}>
          <div className="label">Mark</div>
          <svg viewBox="0 0 120 120" width="96" height="96" aria-hidden>
            <circle cx="60" cy="60" r="56" fill="var(--brand)" />
            <path d="M28 60 C28 42 42 28 60 28 C78 28 92 42 92 60"
                  fill="none" stroke="#fbf8f1" strokeWidth="10" strokeLinecap="round" />
            <circle cx="60" cy="60" r="8" fill="var(--accent)" />
          </svg>
          <div className="col gap-4">
            <div className="h-serif" style={{ fontSize: 36, lineHeight: 1, color: 'var(--brand-deep)' }}>
              Meridian
            </div>
            <div className="h-sans" style={{ fontSize: 12.5, color: 'var(--mute)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Asset finance, considered.
            </div>
          </div>
        </div>

        <div className="panel col gap-12" style={{ flex: 1 }}>
          <div className="label">Voice</div>
          <div className="h-sans" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.025em' }}>
            We finance the <span className="h-serif" style={{ color: 'var(--accent)', fontWeight: 400 }}><em>good</em></span> bets,<br />
            quickly, on paper.
          </div>
          <div style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 540 }}>
            Warm, plainspoken, never breathless. We sound like a careful person at the other
            end of the phone — even when the screen is doing the work.
          </div>
          <div className="row gap-8" style={{ marginTop: 6 }}>
            <button className="btn btn-primary">Start an application →</button>
            <button className="btn btn-secondary">Today's queue</button>
            <button className="btn btn-ghost">Reports</button>
          </div>
        </div>
      </div>

      {/* Palette */}
      <div className="col gap-12">
        <div className="label">Palette</div>
        <div className="row gap-12">
          <div className="swatch" style={{ background: 'var(--brand)', color: '#fff' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Teal / 700</div><div className="mono">#0F7A6C</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--brand-deep)', color: '#fff' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Teal / 900</div><div className="mono">#0A4F47</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--accent)', color: '#fff' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Terracotta</div><div className="mono">#E26A3A</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--ink)', color: '#fff' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Ink</div><div className="mono">#11302E</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--bg)', color: 'var(--ink)', border: '1px solid var(--line)' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Paper</div><div className="mono">#F5F1E8</div></div>
          </div>
          <div className="swatch" style={{ background: 'var(--panel)', color: 'var(--ink)', border: '1px solid var(--line)' }}>
            <div className="swatch-meta"><div style={{ fontWeight: 700 }}>Card</div><div className="mono">#FBF8F1</div></div>
          </div>
        </div>
      </div>

      {/* Type */}
      <div className="row gap-24">
        <div className="panel col gap-8" style={{ flex: 1 }}>
          <div className="label">Display · Instrument Serif</div>
          <div className="h-serif" style={{ fontSize: 60, lineHeight: 0.95, color: 'var(--brand-deep)' }}>
            £1,284,920
          </div>
          <div className="h-sans" style={{ fontSize: 22, fontWeight: 600 }}>
            Pipeline value, this week
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
            The serif carries headlines, hero numbers, and section openers — anywhere a
            human would naturally take a breath. Body and UI sit in Inter.
          </div>
        </div>
        <div className="panel col gap-8" style={{ flex: 1 }}>
          <div className="label">Body · Inter</div>
          <div className="h-sans" style={{ fontSize: 17, fontWeight: 600 }}>
            From application to decision in under three hours.
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
            We use Inter 400 for paragraph text and 600 for emphasis. Numerics are tabular,
            so columns of money line up cleanly without extra effort.
          </div>
          <div className="row gap-8" style={{ marginTop: 4 }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--mute)' }}>APR 6.45% · LTV 0.78</span>
          </div>
        </div>
      </div>

      {/* Dashboard fragment */}
      <div className="col gap-12">
        <div className="label">Dashboard fragment</div>
        <div className="row gap-12">
          <div className="panel col gap-8" style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>Decisions today</div>
            <div className="h-serif" style={{ fontSize: 44, lineHeight: 1, color: 'var(--brand-deep)' }}>47</div>
            <div className="row gap-6" style={{ alignItems: 'center' }}>
              <span className="pill" style={{ color: 'var(--ok)', background: 'rgba(47,125,74,0.08)', borderColor: 'transparent' }}>
                <span className="dot" /> +12%
              </span>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>vs. 7-day avg</span>
            </div>
          </div>
          <div className="panel col gap-8" style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>Avg. time to decision</div>
            <div className="h-serif" style={{ fontSize: 44, lineHeight: 1, color: 'var(--brand-deep)' }}>
              2.4<span style={{ fontSize: 18, color: 'var(--mute)', fontFamily: 'Inter' }}> hrs</span>
            </div>
            <div className="row gap-6" style={{ alignItems: 'center' }}>
              <span className="pill" style={{ color: 'var(--brand)', background: 'rgba(15,122,108,0.08)', borderColor: 'transparent' }}>
                <span className="dot" /> –18m
              </span>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>since Monday</span>
            </div>
          </div>
          <div className="panel col gap-8" style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>Default rate, 90d</div>
            <div className="h-serif" style={{ fontSize: 44, lineHeight: 1, color: 'var(--brand-deep)' }}>
              1.32<span style={{ fontSize: 18, color: 'var(--mute)', fontFamily: 'Inter' }}>%</span>
            </div>
            <div className="row gap-6" style={{ alignItems: 'center' }}>
              <span className="pill" style={{ color: 'var(--accent)', background: 'rgba(226,106,58,0.10)', borderColor: 'transparent' }}>
                <span className="dot" /> watch
              </span>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>1.18% target</span>
            </div>
          </div>
        </div>

        <div className="panel col gap-10" style={{ marginTop: 4 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="h-serif" style={{ fontSize: 22, color: 'var(--brand-deep)' }}>
              <em>Application queue</em>
              <span className="h-sans" style={{ fontSize: 14, color: 'var(--mute)', fontWeight: 500, marginLeft: 10 }}>Underwriting</span>
            </div>
            <div className="row gap-6">
              <span className="pill" style={{ color: 'var(--ok)' }}><span className="dot" /> 12 cleared</span>
              <span className="pill" style={{ color: 'var(--warn)' }}><span className="dot" /> 5 referred</span>
              <span className="pill" style={{ color: 'var(--bad)' }}><span className="dot" /> 2 declined</span>
            </div>
          </div>
          <table className="dt">
            <thead><tr>
              <th>Ref</th><th>Applicant</th><th>Asset</th><th>Broker</th>
              <th className="num">Advance</th><th className="num">APR</th><th>Status</th>
            </tr></thead>
            <tbody>
              <tr><td className="mono">MR-48201</td><td>Northgate Haulage Ltd</td><td>2× DAF XF tractor unit</td><td>K. Patel</td><td className="num">£186,400</td><td className="num">7.20%</td>
                  <td><span className="pill" style={{ color: 'var(--ok)' }}><span className="dot" /> Cleared</span></td></tr>
              <tr><td className="mono">MR-48214</td><td>Pell Engineering</td><td>CNC mill, refurb</td><td>S. Owusu</td><td className="num">£62,000</td><td className="num">8.95%</td>
                  <td><span className="pill" style={{ color: 'var(--warn)' }}><span className="dot" /> Referred</span></td></tr>
              <tr><td className="mono">MR-48222</td><td>Bluefield Coachworks</td><td>Spray booth installation</td><td>M. Adeyemi</td><td className="num">£24,750</td><td className="num">9.40%</td>
                  <td><span className="pill" style={{ color: 'var(--brand)' }}><span className="dot" /> In review</span></td></tr>
              <tr><td className="mono">MR-48229</td><td>Harland Solar Ltd</td><td>Battery + inverter stack</td><td>R. Owens</td><td className="num">£91,200</td><td className="num">6.75%</td>
                  <td><span className="pill" style={{ color: 'var(--ok)' }}><span className="dot" /> Cleared</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.DirectionC = DirectionC;

import { useEffect, useMemo, useState } from 'react';
import Header, { WINDOW_OPTIONS } from './components/Header.jsx';
import StatTile from './components/StatTile.jsx';
import StatusBox from './components/StatusBox.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import NotAuthorized from './components/NotAuthorized.jsx';
import useMetric from './hooks/useMetric.js';
import { useAuth } from './AuthContext.jsx';
import { authFetch } from './apiClient.js';

function windowLabel(key) {
  return WINDOW_OPTIONS.find((o) => o.value === key)?.label ?? key;
}

function MetricBoundTile({ metric, windowKey, scaleThresholds, register }) {
  const m = useMetric(metric);
  useEffect(() => { register(metric.id, m.run); }, [metric.id, m.run, register]);
  return (
    <StatTile
      metric={metric}
      state={m}
      windowLabel={windowLabel(windowKey)}
      scaleThresholds={scaleThresholds}
      onClick={() => m.run(windowKey)}
    />
  );
}

function MetricBoundStatusBox({ metric, windowKey, register }) {
  const m = useMetric(metric);
  useEffect(() => { register(metric.id, m.run); }, [metric.id, m.run, register]);
  return <StatusBox metric={metric} state={m} onClick={() => m.run(windowKey)} />;
}

export default function App() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="page" style={{ paddingTop: 120, textAlign: 'center' }}>
        <span className="mute">Loading…</span>
      </div>
    );
  }
  if (!user) {
    return <LoginScreen />;
  }
  return <Dashboard />;
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const [windowKey, setWindowKey] = useState('1h');
  const [scaleThresholds, setScaleThresholds] = useState(false);
  const [metrics, setMetrics] = useState([]);
  const [health, setHealth] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [accessError, setAccessError] = useState(null);

  // Map of metric id → run function, populated by child tiles via the register prop.
  const runners = useMemo(() => new Map(), []);
  const register = useMemo(
    () => (id, fn) => { runners.set(id, fn); },
    [runners],
  );

  useEffect(() => {
    authFetch('/api/metrics')
      .then(async (r) => {
        const body = await r.json();
        if (r.status === 403) {
          setAccessError(body.detail || body.error);
          return;
        }
        if (!body.ok) throw new Error(body.error || 'Failed to load metrics');
        setMetrics(body.metrics);
      })
      .catch((err) => setLoadError(err.message));
    authFetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
  }, []);

  const refreshAll = () => {
    for (const fn of runners.values()) fn(windowKey);
  };

  const partnerMetrics = metrics.filter((m) => m.category === 'partner');
  const orchestratorMetrics = metrics.filter((m) => m.category === 'orchestrator');
  const funnelMetrics = metrics.filter((m) => m.category === 'funnel');

  if (accessError) {
    return <NotAuthorized detail={accessError} />;
  }

  return (
    <div className="page">
      <Header
        windowKey={windowKey}
        onWindowChange={setWindowKey}
        onRefreshAll={refreshAll}
        scaleThresholds={scaleThresholds}
        onScaleThresholdsChange={setScaleThresholds}
        health={health}
        user={user}
        onSignOut={signOut}
      />

      <div className="panel headline">
        <div className="headline-eyebrow">
          <span className="live-dot" />
          Live
        </div>
        <h1>
          Live System <em>Monitoring</em>
        </h1>
        <p>
          Live signal from system data. Click a tile to refresh,
          or hit <strong>Refresh all</strong> in the header to fan-out across every monitor.
        </p>
      </div>

      {loadError && (
        <div className="panel" style={{ marginTop: 16, color: 'var(--bad)' }}>
          Could not load metric registry: {loadError}
        </div>
      )}

      <div className="identity-groups">
        <div className="identity-group">
          <div className="label identity-heading">Partners Availability</div>
          <div className="identity-row">
            {partnerMetrics.map((m) => (
              <MetricBoundStatusBox key={m.id} metric={m} windowKey={windowKey} register={register} />
            ))}
          </div>
        </div>
        <div className="identity-group">
          <div className="label identity-heading">Orchestrators Availability</div>
          <div className="identity-row">
            {orchestratorMetrics.map((m) => (
              <MetricBoundStatusBox key={m.id} metric={m} windowKey={windowKey} register={register} />
            ))}
          </div>
        </div>
      </div>

      <div className="section-divider" />

      <div className="funnel-section">
        <div className="label funnel-section-label">Business funnel</div>
        <div className="funnel-row">
          {funnelMetrics.map((m) => (
            <MetricBoundTile
              key={m.id}
              metric={m}
              windowKey={windowKey}
              scaleThresholds={scaleThresholds}
              register={register}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

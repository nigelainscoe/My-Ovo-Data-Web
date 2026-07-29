import StatusPill from './StatusPill.jsx';
import { deriveStatus } from '../lib/status.js';

function formatNumber(n) {
  return new Intl.NumberFormat('en-GB').format(n);
}

function formatTime(iso) {
  if (!iso) return 'never run';
  const d = new Date(iso);
  return `refreshed ${d.toLocaleTimeString('en-GB', { hour12: false })}`;
}

function thresholdCaption(metric, threshold, windowLabel, scaled) {
  const cmp = metric.inverted ? '≤' : '≥';
  if (scaled) {
    return `target ${cmp} ${formatNumber(threshold)} · ${windowLabel}`;
  }
  return `target ${cmp} ${formatNumber(threshold)} / hour`;
}

export default function StatTile({ metric, state, windowLabel, scaleThresholds, onClick }) {
  const isError = !!state.error;
  const isLoading = state.loading;
  const hasValue = state.value != null && !isError;

  const threshold = scaleThresholds && state.windowHours != null
    ? Math.round(metric.threshold.perHour * state.windowHours)
    : metric.threshold.perHour;

  const status = isError
    ? 'error'
    : (hasValue ? deriveStatus(state.value, threshold, !!metric.inverted) : 'nodata');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`panel stat-tile status-${status} ${isLoading ? 'is-loading' : ''} ${isError ? 'is-error' : ''}`}
      title={isError ? state.error : 'Click to refresh'}
    >
      <div className="k">{metric.name}</div>

      {isError ? (
        <>
          <div className="err-icon" aria-hidden>⚠</div>
          <div className="err-msg">{state.error}</div>
        </>
      ) : (
        <>
          <div className="v">
            <span className="stat-num">{hasValue ? formatNumber(state.value) : '—'}</span>
            <span className="stat-unit">{metric.unit}</span>
          </div>
          <StatusPill status={status} inverted={!!metric.inverted} />
          <div className="threshold">
            {thresholdCaption(metric, threshold, windowLabel, scaleThresholds)}
          </div>
        </>
      )}

      <div className="footer">{formatTime(state.runAt)}</div>
      {isLoading && <div className="progress" />}
    </button>
  );
}

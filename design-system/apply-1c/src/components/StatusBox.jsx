import { deriveStatus } from '../lib/status.js';

/* Human-readable status word shown inside each availability tile. */
const STATUS_WORD = {
  ok: 'Operational',
  bad: 'Degraded',
  error: 'Down',
  nodata: 'No data',
};

export default function StatusBox({ metric, state, onClick }) {
  const isError = !!state.error;
  const isLoading = state.loading;
  const hasValue = state.value != null && !isError;

  const status = isError
    ? 'error'
    : (hasValue ? deriveStatus(state.value, metric.threshold.perHour, !!metric.inverted) : 'nodata');

  const title = isError
    ? state.error
    : (state.runAt ? `refreshed ${new Date(state.runAt).toLocaleTimeString('en-GB', { hour12: false })}` : 'Click to refresh');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`identity-box status-${status} ${isLoading ? 'is-loading' : ''}`}
      title={title}
      aria-label={metric.name}
    >
      <span className="identity-status">
        <span className="identity-dot" />
        {STATUS_WORD[status]}
      </span>
      <span className="identity-name">{metric.name}</span>
    </button>
  );
}

"use strict";

const $ = (id) => document.getElementById(id);
let accounts = [];
let currentAccountId = null;
let statusTimer = null;

async function api(path, opts) {
  let res;
  try {
    res = await fetch(path, opts);
  } catch (err) {
    // A "Failed to fetch" TypeError means the browser never reached the local
    // server (not running, wrong port, or it crashed). This is NOT an OVO error.
    throw new Error(
      "Couldn't reach the local server. Make sure it's still running " +
      "(the terminal where you ran ./run.sh) and that you opened " +
      "http://127.0.0.1:8000 — then check that terminal for errors."
    );
  }
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch (_) {}
    throw new Error(detail);
  }
  return res.json();
}

function post(path, body) {
  return api(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
}

// --------------------------------------------------------------------- login
$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("login-error").textContent = "";
  const btn = $("login-btn");
  btn.disabled = true;
  btn.textContent = "Logging in…";
  try {
    const data = await post("/api/login", {
      username: $("username").value,
      password: $("password").value,
    });
    accounts = data.accounts || [];
    populateStopWhen(data.stopOptions || []);
    populateAccounts();
    $("login-card").classList.add("hidden");
    $("account-card").classList.remove("hidden");
    $("summary-card").classList.remove("hidden");
    $("export-card").classList.remove("hidden");
  } catch (err) {
    $("login-error").textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Log in";
  }
});

function populateStopWhen(options) {
  const sel = $("stop-when");
  sel.innerHTML = "";
  options.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    sel.appendChild(opt);
  });
}

function populateAccounts() {
  const sel = $("account-select");
  sel.innerHTML = "";
  accounts.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.id;
    sel.appendChild(opt);
  });
  if (accounts.length) selectAccount(accounts[0].id);
}

$("account-select").addEventListener("change", (e) => selectAccount(e.target.value));

function selectAccount(id) {
  currentAccountId = id;
  const a = accounts.find((x) => x.id === id);
  const meta = $("account-meta");
  meta.innerHTML = "";
  if (a) {
    if (a.hasElectric)
      meta.innerHTML += `<span class="pill">⚡ Electric from ${a.electricStartDate || "?"}</span>`;
    if (a.hasGas)
      meta.innerHTML += `<span class="pill">🔥 Gas from ${a.gasStartDate || "?"}</span>`;
  }
  loadSummary();
}

// --------------------------------------------------------------------- fetch
$("fetch-usage-btn").addEventListener("click", async () => {
  await startFetch(() => post("/api/fetch-usage", {
    accountId: currentAccountId,
    stopWhen: $("stop-when").value,
  }));
});

$("fetch-readings-btn").addEventListener("click", async () => {
  await startFetch(() => post("/api/fetch-readings", { accountId: currentAccountId }));
});

$("cancel-btn").addEventListener("click", () => post("/api/cancel", {}));

async function startFetch(starter) {
  $("progress-card").classList.remove("hidden");
  setBusy(true);
  try {
    await starter();
    pollStatus();
  } catch (err) {
    $("status-line").textContent = err.message;
    setBusy(false);
  }
}

function setBusy(busy) {
  $("fetch-usage-btn").disabled = busy;
  $("fetch-readings-btn").disabled = busy;
  $("cancel-btn").disabled = !busy;
  $("account-select").disabled = busy;
  $("stop-when").disabled = busy;
}

function pollStatus() {
  if (statusTimer) clearInterval(statusTimer);
  statusTimer = setInterval(async () => {
    let s;
    try { s = await api("/api/status"); } catch (_) { return; }
    const line = $("status-line");
    line.textContent = s.status;
    line.className = "status " + (s.running ? "spin" : (s.error ? "" : "done"));
    $("log").textContent = (s.lines || []).join("\n");
    $("log").scrollTop = $("log").scrollHeight;
    if (!s.running) {
      clearInterval(statusTimer);
      statusTimer = null;
      setBusy(false);
      loadSummary();
    }
  }, 800);
}


// -------------------------------------------------------------------- export
function download(path, msgOnStart) {
  if (!currentAccountId) return;
  $("export-msg").textContent = msgOnStart;
  // A plain navigation triggers the browser's own download for the file bytes.
  window.location.href = path + "?accountId=" + encodeURIComponent(currentAccountId);
  setTimeout(() => { $("export-msg").textContent = ""; }, 4000);
}

$("export-excel-btn").addEventListener("click", () =>
  download("/api/export/excel", "Building workbook…"));
$("export-csv-btn").addEventListener("click", () =>
  download("/api/export/csv", "Building CSVs…"));

// ------------------------------------------------------------------- summary
$("refresh-summary-btn").addEventListener("click", loadSummary);

async function loadSummary() {
  if (!currentAccountId) return;
  let data;
  try {
    data = await api("/api/summary?accountId=" + encodeURIComponent(currentAccountId));
  } catch (_) { return; }
  const rows = data.summary || [];
  const tbody = $("summary-table").querySelector("tbody");
  tbody.innerHTML = "";
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML =
      `<td>${r.fuelType}</td><td>${r.metric}</td><td>${r.from}</td><td>${r.to}</td><td>${r.records}</td>`;
    tbody.appendChild(tr);
  });
  $("summary-table").classList.toggle("hidden", rows.length === 0);
  $("summary-empty").classList.toggle("hidden", rows.length !== 0);
}

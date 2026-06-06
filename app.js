/* Reisekurs – offline currency converter for Singapore, Indonesia & Thailand. */

const CURRENCIES = [
  { code: "SGD", country: "Singapur",     flag: "🇸🇬", symbol: "S$",  decimals: 2 },
  { code: "IDR", country: "Indonesien",   flag: "🇮🇩", symbol: "Rp",  decimals: 0 },
  { code: "THB", country: "Thailand",     flag: "🇹🇭", symbol: "฿",   decimals: 2 },
];
const BASE = { code: "EUR", country: "Euro", flag: "🇪🇺", symbol: "€", decimals: 2 };
const API = "https://open.er-api.com/v6/latest/EUR";
const LS = "reisekurs.v1";

/* ---------- state ---------- */
const defaults = {
  activeCode: "IDR",
  direction: "localToEur",          // localToEur | eurToLocal
  amount: "",
  rateMode: { SGD: "official", IDR: "official", THB: "official" },
  ownRates: { SGD: null, IDR: null, THB: null },   // local units per 1 EUR
  ownInputs: { SGD: {}, IDR: {}, THB: {} },        // {eur, local} raw strings
};
let state = load();
let rates = loadRates();   // { date, time, SGD, IDR, THB } – local per 1 EUR

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(LS));
    return s && s.state ? { ...defaults, ...s.state } : { ...defaults };
  } catch { return { ...defaults }; }
}
function loadRates() {
  try { return JSON.parse(localStorage.getItem(LS))?.rates || null; }
  catch { return null; }
}
function save() {
  localStorage.setItem(LS, JSON.stringify({ state, rates }));
}

/* ---------- helpers ---------- */
const $ = (id) => document.getElementById(id);
const cur = (code) => CURRENCIES.find((c) => c.code === code) || BASE;
const todayKey = () => new Date().toISOString().slice(0, 10);

function parseNum(str) {
  if (str == null) return NaN;
  const cleaned = String(str).trim().replace(/\s/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  return parseFloat(cleaned);
}
function fmt(value, decimals) {
  if (!isFinite(value)) return "0";
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
function effectiveRate(code) {
  const own = state.ownRates[code];
  if (state.rateMode[code] === "own" && own > 0) return own;
  return rates ? rates[code] : null;
}

/* ---------- rendering ---------- */
function renderTabs() {
  const tabs = $("tabs");
  tabs.innerHTML = "";
  CURRENCIES.forEach((c) => {
    const b = document.createElement("button");
    b.className = "tab" + (c.code === state.activeCode ? " active" : "");
    b.setAttribute("role", "tab");
    b.innerHTML = `<span class="t-flag">${c.flag}</span><span>${c.country}</span>`;
    b.onclick = () => { state.activeCode = c.code; save(); renderAll(); };
    tabs.appendChild(b);
  });
}

function renderConverter() {
  const c = cur(state.activeCode);
  const localToEur = state.direction === "localToEur";
  const top = localToEur ? c : BASE;
  const bottom = localToEur ? BASE : c;

  $("top-flag").textContent = top.flag;
  $("top-name").textContent = `${top.country} (${top.symbol})`;
  $("bottom-flag").textContent = bottom.flag;
  $("bottom-name").textContent = `${bottom.country} (${bottom.symbol})`;

  const input = $("top-input");
  if (document.activeElement !== input) input.value = state.amount;

  renderQuick(top);
  computeOutput();
}

function renderQuick(top) {
  const q = $("quick");
  q.innerHTML = "";
  [50, 100, 500].forEach((v) => {
    const b = document.createElement("button");
    b.textContent = `${v} ${top.symbol}`;
    b.onclick = () => {
      state.amount = String(v);
      save();
      $("top-input").value = state.amount;
      computeOutput();
    };
    q.appendChild(b);
  });
}

function computeOutput() {
  const c = cur(state.activeCode);
  const R = effectiveRate(c.code);            // local per 1 EUR
  const amt = parseNum(state.amount);
  const out = $("bottom-value");
  const localToEur = state.direction === "localToEur";

  if (!R || !isFinite(amt)) { out.textContent = "0"; return; }

  let value, decimals;
  if (localToEur) { value = amt / R; decimals = BASE.decimals; }
  else { value = amt * R; decimals = c.decimals; }
  out.textContent = fmt(value, decimals);
}

function renderRateMode() {
  const c = cur(state.activeCode);
  const mode = state.rateMode[c.code];
  document.querySelectorAll("#rate-mode .seg").forEach((b) => {
    b.classList.toggle("active", b.dataset.mode === mode);
  });

  const official = rates ? rates[c.code] : null;
  const own = state.ownRates[c.code];
  const info = $("rate-info");

  if (mode === "own" && own > 0) {
    info.innerHTML = `Dein Kurs: 1 € = <b>${fmt(own, c.decimals)} ${c.symbol}</b>` +
      (official ? ` &nbsp;·&nbsp; Tageskurs ${fmt(official, c.decimals)}` : "");
  } else if (official) {
    info.innerHTML = `1 € = <b>${fmt(official, c.decimals)} ${c.symbol}</b>` +
      (own > 0 ? ` &nbsp;·&nbsp; dein Kurs ${fmt(own, c.decimals)}` : "");
  } else {
    info.textContent = "Noch kein Kurs geladen.";
  }
}

function renderOwnCard() {
  const c = cur(state.activeCode);
  $("own-local-label").textContent = `Erhalten (${c.symbol})`;
  const raw = state.ownInputs[c.code] || {};
  $("own-eur").value = raw.eur ?? "";
  $("own-local").value = raw.local ?? "";

  const own = state.ownRates[c.code];
  $("own-result").textContent = own > 0
    ? `Dein Kurs: 1 € = ${fmt(own, c.decimals)} ${c.symbol}`
    : "";
}

function renderStatus() {
  const el = $("status");
  el.classList.remove("error");
  if (!rates) {
    if (!navigator.onLine) { el.textContent = "Offline – noch keine Kurse gespeichert."; el.classList.add("error"); }
    else el.textContent = "Lade Kurse…";
    return;
  }
  const fetched = new Date(rates.time);
  const isToday = rates.date === todayKey();
  const day = isToday ? "heute" : fetched.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  const time = fetched.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  let txt = `Aktualisiert: ${day}, ${time} Uhr`;
  if (!navigator.onLine) txt += " · offline";
  el.textContent = txt;
}

function renderAll() {
  renderTabs();
  renderConverter();
  renderRateMode();
  renderOwnCard();
  renderStatus();
}

/* ---------- rate fetching ---------- */
async function fetchRates(force = false) {
  if (!force && rates && rates.date === todayKey()) { renderStatus(); return; }
  if (!navigator.onLine) { renderStatus(); return; }

  const btn = $("refresh");
  btn.classList.add("spinning");
  try {
    const res = await fetch(API, { cache: "no-store" });
    const data = await res.json();
    if (data.result !== "success") throw new Error("API error");
    rates = {
      date: todayKey(),
      time: new Date().toISOString(),
      SGD: data.rates.SGD,
      IDR: data.rates.IDR,
      THB: data.rates.THB,
    };
    save();
    renderAll();
  } catch (e) {
    const el = $("status");
    if (rates) renderStatus();
    else { el.textContent = "Kurse konnten nicht geladen werden."; el.classList.add("error"); }
  } finally {
    btn.classList.remove("spinning");
  }
}

/* ---------- own rate computation ---------- */
function recomputeOwnRate() {
  const c = cur(state.activeCode);
  const eur = parseNum($("own-eur").value);
  const local = parseNum($("own-local").value);
  state.ownInputs[c.code] = { eur: $("own-eur").value, local: $("own-local").value };

  if (isFinite(eur) && eur > 0 && isFinite(local) && local > 0) {
    state.ownRates[c.code] = local / eur;
  } else {
    state.ownRates[c.code] = null;
    if (state.rateMode[c.code] === "own") state.rateMode[c.code] = "official";
  }
  save();
  renderRateMode();
  renderOwnCard();
  computeOutput();
}

/* ---------- events ---------- */
$("top-input").addEventListener("input", (e) => {
  state.amount = e.target.value;
  save();
  computeOutput();
});

$("swap").addEventListener("click", () => {
  // carry the current result into the input so the equivalence stays on screen
  const result = $("bottom-value").textContent;
  state.direction = state.direction === "localToEur" ? "eurToLocal" : "localToEur";
  state.amount = result && result !== "0" ? result : state.amount;
  save();
  renderConverter();
});

document.querySelectorAll("#rate-mode .seg").forEach((b) => {
  b.addEventListener("click", () => {
    const c = cur(state.activeCode);
    const mode = b.dataset.mode;
    if (mode === "own" && !(state.ownRates[c.code] > 0)) {
      $("own-eur").focus();
      return;
    }
    state.rateMode[c.code] = mode;
    save();
    renderRateMode();
    computeOutput();
  });
});

$("own-eur").addEventListener("input", recomputeOwnRate);
$("own-local").addEventListener("input", recomputeOwnRate);
$("own-clear").addEventListener("click", () => {
  const c = cur(state.activeCode);
  state.ownRates[c.code] = null;
  state.ownInputs[c.code] = {};
  if (state.rateMode[c.code] === "own") state.rateMode[c.code] = "official";
  save();
  renderRateMode();
  renderOwnCard();
  computeOutput();
});

$("refresh").addEventListener("click", () => fetchRates(true));
window.addEventListener("online", () => { renderStatus(); fetchRates(); });
window.addEventListener("offline", renderStatus);

/* ---------- boot ---------- */
renderAll();
fetchRates();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

'use strict';

// ===========================
//  STAR FIELD
// ===========================
(function createStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 0.5;
    s.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      top: ${Math.random() * 70}%;
      left: ${Math.random() * 100}%;
      --dur: ${(Math.random() * 3 + 1.5).toFixed(1)}s;
      --delay: ${(Math.random() * 4).toFixed(1)}s;
      opacity: ${Math.random() * 0.5 + 0.1};
    `;
    container.appendChild(s);
  }
})();

// ===========================
//  STATE
// ===========================
const state = {
  current:    '0',
  previous:   '',
  operator:   null,
  justCalc:   false,
  freshStart: true,
};

// ===========================
//  DOM REFS
// ===========================
const displayEl   = document.getElementById('display');
const expressionEl = document.getElementById('expression');
const modeLabelEl  = document.getElementById('modeLabel');
const clearBtn     = document.getElementById('clearBtn');
const opBtns       = document.querySelectorAll('.b-op');

// ===========================
//  DISPLAY HELPERS
// ===========================
function formatNum(val) {
  if (val === 'Error') return 'Error';
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  if (Math.abs(n) >= 1e10 || (Math.abs(n) < 1e-6 && n !== 0))
    return n.toPrecision(5);
  const r = parseFloat(n.toPrecision(10));
  const parts = r.toString().split('.');
  parts[0] = parseInt(parts[0]).toLocaleString('en-US');
  return parts.join('.');
}

function setDisplay(val) {
  displayEl.textContent = formatNum(val);
  autoSize();
}

function autoSize() {
  const len = displayEl.textContent.length;
  if      (len <= 7)  displayEl.style.fontSize = '40px';
  else if (len <= 10) displayEl.style.fontSize = '30px';
  else if (len <= 14) displayEl.style.fontSize = '22px';
  else                displayEl.style.fontSize = '16px';
}

function setMode(txt) {
  modeLabelEl.textContent = txt;
}

function popAnim() {
  displayEl.classList.remove('pop');
  void displayEl.offsetWidth;
  displayEl.classList.add('pop');
  displayEl.addEventListener('animationend', () =>
    displayEl.classList.remove('pop'), { once: true });
}

function errAnim() {
  displayEl.classList.remove('err');
  void displayEl.offsetWidth;
  displayEl.classList.add('err');
  displayEl.addEventListener('animationend', () =>
    displayEl.classList.remove('err'), { once: true });
}

function highlightOp(op) {
  opBtns.forEach(b =>
    b.classList.toggle('active', b.dataset.value === op));
}

function refreshClear() {
  clearBtn.textContent = state.freshStart ? 'CLR' : 'AC';
}

// ===========================
//  MATH
// ===========================
function compute(a, b, op) {
  const x = parseFloat(a), y = parseFloat(b);
  switch (op) {
    case '+': return x + y;
    case '−': return x - y;
    case '×': return x * y;
    case '÷': return y === 0 ? null : x / y;
    default:  return y;
  }
}

// ===========================
//  ACTIONS
// ===========================
function doNumber(d) {
  if (state.justCalc) {
    state.current  = d;
    state.previous = '';
    state.operator = null;
    state.justCalc = false;
    highlightOp(null);
    setMode('INPUT');
  } else if (state.freshStart || state.current === '0') {
    state.current    = d;
    state.freshStart = false;
  } else {
    if (state.current.replace(/[-.]/g, '').length >= 12) return;
    state.current += d;
  }
  setDisplay(state.current);
  refreshClear();
}

function doDecimal() {
  if (state.justCalc) {
    state.current  = '0.';
    state.previous = '';
    state.operator = null;
    state.justCalc = false;
    highlightOp(null);
  } else if (state.freshStart) {
    state.current    = '0.';
    state.freshStart = false;
  } else if (!state.current.includes('.')) {
    state.current += '.';
  }
  setDisplay(state.current);
}

function doOperator(op) {
  if (state.operator && !state.justCalc) {
    const res = compute(state.previous, state.current, state.operator);
    if (res === null) { doError(); return; }
    const s = String(parseFloat(res.toPrecision(10)));
    state.previous = s;
    state.current  = s;
    setDisplay(s);
  } else {
    state.previous = state.current;
  }
  state.operator   = op;
  state.justCalc   = false;
  state.freshStart = true;
  expressionEl.textContent = `${formatNum(state.previous)} ${op}`;
  highlightOp(op);
  setMode(op === '+' ? 'ADD' : op === '−' ? 'SUB' : op === '×' ? 'MUL' : 'DIV');
  refreshClear();
}

function doEquals() {
  if (!state.operator) return;
  const exprTxt = `${formatNum(state.previous)} ${state.operator} ${formatNum(state.current)}`;
  const res = compute(state.previous, state.current, state.operator);
  if (res === null) { doError(); expressionEl.textContent = exprTxt + ' ='; return; }
  const s = String(parseFloat(res.toPrecision(10)));
  expressionEl.textContent = exprTxt + ' =';
  state.current  = s;
  state.previous = s;
  state.operator = null;
  state.justCalc = true;
  state.freshStart = false;
  setDisplay(s);
  popAnim();
  setMode('RESULT');
  highlightOp(null);
  refreshClear();
}

function doClear() {
  state.current    = '0';
  state.previous   = '';
  state.operator   = null;
  state.justCalc   = false;
  state.freshStart = true;
  setDisplay('0');
  expressionEl.textContent = '\u00A0';
  setMode('READY');
  highlightOp(null);
  clearBtn.textContent = 'CLR';
}

function doSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  setDisplay(state.current);
}

function doPercent() {
  if (state.current === '0' || state.current === 'Error') return;
  const v = parseFloat(state.current) / 100;
  state.current = String(parseFloat(v.toPrecision(10)));
  setDisplay(state.current);
}

function doError() {
  state.current    = 'Error';
  state.previous   = '';
  state.operator   = null;
  state.justCalc   = false;
  state.freshStart = true;
  displayEl.textContent = 'ERROR';
  displayEl.style.fontSize = '28px';
  errAnim();
  setMode('ERR');
  highlightOp(null);
  clearBtn.textContent = 'CLR';
}

// ===========================
//  CLICK HANDLER
// ===========================
document.querySelector('.calc-shell').addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const { action, value } = btn.dataset;
  switch (action) {
    case 'number':   doNumber(value);   break;
    case 'decimal':  doDecimal();       break;
    case 'operator': doOperator(value); break;
    case 'equals':   doEquals();        break;
    case 'clear':    doClear();         break;
    case 'sign':     doSign();          break;
    case 'percent':  doPercent();       break;
  }
});

// ===========================
//  KEYBOARD SUPPORT
// ===========================
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  const k = e.key;
  if (k >= '0' && k <= '9')           { e.preventDefault(); doNumber(k); }
  else if (k === '.')                  { e.preventDefault(); doDecimal(); }
  else if (k === '+')                  { e.preventDefault(); doOperator('+'); }
  else if (k === '-')                  { e.preventDefault(); doOperator('−'); }
  else if (k === '*')                  { e.preventDefault(); doOperator('×'); }
  else if (k === '/')                  { e.preventDefault(); doOperator('÷'); }
  else if (k === 'Enter' || k === '=') { e.preventDefault(); doEquals(); }
  else if (k === 'Escape')             { e.preventDefault(); doClear(); }
  else if (k === '%')                  { e.preventDefault(); doPercent(); }
  else if (k === 'Backspace') {
    e.preventDefault();
    if (state.current.length > 1 && state.current !== 'Error') {
      state.current = state.current.slice(0, -1) || '0';
    } else {
      state.current    = '0';
      state.freshStart = true;
    }
    setDisplay(state.current);
    refreshClear();
  }
});

// ===========================
//  INIT
// ===========================
setDisplay('0');
setMode('READY');

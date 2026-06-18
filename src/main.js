// main.js
// Wires the DOM (index.html) to the CalculatorState model and manages the
// Shift toggle for inverse scientific functions (ADR-002).

import { CalculatorState } from './calculator.js';

const state = new CalculatorState();
let shiftActive = false;

const valueEl = document.getElementById('value');
const expressionEl = document.getElementById('expression');
const shiftBtn = document.getElementById('shiftBtn');
const sciButtons = document.querySelectorAll('.btn.sci[data-action="sci"], .btn[data-action="power"]');

function render() {
  valueEl.textContent = state.getDisplayValue();
  expressionEl.textContent = state.getExpression();
}

function setShift(active) {
  shiftActive = active;
  shiftBtn.classList.toggle('shift-active', active);
  // Swap visible labels for scientific buttons.
  sciButtons.forEach((btn) => {
    const base = btn.dataset.fn || (btn.dataset.action === 'power' ? 'x^y' : '');
    const shiftLabel = btn.dataset.shiftLabel;
    if (!shiftLabel) return;
    if (active) {
      if (!btn.dataset.baseLabel) btn.dataset.baseLabel = btn.textContent;
      btn.textContent = shiftLabel;
    } else if (btn.dataset.baseLabel) {
      btn.textContent = btn.dataset.baseLabel;
    }
  });
}

function handleSci(btn) {
  const action = btn.dataset.action;
  if (action === 'power') {
    if (shiftActive && btn.dataset.shiftFn === 'tenpow') {
      state.applyUnary('tenpow');
    } else {
      state.power();
    }
  } else {
    const fn = shiftActive ? btn.dataset.shiftFn : btn.dataset.fn;
    state.applyUnary(fn);
  }
  if (shiftActive) setShift(false);
  render();
}

document.querySelector('.calculator').addEventListener('click', (e) => {
  const btn = e.target.closest('button.btn');
  if (!btn) return;

  const { action } = btn.dataset;

  if (btn.dataset.digit !== undefined) {
    state.inputDigit(btn.dataset.digit);
  } else if (action === 'decimal') {
    state.inputDecimal();
  } else if (action === 'clear') {
    state.reset();
  } else if (action === 'sign') {
    state.toggleSign();
  } else if (action === 'percent') {
    state.percent();
  } else if (action === 'operator') {
    state.setOperator(btn.dataset.op);
  } else if (action === 'equals') {
    state.finish();
  } else if (action === 'shift') {
    setShift(!shiftActive);
    return; // no value change
  } else if (action === 'sci' || action === 'power') {
    handleSci(btn);
    return;
  }

  render();
});

// Keyboard support for common keys.
window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') state.inputDigit(e.key);
  else if (e.key === '.') state.inputDecimal();
  else if (['+', '-', '*', '/'].includes(e.key)) state.setOperator(e.key);
  else if (e.key === 'Enter' || e.key === '=') state.finish();
  else if (e.key === 'Escape') state.reset();
  else return;
  e.preventDefault();
  render();
});

render();

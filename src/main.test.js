/**
 * Tests for main.js — UI controller for the scientific calculator.
 *
 * Because main.js has side-effects at import time (binds DOM events, calls
 * render()), we set up a minimal jsdom environment before importing and expose
 * the three public-ish functions (render, setShift, handleSci) by re-exporting
 * them through a controlled module re-load using jest.resetModules().
 */

import { CalculatorState } from './calculator.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function buildDOM() {
  document.body.innerHTML = `
    <div class="calculator">
      <span id="value">0</span>
      <span id="expression"></span>
      <button id="shiftBtn" data-action="shift">Shift</button>

      <!-- sci button with shift label -->
      <button
        class="btn sci"
        data-action="sci"
        data-fn="sin"
        data-shift-fn="asin"
        data-shift-label="asin"
      >sin</button>

      <!-- power button with shift label -->
      <button
        class="btn"
        data-action="power"
        data-shift-fn="tenpow"
        data-shift-label="10^x"
      >x^y</button>

      <!-- digit button -->
      <button class="btn" data-digit="5">5</button>

      <!-- equals button -->
      <button class="btn" data-action="equals">=</button>
    </div>
  `;
}

// ─── module-level setup ──────────────────────────────────────────────────────

// We need a fresh module for each test group so that the module-level `state`
// and `shiftActive` variables start clean.  The simplest approach is to load
// the module once after setting up the DOM and expose the internals via spying
// on CalculatorState.

jest.mock('./calculator.js');

let mockState;

beforeEach(() => {
  // Reset the DOM.
  buildDOM();

  // Build a fresh mock instance that the module will use.
  mockState = {
    getDisplayValue: jest.fn().mockReturnValue('0'),
    getExpression: jest.fn().mockReturnValue(''),
    inputDigit: jest.fn(),
    inputDecimal: jest.fn(),
    reset: jest.fn(),
    toggleSign: jest.fn(),
    percent: jest.fn(),
    setOperator: jest.fn(),
    finish: jest.fn(),
    power: jest.fn(),
    applyUnary: jest.fn(),
  };

  CalculatorState.mockImplementation(() => mockState);

  // Re-load the module so it picks up the fresh DOM and fresh mock.
  jest.resetModules();
});

// ─── test 1 — render updates the DOM ────────────────────────────────────────

test('render(): displays getDisplayValue and getExpression in the DOM', async () => {
  mockState.getDisplayValue.mockReturnValue('42');
  mockState.getExpression.mockReturnValue('6 × 7');

  // Dynamically import so we get a clean module after resetModules().
  await import('./main.js');

  // The module calls render() immediately on load.
  expect(document.getElementById('value').textContent).toBe('42');
  expect(document.getElementById('expression').textContent).toBe('6 × 7');
});

// ─── test 2 — setShift toggles the shift-active CSS class ───────────────────

test('setShift(true) adds shift-active class to shiftBtn and swaps sci labels', async () => {
  await import('./main.js');

  const shiftBtn = document.getElementById('shiftBtn');
  // Simulate a click on the shift button to invoke setShift(true).
  shiftBtn.click();

  expect(shiftBtn.classList.contains('shift-active')).toBe(true);

  // The sin button should now show its shift label.
  const sinBtn = document.querySelector('[data-fn="sin"]');
  expect(sinBtn.textContent).toBe('asin');
});

// ─── test 3 — setShift(false) restores original labels ───────────────────────

test('setShift(false) removes shift-active class and restores original labels', async () => {
  await import('./main.js');

  const shiftBtn = document.getElementById('shiftBtn');

  // Toggle on then off.
  shiftBtn.click(); // → true
  shiftBtn.click(); // → false

  expect(shiftBtn.classList.contains('shift-active')).toBe(false);

  const sinBtn = document.querySelector('[data-fn="sin"]');
  expect(sinBtn.textContent).toBe('sin');
});

// ─── test 4 — handleSci calls applyUnary with the correct fn ─────────────────

test('handleSci: clicking a sci button without shift calls applyUnary with base fn', async () => {
  await import('./main.js');

  const sinBtn = document.querySelector('[data-fn="sin"]');
  sinBtn.click();

  expect(mockState.applyUnary).toHaveBeenCalledWith('sin');
  expect(mockState.applyUnary).toHaveBeenCalledTimes(1);
});

// ─── test 5 — handleSci with shift active calls applyUnary with shiftFn ──────

test('handleSci: clicking a sci button while shift is active calls applyUnary with shiftFn', async () => {
  await import('./main.js');

  // Activate shift first.
  document.getElementById('shiftBtn').click();

  const sinBtn = document.querySelector('[data-fn="sin"]');
  sinBtn.click();

  expect(mockState.applyUnary).toHaveBeenCalledWith('asin');
  // Shift should be deactivated after the sci action.
  expect(document.getElementById('shiftBtn').classList.contains('shift-active')).toBe(false);
});

// ─── test 6 — handleSci power button with shift calls applyUnary('tenpow') ───

test('handleSci: clicking power button while shift active calls applyUnary("tenpow")', async () => {
  await import('./main.js');

  // Activate shift.
  document.getElementById('shiftBtn').click();

  const powerBtn = document.querySelector('[data-action="power"]');
  powerBtn.click();

  expect(mockState.applyUnary).toHaveBeenCalledWith('tenpow');
  expect(mockState.power).not.toHaveBeenCalled();
});
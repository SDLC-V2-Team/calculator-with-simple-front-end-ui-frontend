// Node built-in test runner: `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CalculatorState } from '../src/calculator.js';

test('basic addition', () => {
  const c = new CalculatorState();
  c.inputDigit('2');
  c.setOperator('+');
  c.inputDigit('3');
  c.finish();
  assert.equal(c.getDisplayValue(), '5');
});

test('division by zero returns Error', () => {
  const c = new CalculatorState();
  c.inputDigit('5');
  c.setOperator('/');
  c.inputDigit('0');
  c.finish();
  assert.equal(c.getDisplayValue(), 'Error');
});

test('sqrt of 9 is 3', () => {
  const c = new CalculatorState();
  c.inputDigit('9');
  c.applyUnary('sqrt');
  assert.equal(c.getDisplayValue(), '3');
});

test('sin(30 degrees) ~= 0.5', () => {
  const c = new CalculatorState();
  c.inputDigit('3');
  c.inputDigit('0');
  c.applyUnary('sin');
  assert.ok(Math.abs(parseFloat(c.getDisplayValue()) - 0.5) < 1e-9);
});

test('log10(100) is 2', () => {
  const c = new CalculatorState();
  c.inputDigit('1');
  c.inputDigit('0');
  c.inputDigit('0');
  c.applyUnary('log');
  assert.equal(c.getDisplayValue(), '2');
});

test('power 2 ^ 10 is 1024', () => {
  const c = new CalculatorState();
  c.inputDigit('2');
  c.power();
  c.inputDigit('1');
  c.inputDigit('0');
  c.finish();
  assert.equal(c.getDisplayValue(), '1024');
});

test('factorial of 5 is 120', () => {
  const c = new CalculatorState();
  c.inputDigit('5');
  c.applyUnary('factorial');
  assert.equal(c.getDisplayValue(), '120');
});

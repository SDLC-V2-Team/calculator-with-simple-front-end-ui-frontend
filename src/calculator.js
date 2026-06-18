// calculator.js
// CalculatorState manages all numeric state for both arithmetic (existing)
// and scientific operations. Per ADR-001 scientific functions are added as
// methods on this class, reusing the standard JavaScript Math object instead of
// a third-party dependency.

export class CalculatorState {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentValue = '0';   // string being typed / displayed
    this.previousValue = null; // stored operand for pending binary op
    this.operator = null;      // pending binary operator (+, -, *, /)
    this.expression = '';      // human-readable expression trace
    this.overwrite = true;     // next digit replaces currentValue
  }

  // ---- Input handling (arithmetic core) ----

  inputDigit(digit) {
    if (this.overwrite) {
      this.currentValue = String(digit);
      this.overwrite = false;
    } else {
      this.currentValue =
        this.currentValue === '0' ? String(digit) : this.currentValue + digit;
    }
  }

  inputDecimal() {
    if (this.overwrite) {
      this.currentValue = '0.';
      this.overwrite = false;
      return;
    }
    if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
    }
  }

  toggleSign() {
    if (this.currentValue === '0') return;
    this.currentValue = this.currentValue.startsWith('-')
      ? this.currentValue.slice(1)
      : '-' + this.currentValue;
  }

  percent() {
    this.currentValue = String(parseFloat(this.currentValue) / 100);
    this.overwrite = true;
  }

  // ---- Binary operators ----

  setOperator(op) {
    if (this.operator && !this.overwrite) {
      this.evaluate();
    }
    this.previousValue = parseFloat(this.currentValue);
    this.operator = op;
    this.expression = `${this.previousValue} ${op}`;
    this.overwrite = true;
  }

  evaluate() {
    if (this.operator === null || this.previousValue === null) return;
    const a = this.previousValue;
    const b = parseFloat(this.currentValue);
    let result;
    switch (this.operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/':
        result = b === 0 ? NaN : a / b;
        break;
      default: return;
    }
    this.expression = `${a} ${this.operator} ${b} =`;
    this.currentValue = this._format(result);
    this.previousValue = null;
    this.operator = null;
    this.overwrite = true;
  }

  // ---- Scientific functions (ADR-001) ----
  // Trig functions operate in degrees for intuitive calculator behaviour.

  applyUnary(fnName) {
    const x = parseFloat(this.currentValue);
    let result;
    let label = fnName;
    switch (fnName) {
      case 'sin': result = Math.sin(this._toRad(x)); break;
      case 'cos': result = Math.cos(this._toRad(x)); break;
      case 'tan': result = Math.tan(this._toRad(x)); break;
      case 'asin': result = this._toDeg(Math.asin(x)); break;
      case 'acos': result = this._toDeg(Math.acos(x)); break;
      case 'atan': result = this._toDeg(Math.atan(x)); break;
      case 'log': result = Math.log10(x); break;
      case 'ln': result = Math.log(x); break;
      case 'sqrt': result = Math.sqrt(x); label = '\u221a'; break;
      case 'factorial': result = this._factorial(x); label = 'fact'; break;
      case 'tenpow': result = Math.pow(10, x); label = '10^'; break;
      default: return;
    }
    this.expression = `${label}(${x}) =`;
    this.currentValue = this._format(result);
    this.overwrite = true;
  }

  // Power is a binary operation: base ^ exponent.
  power() {
    this.setOperator('^');
  }

  // Override evaluate path for the ^ operator.
  evaluatePower() {
    if (this.previousValue === null) return;
    const result = Math.pow(this.previousValue, parseFloat(this.currentValue));
    this.expression = `${this.previousValue} ^ ${this.currentValue} =`;
    this.currentValue = this._format(result);
    this.previousValue = null;
    this.operator = null;
    this.overwrite = true;
  }

  // Smart equals that respects the ^ operator.
  finish() {
    if (this.operator === '^') {
      this.evaluatePower();
    } else {
      this.evaluate();
    }
  }

  // ---- Helpers ----

  _toRad(deg) { return (deg * Math.PI) / 180; }
  _toDeg(rad) { return (rad * 180) / Math.PI; }

  _factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    let acc = 1;
    for (let i = 2; i <= n; i++) acc *= i;
    return acc;
  }

  _format(num) {
    if (Number.isNaN(num)) return 'Error';
    if (!Number.isFinite(num)) return 'Error';
    // Trim floating point noise while keeping precision.
    return String(parseFloat(num.toPrecision(12)));
  }

  // Display getters consumed by the UI layer.
  getDisplayValue() { return this.currentValue; }
  getExpression() { return this.expression; }
}

import { CalculatorState } from './calculator.js';

describe('CalculatorState', () => {
  let calc;

  beforeEach(() => {
    calc = new CalculatorState();
  });

  describe('Arithmetic operations', () => {
    test('happy path: addition of two numbers', () => {
      calc.inputDigit(7);
      calc.setOperator('+');
      calc.inputDigit(3);
      calc.evaluate();
      expect(calc.getDisplayValue()).toBe('10');
      expect(calc.getExpression()).toBe('7 + 3 =');
    });

    test('happy path: chained multiplication and subtraction', () => {
      calc.inputDigit(6);
      calc.setOperator('*');
      calc.inputDigit(4);
      calc.evaluate(); // 6 * 4 = 24
      expect(calc.getDisplayValue()).toBe('24');

      calc.setOperator('-');
      calc.inputDigit(4);
      calc.evaluate(); // 24 - 4 = 20
      expect(calc.getDisplayValue()).toBe('20');
    });

    test('edge case: division by zero returns Error', () => {
      calc.inputDigit(9);
      calc.setOperator('/');
      calc.inputDigit(0);
      calc.evaluate();
      expect(calc.getDisplayValue()).toBe('Error');
    });

    test('happy path: percent converts current value', () => {
      calc.inputDigit(5);
      calc.inputDigit(0);
      calc.percent();
      expect(calc.getDisplayValue()).toBe('0.5');
    });

    test('happy path: toggleSign negates current value', () => {
      calc.inputDigit(8);
      calc.toggleSign();
      expect(calc.getDisplayValue()).toBe('-8');
      calc.toggleSign();
      expect(calc.getDisplayValue()).toBe('8');
    });
  });

  describe('Scientific — trigonometric functions', () => {
    test('happy path: sin(90) === 1', () => {
      calc.inputDigit(9);
      calc.inputDigit(0);
      calc.applyUnary('sin');
      expect(parseFloat(calc.getDisplayValue())).toBeCloseTo(1, 10);
      expect(calc.getExpression()).toBe('sin(90) =');
    });

    test('happy path: cos(0) === 1', () => {
      calc.inputDigit(0);
      calc.applyUnary('cos');
      expect(parseFloat(calc.getDisplayValue())).toBeCloseTo(1, 10);
    });

    test('happy path: tan(45) === 1', () => {
      calc.inputDigit(4);
      calc.inputDigit(5);
      calc.applyUnary('tan');
      expect(parseFloat(calc.getDisplayValue())).toBeCloseTo(1, 10);
    });

    test('happy path: asin(1) === 90 degrees', () => {
      calc.inputDigit(1);
      calc.applyUnary('asin');
      expect(parseFloat(calc.getDisplayValue())).toBeCloseTo(90, 10);
      expect(calc.getExpression()).toBe('asin(1) =');
    });

    test('happy path: acos(1) === 0 degrees', () => {
      calc.inputDigit(1);
      calc.applyUnary('acos');
      expect(parseFloat(calc.getDisplayValue())).toBeCloseTo(0, 10);
    });

    test('happy path: atan(1) === 45 degrees', () => {
      calc.inputDigit(1);
      calc.applyUnary('atan');
      expect(parseFloat(calc.getDisplayValue())).toBeCloseTo(45, 10);
    });
  });

  describe('Scientific — log/ln/sqrt', () => {
    test('happy path: log(100) === 2', () => {
      calc.inputDigit(1);
      calc.inputDigit(0);
      calc.inputDigit(0);
      calc.applyUnary('log');
      expect(parseFloat(calc.getDisplayValue())).toBeCloseTo(2, 10);
      expect(calc.getExpression()).toBe('log(100) =');
    });

    test('happy path: ln(e) === 1', () => {
      // type Math.E via currentValue directly for precision
      calc.currentValue = String(Math.E);
      calc.applyUnary('ln');
      expect(parseFloat(calc.getDisplayValue())).toBeCloseTo(1, 10);
    });

    test('happy path: sqrt(9) === 3', () => {
      calc.inputDigit(9);
      calc.applyUnary('sqrt');
      expect(parseFloat(calc.getDisplayValue())).toBeCloseTo(3, 10);
      expect(calc.getExpression()).toBe('√(9) =');
    });

    test('edge case: sqrt of negative number returns Error', () => {
      calc.inputDigit(4);
      calc.toggleSign(); // -4
      calc.applyUnary('sqrt');
      expect(calc.getDisplayValue()).toBe('Error');
    });
  });

  describe('Scientific — factorial', () => {
    test('happy path: factorial(5) === 120', () => {
      calc.inputDigit(5);
      calc.applyUnary('factorial');
      expect(calc.getDisplayValue()).toBe('120');
      expect(calc.getExpression()).toBe('fact(5) =');
    });

    test('happy path: factorial(0) === 1', () => {
      calc.inputDigit(0);
      calc.applyUnary('factorial');
      expect(calc.getDisplayValue()).toBe('1');
    });

    test('edge case: factorial of negative number returns Error', () => {
      calc.inputDigit(3);
      calc.toggleSign(); // -3
      calc.applyUnary('factorial');
      expect(calc.getDisplayValue()).toBe('Error');
    });

    test('edge case: factorial of non-integer returns Error', () => {
      calc.currentValue = '3.5';
      calc.applyUnary('factorial');
      expect(calc.getDisplayValue()).toBe('Error');
    });
  });

  describe('Scientific — power and tenpow', () => {
    test('happy path: 2 ^ 10 === 1024 via finish()', () => {
      calc.inputDigit(2);
      calc.power(); // sets operator to ^
      calc.inputDigit(1);
      calc.inputDigit(0);
      calc.finish();
      expect(calc.getDisplayValue()).toBe('1024');
      expect(calc.getExpression()).toBe('2 ^ 10 =');
    });

    test('happy path: evaluatePower with base 3 and exponent 3 === 27', () => {
      calc.inputDigit(3);
      calc.power();
      calc.inputDigit(3);
      calc.evaluatePower();
      expect(calc.getDisplayValue()).toBe('27');
    });

    test('happy path: tenpow(3) === 1000', () => {
      calc.inputDigit(3);
      calc.applyUnary('tenpow');
      expect(calc.getDisplayValue()).toBe('1000');
      expect(calc.getExpression()).toBe('10^(3) =');
    });
  });

  describe('Error paths and edge cases', () => {
    test('error path: applyUnary with unknown function name is a no-op', () => {
      calc.inputDigit(5);
      const before = calc.getDisplayValue();
      calc.applyUnary('unknownFn');
      expect(calc.getDisplayValue()).toBe(before);
    });

    test('edge case: evaluate does nothing without operator set', () => {
      calc.inputDigit(7);
      calc.evaluate();
      expect(calc.getDisplayValue()).toBe('7');
    });

    test('edge case: finish delegates to evaluate for standard operators', () => {
      calc.inputDigit(4);
      calc.setOperator('+');
      calc.inputDigit(6);
      calc.finish();
      expect(calc.getDisplayValue()).toBe('10');
    });

    test('edge case: reset clears all state', () => {
      calc.inputDigit(9);
      calc.setOperator('+');
      calc.inputDigit(1);
      calc.reset();
      expect(calc.getDisplayValue()).toBe('0');
      expect(calc.getExpression()).toBe('');
      expect(calc.operator).toBeNull();
      expect(calc.previousValue).toBeNull();
    });

    test('edge case: inputDecimal does not add second decimal point', () => {
      calc.inputDigit(3);
      calc.inputDecimal();
      calc.inputDecimal();
      expect(calc.getDisplayValue()).toBe('3.');
    });

    test('edge case: setOperator chaining evaluates pending operation', () => {
      calc.inputDigit(2);
      calc.setOperator('+');
      calc.inputDigit(3);
      calc.setOperator('*'); // should evaluate 2 + 3 = 5 first
      calc.inputDigit(4);
      calc.evaluate();
      expect(calc.getDisplayValue()).toBe('20');
    });
  });
});
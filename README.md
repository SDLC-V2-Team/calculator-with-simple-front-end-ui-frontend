# Scientific Calculator

A lightweight, dependency-free **scientific calculator** running entirely in the browser with vanilla JavaScript (ES modules). It extends the existing `CalculatorState` arithmetic engine with scientific functions, fulfilling the `scientific calculator` requirement.

## Architecture

This implementation follows the project ADRs:

- **ADR-001 — Add Scientific Functions to CalculatorState:** Scientific functions (`sin`, `cos`, `tan`, `log`, `sqrt`, power) are added as methods on the existing `CalculatorState` class in `src/calculator.js`, reusing the native JavaScript `Math` object (no third-party math library).
- **ADR-002 — Add Scientific Function Buttons to UI:** A compact row of scientific buttons sits above the number pad. A **Shift** key toggles inverse functions (`asin`, `acos`, `atan`, `ln`, `n!`, `10^x`).

## Tech Stack

| Concern | Choice |
|--------|--------|
| Language | JavaScript (ES Modules) |
| UI | HTML + CSS (no framework) |
| State | `CalculatorState` class |
| Tests | Node.js built-in test runner |
| Dev server | `serve` |

## Project Structure

```
.
├── index.html          # Calculator markup (display, sci row, number pad)
├── styles.css          # Dark theme styling
├── src/
│   ├── calculator.js   # CalculatorState model (arithmetic + scientific)
│   └── main.js         # DOM controller + Shift toggle + keyboard input
├── tests/
│   └── calculator.test.js
├── package.json
└── README.md
```

## Getting Started

```bash
# Install the dev server
npm install

# Run locally (serves the static files)
npm start
# then open the printed URL (e.g. http://localhost:3000)
```

## Running Tests

```bash
npm test
```

## Features

- Standard arithmetic: `+`, `-`, `×`, `÷`, `%`, sign toggle, decimals
- Scientific functions: `sin`, `cos`, `tan`, `log`, `√`, `x^y`
- Shifted (inverse) functions: `asin`, `acos`, `atan`, `ln`, `n!`, `10^x`
- Trigonometry in **degrees** for intuitive use
- Full keyboard support (digits, operators, `Enter` = evaluate, `Esc` = clear)
- Graceful `Error` handling for invalid operations (e.g. division by zero)

## Notes

- Trig inputs/outputs use degrees.
- Power (`x^y`) is treated as a binary operator: enter the base, press `x^y`, enter the exponent, then `=`.

## License

MIT

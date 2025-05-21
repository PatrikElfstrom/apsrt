# APSRT

**Automated property-based snapshot regression testing**

APSRT is a TypeScript tool for advanced, automated regression testing. It leverages property-based testing, snapshot validation, and static code analysis to generate and run robust tests for your exported functions—no manual test writing required.

> **Note:** This project is a proof of concept—an experiment built in about an hour. Contributions are welcome! If you have ideas or improvements, feel free to open a PR.

**Known limitations:**

- Not all argument types are supported yet.
- Type inference for arguments with TypeScript generics can be improved.

## Features

- **Automated test generation**: Analyzes your TypeScript source files and generates property-based tests for all exported functions.
- **Property-based testing**: Uses [fast-check](https://github.com/dubzzz/fast-check) to generate randomized, type-driven input samples.
- **Snapshot-based regression**: Captures and compares function outputs using [Vitest](https://vitest.dev/) snapshots to detect regressions.
- **TypeScript AST introspection**: Utilizes [ts-morph](https://ts-morph.com/) for static analysis of function signatures and parameter types.
- **Supports arrays, primitives, and higher-order functions** out of the box.

## How it works

1. **Scans** your `src/` directory for `.ts` files (excluding test files).
2. **Analyzes** each file’s exported functions and their parameter types.
3. **Generates** property-based tests using `fast-check` arbitraries, based on parameter types.
4. **Runs** each function with randomized, reproducible inputs and snapshots the results.
5. **Detects regressions** by comparing new outputs to stored snapshots.

## Example

Suppose you have a function in `src/mathUtils.ts`:

```ts
export function add(a: number, b: number): number {
  return a + b;
}
```

APSRT will automatically generate and run a property-based snapshot test for `add`, using random numbers as inputs.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- TypeScript project with a `src/` directory

### Installation

Clone this repo and install dependencies:

```sh
npm install
```

### Usage

Run all generated property-based snapshot tests:

```sh
npm run t
```

Update all snapshots:

```sh
npm run u
```

Watch mode (for development):

```sh
npm run w
```

Clear the ts-morph cache:

```sh
npm run c
```

## Project Structure

- `src/` — Your TypeScript source files (functions to be tested)
- `script/` — APSRT’s core logic (test generation, type analysis, etc.)
- `dynamic.test.ts` — Main entry point for dynamic test generation

## How to Extend

- Add more functions to your `src/` directory—APSRT will pick them up automatically.
- To support more complex types or custom arbitraries, extend `arbForType.ts`.

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [fast-check](https://github.com/dubzzz/fast-check)
- [Vitest](https://vitest.dev/)
- [ts-morph](https://ts-morph.com/)
- [globby](https://github.com/sindresorhus/globby)

## Why APSRT?

- **Zero-maintenance**: No need to write or update tests for every function.
- **Regression-proof**: Snapshots catch unexpected changes in outputs.
- **Type-driven**: Leverages your TypeScript types for smarter test generation.
- **Nerdy and advanced**: Combines fuzzing, static analysis, and snapshotting for maximum coverage.

## License

MIT

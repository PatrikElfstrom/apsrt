import { describe, it, expect } from "vitest";
import fc from "fast-check";
import * as path from "path";
import { getTsMorphInfo } from "./tsmorphCache";
import { packageDirectory } from "pkg-dir";
import { arbForType } from "./arbForType";
import { globbySync } from "globby";

const RANDOM_SEED = 12345;
const SAMPLES_PER_FUNCTION = 10;

// Find project root and source directory
const PROJECT_ROOT_DIR = await packageDirectory();
if (!PROJECT_ROOT_DIR) throw new Error("Project root not found");
const SOURCE_DIR = path.join(PROJECT_ROOT_DIR, "src");

// Gather all .ts files (excluding test files)
const sourceFiles = globbySync(["**/*.ts", "!**/*.test.ts"], {
  cwd: SOURCE_DIR,
  absolute: true,
});

// Preload ts-morph info and modules for all files in parallel
// https://ts-morph.com - TypeScript AST (Abstract Syntax Tree)
const fileAnalysisAndModules = await Promise.all(
  sourceFiles.map(async (sourceFilePath) => {
    const [analysis, moduleExports] = await Promise.all([
      getTsMorphInfo(sourceFilePath),
      import(sourceFilePath),
    ]);
    return { sourceFilePath, analysis, moduleExports };
  })
);

// Generate property-based snapshot tests for each exported function
for (const {
  sourceFilePath,
  analysis,
  moduleExports,
} of fileAnalysisAndModules) {
  for (const exportedFn of analysis.functions) {
    const exportedFnName = exportedFn.name as keyof typeof moduleExports;
    const exportedParamTypes = exportedFn.paramTypes;
    const arbitrariesForParams = exportedParamTypes.map(arbForType);
    const testCaseTitle = `${path.basename(sourceFilePath)}\t${String(
      exportedFnName
    )}()`;

    describe(testCaseTitle, () => {
      it("matches snapshot", () => {
        const inputSamples = arbitrariesForParams.length
          ? fc.sample(fc.tuple(...arbitrariesForParams), {
              numRuns: SAMPLES_PER_FUNCTION,
              seed: RANDOM_SEED,
            })
          : fc.sample(fc.constant([]), {
              numRuns: SAMPLES_PER_FUNCTION,
              seed: RANDOM_SEED,
            });

        const testResults = inputSamples.map((inputArgs) => {
          try {
            const output = moduleExports[exportedFnName](...inputArgs);
            return { input: inputArgs, output };
          } catch (e: any) {
            return { input: inputArgs, error: e?.message ?? String(e) };
          }
        });

        expect(testResults).toMatchSnapshot();
      });
    });
  }
}

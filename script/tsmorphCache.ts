import { Project } from "ts-morph";
import * as path from "path";
import { statSync, readFileSync, writeFileSync, existsSync } from "fs";
import { findConfigFile, sys } from "typescript";
import { packageDirectorySync } from "pkg-dir";

const packageDirectory = packageDirectorySync();
if (!packageDirectory) {
  throw new Error("Could not find package root");
}

const tsConfigFilePath = findConfigFile(packageDirectory, sys.fileExists);
if (!packageDirectory) {
  throw new Error("Could not find tsconfig.json");
}

const CACHE_PATH = path.resolve(packageDirectory, ".tsmorph-cache.json");
let tsmorphCache: Record<string, any> = {};
if (existsSync(CACHE_PATH)) {
  try {
    tsmorphCache = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } catch {
    tsmorphCache = {};
  }
}

let tsMorphProject: Project | undefined;

function getProject() {
  if (!tsMorphProject) {
    tsMorphProject = new Project({
      tsConfigFilePath,
      skipFileDependencyResolution: true,
      skipAddingFilesFromTsConfig: true,
    });
  }

  return tsMorphProject;
}

export function getTsMorphInfo(file: string) {
  const mtime = statSync(file).mtimeMs;
  const cacheKey = file;
  const cached = tsmorphCache[cacheKey];

  if (cached && cached.mtime === mtime) {
    return cached.info;
  }

  const project = getProject();
  const sourceFile =
    project.getSourceFile(file) || project.addSourceFileAtPath(file);

  const functions = sourceFile
    .getFunctions()
    .filter((f) => f.isExported())
    .map((fn) => ({
      name: fn.getName(),
      paramTypes: fn.getParameters().map((p) => p.getType().getText()),
    }));

  const info = { functions };

  tsmorphCache[cacheKey] = { mtime, info };
  writeFileSync(CACHE_PATH, JSON.stringify(tsmorphCache, null, 2));

  return info;
}

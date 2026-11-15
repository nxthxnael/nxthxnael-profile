// Lets plain Node load app modules: the "@/" alias from tsconfig, and the
// extensionless "next/*" imports that only the Next bundler resolves.
import { pathToFileURL } from "node:url";
import path from "node:path";

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const file = path.resolve("src", specifier.slice(2)) + ".ts";
    return nextResolve(pathToFileURL(file).href, context);
  }
  if (/^next\/[\w-]+$/.test(specifier)) {
    return nextResolve(`${specifier}.js`, context);
  }
  return nextResolve(specifier, context);
}

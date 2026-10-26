// Lets plain Node load app modules: the "@/" alias from tsconfig, and the
// extensionless "next/server" import that only the Next bundler resolves.
import { pathToFileURL } from "node:url";
import path from "node:path";

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const file = path.resolve("src", specifier.slice(2)) + ".ts";
    return nextResolve(pathToFileURL(file).href, context);
  }
  if (specifier === "next/server") return nextResolve("next/server.js", context);
  return nextResolve(specifier, context);
}

import path from "path";

export function resolveData(p) {
  if (path.isAbsolute(p)) return p;
  return path.join(process.cwd(), p);
}

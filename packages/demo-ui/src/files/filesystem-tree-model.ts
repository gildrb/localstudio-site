export type FileTone = "code" | "data" | "document" | "media" | "neutral" | "script";

const TONE_GROUPS: [FileTone, string[]][] = [
  ["code", ["ts", "tsx", "js", "jsx", "mjs", "cjs", "py", "rs", "go", "rb", "java", "c", "cpp", "h", "swift", "kt"]],
  ["script", ["css", "scss", "sass", "less", "sh", "bash", "zsh", "fish"]],
  ["data", ["json", "yaml", "yml", "toml", "ini", "env", "lock"]],
  ["document", ["md", "mdx", "txt", "rst"]],
  ["media", ["png", "jpg", "jpeg", "gif", "webp", "svg", "mp4", "mov"]],
];

const FILE_TONE_BY_EXT = new Map(
  TONE_GROUPS.flatMap(([tone, extensions]) => extensions.map((extension) => [extension, tone] as const)),
);

export function fileTone(name: string): FileTone {
  const dot = name.lastIndexOf(".");
  const extension = dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
  return FILE_TONE_BY_EXT.get(extension) ?? "neutral";
}

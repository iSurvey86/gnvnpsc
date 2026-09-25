/**
 * Xuất sơ đồ Mermaid từ workflows/*.md → workflows/diagrams/*.png
 *
 * Cách chạy: npm run export:diagrams
 * Cần: @mermaid-js/mermaid-cli (devDependency) — lần đầu có thể tải Chromium.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workflowsDir = join(root, "workflows");
const outDir = join(workflowsDir, "diagrams");
const tmpDir = join(outDir, ".tmp");

const MERMAID_RE = /```mermaid\s*\n([\s\S]*?)```/g;

function findMmdc() {
  const cliJs = join(
    root,
    "node_modules",
    "@mermaid-js",
    "mermaid-cli",
    "src",
    "cli.js",
  );
  if (existsSync(cliJs)) {
    return { mode: "node", entry: cliJs };
  }
  return { mode: "npx" };
}

function runMmdc(mmdPath, pngPath, mmdc) {
  const common = ["-i", mmdPath, "-o", pngPath, "-b", "white"];
  const r =
    mmdc.mode === "node"
      ? spawnSync(process.execPath, [mmdc.entry, ...common], {
          cwd: root,
          stdio: "inherit",
          env: process.env,
        })
      : spawnSync(
          "npx",
          ["-y", "@mermaid-js/mermaid-cli", ...common],
          {
            cwd: root,
            stdio: "inherit",
            shell: process.platform === "win32",
            env: process.env,
          },
        );
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(`mmdc thất bại (exit ${r.status}) cho ${basename(mmdPath)}`);
  }
}

function extractBlocks(md, fileBase) {
  const blocks = [];
  let m;
  let i = 0;
  const re = new RegExp(MERMAID_RE.source, "g");
  while ((m = re.exec(md)) !== null) {
    i += 1;
    const suffix = i === 1 ? "" : `-${i}`;
    blocks.push({
      name: `${fileBase}${suffix}`,
      source: m[1].trim() + "\n",
    });
  }
  return blocks;
}

function main() {
  if (!existsSync(workflowsDir)) {
    console.error("Không thấy thư mục workflows/");
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });
  mkdirSync(tmpDir, { recursive: true });

  const mdFiles = readdirSync(workflowsDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  if (!mdFiles.length) {
    console.error("Không có file .md trong workflows/");
    process.exit(1);
  }

  const all = [];
  for (const file of mdFiles) {
    const base = basename(file, ".md");
    const md = readFileSync(join(workflowsDir, file), "utf8");
    const blocks = extractBlocks(md, base);
    if (!blocks.length) {
      console.log(`— ${file}: không có khối mermaid`);
      continue;
    }
    for (const b of blocks) all.push({ ...b, from: file });
  }

  if (!all.length) {
    console.error("Không tìm thấy khối ```mermaid trong workflows/");
    process.exit(1);
  }

  const mmdc = findMmdc();
  if (mmdc.mode === "npx") {
    console.log(
      "Dùng npx @mermaid-js/mermaid-cli (cài local: npm i -D @mermaid-js/mermaid-cli)",
    );
  }

  let ok = 0;
  for (const b of all) {
    const mmdPath = join(tmpDir, `${b.name}.mmd`);
    const pngPath = join(outDir, `${b.name}.png`);
    writeFileSync(mmdPath, b.source, "utf8");
    console.log(`→ ${b.from} → diagrams/${b.name}.png`);
    try {
      runMmdc(mmdPath, pngPath, mmdc);
      ok += 1;
    } catch (e) {
      console.error(e instanceof Error ? e.message : e);
      process.exitCode = 1;
    }
  }

  try {
    rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }

  console.log(`\nXong: ${ok}/${all.length} sơ đồ → ${outDir}`);
  if (ok < all.length) process.exit(1);
}

main();

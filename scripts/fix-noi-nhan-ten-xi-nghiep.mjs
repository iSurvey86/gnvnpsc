/**
 * Sửa «Nơi nhận» trên mẫu THA / TVGS:
 * «XN Dịch vụ Điện lực {ten_tinh}» → «{ten_xi_nghiep}»
 * (theo XN được giao, không theo địa bàn dự án)
 *
 * Chạy: node scripts/fix-noi-nhan-ten-xi-nghiep.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEMPLATES = path.join(ROOT, "public", "templates");

const FILES = [
  "qd-giao-nhiem-vu-tvtk_tha.docx",
  "qd-giao-nhiem-vu-tvgs.docx",
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const XML_GAP = "(?:<[^>]+>)*";
const WS_GAP = "(?:\\s|<[^>]+>)+";

function replaceIgnoringXml(xml, search, replace) {
  const parts = search.split(/\s+/).filter((p) => p.length > 0);
  const pattern = parts
    .map((part) => [...part].map((c) => escapeRegex(c)).join(XML_GAP))
    .join(WS_GAP);
  const re = new RegExp(pattern, "g");
  let count = 0;
  const out = xml.replace(re, () => {
    count += 1;
    return replace;
  });
  return { out, count };
}

function unzip(zipPath, destDir) {
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}' -Force`,
    ],
    { stdio: "inherit" },
  );
}

function zipDir(srcDir, zipPath) {
  fs.rmSync(zipPath, { force: true });
  // Compress contents (not the folder itself)
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${srcDir.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`,
    ],
    { stdio: "inherit" },
  );
}

for (const file of FILES) {
  const src = path.join(TEMPLATES, file);
  const work = path.join(os.tmpdir(), `fix-noi-nhan-${path.basename(file, ".docx")}`);
  const zipCopy = path.join(os.tmpdir(), `${path.basename(file, ".docx")}-src.zip`);
  const outZip = path.join(os.tmpdir(), `${path.basename(file, ".docx")}-out.zip`);

  fs.copyFileSync(src, zipCopy);
  unzip(zipCopy, work);

  const docXml = path.join(work, "word", "document.xml");
  let xml = fs.readFileSync(docXml, "utf8");
  const before = (xml.match(/\{ten_tinh\}/g) || []).length;

  let { out, count } = replaceIgnoringXml(
    xml,
    "XN Dịch vụ Điện lực {ten_tinh}",
    "{ten_xi_nghiep}",
  );
  xml = out;

  if (count === 0) {
    ({ out, count } = replaceIgnoringXml(
      xml,
      "XN Dich vu Dien luc {ten_tinh}",
      "{ten_xi_nghiep}",
    ));
    xml = out;
  }

  console.log(
    `${file}: replaced=${count}, {ten_tinh} before=${before} after=${(xml.match(/\{ten_tinh\}/g) || []).length}`,
  );

  if (count === 0) {
    console.error(`FAIL: pattern not found in ${file}`);
    process.exitCode = 1;
    continue;
  }

  fs.writeFileSync(docXml, xml);
  zipDir(work, outZip);
  fs.copyFileSync(outZip, src);
  console.log(`updated ${src}`);
}

/**
 * Đổi delimiter {{tag}} → {tag} (chuẩn docxtemplater mặc định).
 * Chạy: node scripts/convert-template-delimiters.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEMPLATES = path.join(ROOT, "public", "templates");
const WORK = path.join(ROOT, "tmp-templates-delim");

const XML_GAP = "(?:<[^>]+>)*";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceIgnoringXml(xml, search, replace) {
  const pattern = [...search].map((c) => escapeRegex(c)).join(XML_GAP);
  return xml.replace(new RegExp(pattern, "g"), () => replace);
}

function unzipDocx(docxPath, destDir) {
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });
  const zipPath = path.join(destDir, "_src.zip");
  fs.copyFileSync(docxPath, zipPath);
  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${path.join(destDir, "unzip").replace(/'/g, "''")}' -Force`,
    ],
    { stdio: "pipe" },
  );
}

function zipDocx(unzipDir, docxPath) {
  if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);
  const ps = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory(
  '${unzipDir.replace(/'/g, "''")}',
  '${docxPath.replace(/'/g, "''")}'
)
`;
  execFileSync("powershell.exe", ["-NoProfile", "-Command", ps], {
    stdio: "pipe",
  });
}

function processFile(fileName) {
  const src = path.join(TEMPLATES, fileName);
  const work = path.join(WORK, path.basename(fileName, ".docx"));
  unzipDocx(src, work);
  const xmlPath = path.join(work, "unzip", "word", "document.xml");
  let xml = fs.readFileSync(xmlPath, "utf8");
  // {{ → {  rồi  }} → }  (XML-aware)
  xml = replaceIgnoringXml(xml, "{{", "{");
  xml = replaceIgnoringXml(xml, "}}", "}");
  fs.writeFileSync(xmlPath, xml, "utf8");
  zipDocx(path.join(work, "unzip"), src);

  const plain = xml.replace(/<[^>]+>/g, "");
  const doubleLeft = (plain.match(/\{\{/g) || []).length;
  const tags = [...new Set(plain.match(/\{[a-z0-9_]+\}/g) || [])].sort();
  return { fileName, doubleLeft, tags, tagCount: tags.length };
}

const FILES = [
  "qd-giao-nhiem-vu-tvtk_110.docx",
  "qd-giao-nhiem-vu-tvtk_tha.docx",
  "qd-giao-nhiem-vu-tnhc.docx",
];

fs.rmSync(WORK, { recursive: true, force: true });
const results = FILES.map(processFile);
for (const r of results) {
  console.log(`\n=== ${r.fileName} ===`);
  console.log(`Tags {…}: ${r.tagCount} — còn {{ : ${r.doubleLeft}`);
  console.log(r.tags.join(", "));
}
fs.rmSync(WORK, { recursive: true, force: true });
console.log("\nXong — delimiter chuẩn docxtemplater: {tag}");

/**
 * Thu hẹp cột TMĐT, nới cột Quy mô trên 3 mẫu Word phụ lục.
 * Chạy: node scripts/fix-phu-luc-col-widths.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const PizZip = require("pizzip");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATES = path.join(ROOT, "public", "templates");

function rewrite(buf, mutateXml) {
  const src = new PizZip(buf);
  const out = new PizZip();
  for (const [name, entry] of Object.entries(src.files)) {
    if (entry.dir) continue;
    const fixed = name.replace(/\\/g, "/");
    if (/^word\/document\.xml$/i.test(fixed)) {
      out.file(fixed, mutateXml(entry.asText()));
    } else {
      out.file(fixed, entry.asUint8Array());
    }
  }
  return out.generate({ type: "nodebuffer", compression: "DEFLATE" });
}

/** Đổi w:w trên gridCol theo index (0-based) trong bảng chứa marker */
function adjustGridInTable(xml, marker, updates) {
  const idx = xml.indexOf(marker);
  if (idx < 0) return xml;
  const tblStart = xml.lastIndexOf("<w:tbl", idx);
  const tblEnd = xml.indexOf("</w:tbl>", idx) + 8;
  if (tblStart < 0 || tblEnd < 8) return xml;
  let tbl = xml.slice(tblStart, tblEnd);
  let i = 0;
  tbl = tbl.replace(/<w:gridCol([^>]*)\/>/g, (full, attrs) => {
    const cur = i++;
    if (!(cur in updates)) return full;
    const next = updates[cur];
    if (/w:w="\d+"/.test(attrs)) {
      return `<w:gridCol${attrs.replace(/w:w="\d+"/, `w:w="${next}"`)}/>`;
    }
    return `<w:gridCol w:w="${next}"/>`;
  });
  return xml.slice(0, tblStart) + tbl + xml.slice(tblEnd);
}

function process(fileName, updates) {
  const p = path.join(TEMPLATES, fileName);
  const buf = fs.readFileSync(p);
  const next = rewrite(buf, (xml) =>
    adjustGridInTable(xml, "{#cong_trinh}", updates),
  );
  fs.writeFileSync(p, next);
  console.log("OK", fileName, updates);
}

// STT ~616; TMĐT chỉ nhỉnh hơn STT; phần dư chuyển sang Quy mô
// 110: STT, Tên, Quy mô, TMĐT, Tiến độ
process("qd-giao-nhiem-vu-tvtk_110.docx", {
  2: 5750, // quy mô (was 4863)
  3: 900, // tmdt (was 1788)
});

// THA: STT, Tên, Quy mô, TMĐT, …
process("qd-giao-nhiem-vu-tvtk_tha.docx", {
  2: 2800, // quy mô (was 2112)
  3: 850, // tmdt (was 1419) — chênh +119 vào tên? đã cộng vào quy mô
});

// TNHC grid: indices khác — STT lớn bất thường; chỉnh theo thứ tự
// 0 STT, 1 tên?, 2 quy mô?, 3 tmdt? — từ inspect: 1894,1145,1659,1486,...
process("qd-giao-nhiem-vu-tnhc.docx", {
  2: 2400, // quy mô rộng hơn
  3: 700, // tmdt hẹp
});

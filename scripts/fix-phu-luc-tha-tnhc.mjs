/**
 * Sửa phụ lục mẫu THA + Thí nghiệm (TNHC):
 * - Chuẩn hóa zip path → dấu / (Word từ chối word\document.xml)
 * - Bọc {#cong_trinh}…{/cong_trinh}
 * - Tag linh hoạt {ct_ten}/{ct_quy_mo}/…
 *
 * Chạy: node scripts/fix-phu-luc-tha-tnhc.mjs
 * Khôi phục gốc git rồi sửa (an toàn khi chạy lại).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const PizZip = require("pizzip");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEMPLATES = path.join(ROOT, "public", "templates");
const GIT_REF = "dc7226d";

function loadFromGit(fileName) {
  return execSync(`git show ${GIT_REF}:public/templates/${fileName}`, {
    cwd: ROOT,
    maxBuffer: 20 * 1024 * 1024,
  });
}

/** Đọc document.xml dù path / hay \\ */
function readDocumentXml(zip) {
  const name = Object.keys(zip.files).find((n) =>
    /word[/\\]document\.xml$/i.test(n),
  );
  if (!name) throw new Error("Không thấy word/document.xml");
  return zip.file(name).asText();
}

/** Ghi lại toàn bộ zip với path chuẩn / (OOXML) */
function writeNormalizedDocx(outPath, sourceBuf, documentXml) {
  const src = new PizZip(sourceBuf);
  const out = new PizZip();
  for (const [name, entry] of Object.entries(src.files)) {
    if (entry.dir) continue;
    const fixed = name.replace(/\\/g, "/");
    if (/^word\/document\.xml$/i.test(fixed)) {
      out.file(fixed, documentXml);
    } else {
      out.file(fixed, entry.asUint8Array());
    }
  }
  fs.writeFileSync(
    outPath,
    out.generate({ type: "nodebuffer", compression: "DEFLATE" }),
  );
}

function findTrStart(xml, at) {
  const before = xml.slice(0, at);
  const matches = [...before.matchAll(/<w:tr(?!Pr)[\s>]/g)];
  if (!matches.length) return -1;
  return matches[matches.length - 1].index;
}

function findRowContaining(xml, marker) {
  const i = xml.indexOf(marker);
  if (i < 0) return null;
  const trStart = findTrStart(xml, i);
  const after = xml.slice(i);
  const trEndRel = after.indexOf("</w:tr>");
  if (trStart < 0 || trEndRel < 0) return null;
  const trEnd = i + trEndRel + "</w:tr>".length;
  return { start: trStart, end: trEnd, row: xml.slice(trStart, trEnd) };
}

function findAllRowsContaining(xml, marker) {
  const out = [];
  let from = 0;
  while (from < xml.length) {
    const i = xml.indexOf(marker, from);
    if (i < 0) break;
    const trStart = findTrStart(xml, i);
    const after = xml.slice(i);
    const trEndRel = after.indexOf("</w:tr>");
    if (trStart < 0 || trEndRel < 0) {
      from = i + marker.length;
      continue;
    }
    const trEnd = i + trEndRel + "</w:tr>".length;
    if (!out.some((r) => r.start === trStart)) {
      out.push({ start: trStart, end: trEnd, row: xml.slice(trStart, trEnd) });
    }
    from = trEnd;
  }
  return out;
}

function replaceCellText(rowXml, oldText, newText) {
  if (!rowXml.includes(oldText)) return rowXml;
  return rowXml.split(oldText).join(newText);
}

/** Không dùng lastIndexOf("<w:r" — sẽ khớp nhầm `<w:tr` */
function findRunStart(xml, at) {
  const a = xml.lastIndexOf("<w:r ", at);
  const b = xml.lastIndexOf("<w:r>", at);
  return Math.max(a, b);
}

function assertTrBalance(xml, label) {
  const open = (xml.match(/<w:tr[\s>]/g) || []).length;
  const close = (xml.match(/<\/w:tr>/g) || []).length;
  if (open !== close) {
    throw new Error(`${label}: lệch <w:tr> mở=${open} đóng=${close}`);
  }
}

/** THA: 1 dòng mẫu đã có tag → loop + ct_ten/ct_quy_mo + cột TVTK/TVGS */
function fixTha(xml) {
  if (xml.includes("{#cong_trinh}")) {
    console.log("THA: đã có loop (bất thường trên bản gốc) — giữ nguyên");
    return xml;
  }
  const hit = findRowContaining(xml, "{ct_khu_vuc}");
  if (!hit) throw new Error("THA: không thấy dòng {ct_khu_vuc}");

  let row = hit.row;
  row = replaceCellText(row, "<w:t>1</w:t>", "<w:t>{#cong_trinh}{stt}</w:t>");

  row = row.replace(
    /<w:t>[^<]*\{ct_khu_vuc\}[^<]*\{nam_ke_hoach\}<\/w:t>/,
    "<w:t>{ct_ten}</w:t>",
  );

  if (row.includes("{ct_quy_mo_dz_trung}")) {
    const a = row.indexOf("{ct_quy_mo_dz_trung}");
    const b = row.indexOf("{ct_quy_mo_dz_ha}");
    if (a < 0 || b < 0) throw new Error("THA: không thay được ô quy mô");
    const runStart = findRunStart(row, a);
    if (runStart < 0) throw new Error("THA: không thấy <w:r> quy mô");
    const tEnd = row.indexOf("</w:t>", b) + "</w:t>".length;
    let end = tEnd;
    if (row.slice(end, end + 6) === "</w:r>") end += 6;
    const openRun = row.slice(runStart, row.indexOf(">", runStart) + 1);
    const rPrMatch = row.slice(runStart, a).match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
    const rPr = rPrMatch ? rPrMatch[0] : "";
    row =
      row.slice(0, runStart) +
      openRun +
      rPr +
      "<w:t>{ct_quy_mo}</w:t></w:r>" +
      row.slice(end);
  }

  let danh = 0;
  row = row.replace(/\{ct_danh_dau_goi\}/g, () => {
    danh += 1;
    return danh === 1 ? "{ct_danh_dau_tvtk}" : "{ct_danh_dau_tvgs}";
  });

  if (!row.includes("{ct_tien_do}")) {
    throw new Error("THA: thiếu {ct_tien_do}");
  }
  row = replaceCellText(
    row,
    "<w:t>{ct_tien_do}</w:t>",
    "<w:t>{ct_tien_do}{/cong_trinh}</w:t>",
  );

  const next = xml.slice(0, hit.start) + row + xml.slice(hit.end);
  assertTrBalance(next, "THA");
  return next;
}

/** TNHC: thay 2 dòng mẫu + "..." bằng 1 dòng loop */
function fixTnhc(xml) {
  if (xml.includes("{#cong_trinh}")) {
    console.log("TNHC: đã có loop — giữ nguyên");
    return xml;
  }

  const sampleRows = findAllRowsContaining(xml, "Dự án mẫu");
  const dotsRows = findAllRowsContaining(xml, "<w:t>...</w:t>").filter(
    (r) => !r.row.includes("Dự án mẫu"),
  );
  if (!sampleRows.length) throw new Error("TNHC: không thấy dòng Dự án mẫu");

  let row = sampleRows[0].row;
  row = replaceCellText(row, "<w:t>1</w:t>", "<w:t>{#cong_trinh}{stt}</w:t>");

  row = row.replace(
    /<w:t>Dự án mẫu 1:[^<]*\{nam_ke_hoach\}<\/w:t>/,
    "<w:t>{ct_ten}</w:t>",
  );
  if (row.includes("Dự án mẫu")) {
    row = row.replace(/<w:t>Dự án mẫu[^<]*<\/w:t>/, "<w:t>{ct_ten}</w:t>");
  }

  if (row.includes("XDM 1.5km")) {
    const a = row.indexOf("XDM 1.5km");
    const runStart = findRunStart(row, a);
    if (runStart < 0) throw new Error("TNHC: không thấy <w:r> quy mô");
    // Bullet cuối: "Cải tạo ... 0.4kV." — dùng lần xuất hiện cuối
    const lastBullet = row.lastIndexOf("0.4kV.");
    if (lastBullet < 0) throw new Error("TNHC: không thấy bullet 0.4kV.");
    const tEnd = row.indexOf("</w:t>", lastBullet) + "</w:t>".length;
    let end = tEnd;
    if (row.slice(end, end + 6) === "</w:r>") end += 6;
    const openRun = row.slice(runStart, row.indexOf(">", runStart) + 1);
    const rPrMatch = row.slice(runStart, a).match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
    const rPr = rPrMatch ? rPrMatch[0] : "";
    row =
      row.slice(0, runStart) +
      openRun +
      rPr +
      "<w:t>{ct_quy_mo}</w:t></w:r>" +
      row.slice(end);
  }

  assertTrBalance(row, "TNHC row sau quy mô");

  if (!row.includes("{ct_tmdt}")) {
    // Ô TMĐT (trống trên mẫu) đứng trước ô 15.500 (= KHV)
    const anchor = row.indexOf("<w:t>15.500</w:t>");
    if (anchor < 0) throw new Error("TNHC: không thấy ô 15.500");
    const pClose = row.lastIndexOf("</w:p>", anchor);
    row =
      row.slice(0, pClose) +
      "<w:r><w:t>{ct_tmdt}</w:t></w:r>" +
      row.slice(pClose);
  }

  // 15.500 = KHV; 2.480 = TDTM; 1.860 = KHCB
  const valueMap = [
    ["15.500", "{ct_khv}"],
    ["2.480", "{ct_tdtm}"],
    ["1.860", "{ct_khcb}"],
    ["31/3/2027", "{ct_tien_do}"],
  ];
  for (const [from, to] of valueMap) {
    if (!row.includes(`<w:t>${from}</w:t>`)) {
      console.warn("TNHC: không thấy giá trị mẫu", from);
    } else {
      row = row.replace(`<w:t>${from}</w:t>`, `<w:t>${to}</w:t>`);
    }
  }

  if (!row.includes("{ct_tien_do}")) {
    throw new Error("TNHC: thiếu {ct_tien_do} sau map");
  }
  row = replaceCellText(
    row,
    "<w:t>{ct_tien_do}</w:t>",
    "<w:t>{ct_tien_do}{/cong_trinh}</w:t>",
  );

  assertTrBalance(row, "TNHC row cuối");

  // Xóa hàng thừa (mẫu 2 + ...) rồi thay hàng mẫu 1 — theo thứ tự từ cuối → đầu
  const toRemove = [...sampleRows.slice(1), ...dotsRows].sort(
    (a, b) => b.start - a.start,
  );
  let next = xml;
  for (const r of toRemove) {
    // Bảo vệ: chỉ xóa nếu đoạn vẫn khớp
    if (next.slice(r.start, r.end) !== r.row) {
      // Tìm lại theo nội dung
      const idx = next.indexOf(r.row);
      if (idx < 0) {
        console.warn("TNHC: bỏ qua hàng không còn khớp");
        continue;
      }
      next = next.slice(0, idx) + next.slice(idx + r.row.length);
    } else {
      next = next.slice(0, r.start) + next.slice(r.end);
    }
    assertTrBalance(next, "TNHC sau xóa 1 hàng");
  }

  const hit = findRowContaining(next, "Dự án mẫu");
  if (!hit) {
    // Có thể đã đổi tên trong bản gốc nếu marker khác
    const hitStt = findRowContaining(next, "<w:t>1</w:t>");
    if (!hitStt || !hitStt.row.includes("Dự án mẫu")) {
      throw new Error("TNHC: không tìm lại dòng mẫu 1 để gắn loop");
    }
  }
  const target = hit || findRowContaining(next, "Dự án mẫu");
  if (!target) throw new Error("TNHC: không gắn được dòng loop");
  next = next.slice(0, target.start) + row + next.slice(target.end);

  next = next.replace(/NĂM 2027/g, "NĂM {nam_ke_hoach}");
  next = next.replace(
    /năm 2026 \(Tạm tính\)/gi,
    "năm {nam_ke_hoach} (Tạm tính)",
  );

  assertTrBalance(next, "TNHC final");
  if (!next.includes("{#cong_trinh}") || !next.includes("{/cong_trinh}")) {
    throw new Error("TNHC: thiếu loop");
  }
  return next;
}

function summarize(xml, label) {
  const plain = xml.replace(/<[^>]+>/g, "");
  const tags = [...plain.matchAll(/\{[#/]?[a-zA-Z0-9_]+\}/g)].map((m) => m[0]);
  console.log(label, [...new Set(tags)].sort().join(", "));
}

function processFile(fileName, fixer) {
  const docPath = path.join(TEMPLATES, fileName);
  const sourceBuf = loadFromGit(fileName);
  const zip = new PizZip(sourceBuf);
  let xml = readDocumentXml(zip);
  xml = fixer(xml);
  summarize(xml, fileName);
  if (!xml.includes("{#cong_trinh}") || !xml.includes("{/cong_trinh}")) {
    throw new Error(`${fileName}: thiếu loop`);
  }
  writeNormalizedDocx(docPath, sourceBuf, xml);
  // Verify
  const check = new PizZip(fs.readFileSync(docPath));
  const names = Object.keys(check.files);
  if (names.some((n) => n.includes("\\"))) {
    throw new Error(`${fileName}: vẫn còn path backslash`);
  }
  if (!check.file("word/document.xml")) {
    throw new Error(`${fileName}: thiếu word/document.xml sau chuẩn hóa`);
  }
  assertTrBalance(check.file("word/document.xml").asText(), `${fileName} verify`);
  console.log("Wrote OK", docPath);
}

processFile("qd-giao-nhiem-vu-tvtk_tha.docx", fixTha);
processFile("qd-giao-nhiem-vu-tnhc.docx", fixTnhc);

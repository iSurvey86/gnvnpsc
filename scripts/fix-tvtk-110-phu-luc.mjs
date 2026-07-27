/**
 * Sửa mẫu TVTK 110kV:
 * - Ghép lại {ten_du_an} bị Word cắt run
 * - Bọc dòng phụ lục {#cong_trinh}…{/cong_trinh}
 * - STT → {stt}; tên CT / quy mô linh hoạt {ct_ten} / {ct_quy_mo}
 * - Tiêu đề phụ lục: NĂM 2026 → NĂM {nam_ke_hoach}
 *
 * Chạy: node scripts/fix-tvtk-110-phu-luc.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const PizZip = require("pizzip");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOC = path.join(
  ROOT,
  "public",
  "templates",
  "qd-giao-nhiem-vu-tvtk_110.docx",
);

/** Ghép {ten_</w:t>…du…_…an…} thành {ten_du_an} trong một <w:t> */
function mergeSplitTenDuAn(xml) {
  const re =
    /<w:t>\{ten_<\/w:t><\/w:r>(?:<w:r[^>]*>[\s\S]*?<w:t>du<\/w:t><\/w:r>)(?:<w:r[^>]*>[\s\S]*?<w:t>_<\/w:t><\/w:r>)(?:<w:r[^>]*>[\s\S]*?<w:t>an<\/w:t><\/w:r>)(?:<w:r[^>]*>[\s\S]*?<w:t>\}<\/w:t><\/w:r>)/g;

  let n = 0;
  const out = xml.replace(re, () => {
    n += 1;
    return "<w:t>{ten_du_an}</w:t></w:r>";
  });
  return { xml: out, merged: n };
}

function wrapCongTrinhLoop(xml) {
  // Dòng dữ liệu: ô STT chứa "1" đứng trước {ct_khu_vuc} trong cùng <w:tr>
  const marker = "{ct_khu_vuc}";
  const i = xml.indexOf(marker);
  if (i < 0) throw new Error("Không thấy {ct_khu_vuc} trong mẫu");

  const before = xml.slice(0, i);
  const trMatches = [...before.matchAll(/<w:tr(?!Pr)[\s>]/g)];
  if (!trMatches.length) throw new Error("Không tìm thấy <w:tr> của dòng CT");
  const trStart = trMatches[trMatches.length - 1].index;

  const afterStart = xml.slice(i);
  const trEndRel = afterStart.indexOf("</w:tr>");
  if (trEndRel < 0) throw new Error("Không tìm thấy </w:tr>");
  const trEnd = i + trEndRel + "</w:tr>".length;
  let row = xml.slice(trStart, trEnd);

  if (row.includes("{#cong_trinh}")) {
    return { xml, wrapped: false };
  }

  // STT cứng "1" → loop + {stt}
  if (!row.includes("<w:t>1</w:t>")) {
    throw new Error("Ô STT không còn chữ 1 — kiểm tra mẫu thủ công");
  }
  row = row.replace("<w:t>1</w:t>", "<w:t>{#cong_trinh}{stt}</w:t>");

  // Tên CT: câu mẫu → {ct_ten}
  row = row.replace(
    /<w:t>Nâng cao năng lực vận hành lưới điện trung hạ áp khu vực \{ct_khu_vuc\} năm \{nam_ke_hoach\}<\/w:t>/,
    "<w:t>{ct_ten}</w:t>",
  );
  // Fallback nếu encoding khác — thay cả đoạn có ct_khu_vuc trong ô tên
  if (row.includes("{ct_khu_vuc}")) {
    row = row.replace(
      /<w:t>[^<]*\{ct_khu_vuc\}[^<]*\{nam_ke_hoach\}<\/w:t>/,
      "<w:t>{ct_ten}</w:t>",
    );
  }

  // Quy mô 3 dòng → một tag {ct_quy_mo} (giữ linebreak trong data)
  if (
    row.includes("{ct_quy_mo_dz_trung}") ||
    row.includes("{ct_quy_mo_tba}") ||
    row.includes("{ct_quy_mo_dz_ha}")
  ) {
    // Thay nội dung ô quy mô (ô thứ 3) bằng một run {ct_quy_mo}
    // Tìm đoạn từ bullet đầu đến hết 3 tag
    row = row.replace(
      /<w:t>- Xây dựng mới \{ct_quy_mo_dz_trung\}[^<]*<\/w:t><\/w:r><w:r[^>]*>[\s\S]*?<w:t>- Xây dựng mới \{ct_quy_mo_tba\}[^<]*<\/w:t><\/w:r><w:r[^>]*>[\s\S]*?<w:t>- Xây dựng mới và cải tạo \{ct_quy_mo_dz_ha\}[^<]*<\/w:t>/,
      "<w:t>{ct_quy_mo}</w:t>",
    );
    // Encoding-safe fallback: cắt từ run chứa dz_trung đến hết dz_ha
    if (row.includes("{ct_quy_mo_dz_trung}")) {
      const a = row.indexOf("{ct_quy_mo_dz_trung}");
      const b = row.indexOf("{ct_quy_mo_dz_ha}");
      if (a < 0 || b < 0) throw new Error("Không thay được ô quy mô");
      // Không dùng lastIndexOf("<w:r" — khớp nhầm `<w:tr`
      const runStart = Math.max(
        row.lastIndexOf("<w:r ", a),
        row.lastIndexOf("<w:r>", a),
      );
      if (runStart < 0) throw new Error("Không thấy <w:r> quy mô");
      const tEnd = row.indexOf("</w:t>", b) + "</w:t>".length;
      let end = tEnd;
      if (row.slice(end, end + 6) === "</w:r>") end += 6;
      const beforeRun = row.slice(0, runStart);
      const afterRun = row.slice(end);
      const openRun = row.slice(runStart, row.indexOf(">", runStart) + 1);
      const rPrMatch = row
        .slice(runStart, a)
        .match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
      const rPr = rPrMatch ? rPrMatch[0] : "";
      row =
        beforeRun +
        openRun +
        rPr +
        "<w:t>{ct_quy_mo}</w:t></w:r>" +
        afterRun;
    }
  }

  if (!row.includes("{ct_tien_do}")) {
    throw new Error("Thiếu {ct_tien_do} trên dòng CT");
  }
  row = row.replace(
    "<w:t>{ct_tien_do}</w:t>",
    "<w:t>{ct_tien_do}{/cong_trinh}</w:t>",
  );

  return {
    xml: xml.slice(0, trStart) + row + xml.slice(trEnd),
    wrapped: true,
  };
}

function fixNamTitle(xml) {
  // "NĂM 2026" trong tiêu đề phụ lục → "NĂM {nam_ke_hoach}"
  if (xml.includes("NĂM {nam_ke_hoach}")) {
    return { xml, fixed: false };
  }
  const next = xml.replace(/NĂM 2026/g, "NĂM {nam_ke_hoach}");
  return { xml: next, fixed: next !== xml };
}

function main() {
  if (!fs.existsSync(DOC)) {
    console.error("Không thấy:", DOC);
    process.exit(1);
  }

  const zip = new PizZip(fs.readFileSync(DOC));
  let xml = zip.file("word/document.xml").asText();

  const m1 = mergeSplitTenDuAn(xml);
  xml = m1.xml;
  console.log("Merged {ten_du_an}:", m1.merged);

  const m2 = wrapCongTrinhLoop(xml);
  xml = m2.xml;
  console.log("Wrapped cong_trinh loop:", m2.wrapped);

  const m3 = fixNamTitle(xml);
  xml = m3.xml;
  console.log("Fixed NĂM title:", m3.fixed);

  // Kiểm tra nhanh
  const plain = xml.replace(/<[^>]+>/g, "");
  const tags = [...plain.matchAll(/\{[#/]?[a-zA-Z0-9_]+\}/g)].map((x) => x[0]);
  console.log("Tags:", [...new Set(tags)].sort().join(", "));

  if (xml.includes("{ten_</w:t>") || /\{ten_<\/w:t>/.test(xml)) {
    console.error("Vẫn còn {ten_ bị cắt!");
    process.exit(1);
  }
  if (!xml.includes("{#cong_trinh}") || !xml.includes("{/cong_trinh}")) {
    console.error("Thiếu loop cong_trinh");
    process.exit(1);
  }

  zip.file("word/document.xml", xml);
  const out = zip.generate({ type: "nodebuffer" });
  fs.writeFileSync(DOC, out);
  console.log("Wrote", DOC);
}

main();

/**
 * Gán tag {…} vào 3 mẫu Word (chuẩn docxtemplater mặc định).
 * Chạy: node scripts/tag-word-templates.mjs
 * Lưu ý: chạy trên bản gốc [placeholder]; đã gắn {{ }} thì dùng convert-template-delimiters.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEMPLATES = path.join(ROOT, "public", "templates");
const WORK = path.join(ROOT, "tmp-templates-tag");

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const XML_GAP = "(?:<[^>]+>)*";
/** Khoảng trắng linh hoạt (nhiều space/tab giữa các run Word). */
const WS_GAP = "(?:\\s|<[^>]+>)+";

/** Thay chuỗi plain-text trong OOXML; khoảng trắng trong search = linh hoạt. */
function replaceIgnoringXml(xml, search, replace, { all = true } = {}) {
  const parts = search.split(/\s+/).filter((p) => p.length > 0);
  const pattern = parts
    .map((part) => [...part].map((c) => escapeRegex(c)).join(XML_GAP))
    .join(WS_GAP);
  const re = new RegExp(pattern, all ? "g" : "");
  return xml.replace(re, () => replace);
}

function replaceFirstIgnoringXml(xml, search, replace) {
  return replaceIgnoringXml(xml, search, replace, { all: false });
}

/** Map chung: chuỗi dài hơn trước. [from] → {to} */
const BRACKET_MAP_COMMON = [
  [
    "Tên Xí Nghiệp Dịch vụ Điện lực Tỉnh/Thành phố",
    "ten_xi_nghiep",
  ],
  ["Tên Công ty Điện lực Tỉnh", "ten_pc_tinh"],
  ["Tên Điện lực tỉnh", "ten_pc_tinh"],
  ["Tên PC tỉnh", "ten_pc_tinh"],
  ["PC TỈNH", "ten_pc_tinh"],
  [
    "Số QĐ thành lập XN - Ví dụ: 4147/QĐ-EVNNPC",
    "so_qd_thanh_lap_xn",
  ],
  ["Số QĐ thành lập xí nghiệp", "so_qd_thanh_lap_xn"],
  [
    "Số QĐ tạm giao kế hoạch vốn - Ví dụ: 708/QĐ-EVNNPC",
    "so_qd_tam_giao_khv",
  ],
  ["Số QĐ giao KHV", "so_qd_tam_giao_khv"],
  [
    "Khảo sát, tư vấn thiết kế / Tư vấn giám sát",
    "ten_goi_thau",
  ],
  [
    "Số tiền tạm ứng bằng số - Ví dụ: 786.000.000",
    "so_tien_tam_ung",
  ],
  [
    "Số tiền tạm ứng bằng chữ - Ví dụ: Bảy trăm tám mươi sáu triệu",
    "so_tien_tam_ung_chu",
  ],
  ["Số TMĐT - Ví dụ: 18.514", "ct_tmdt"],
  ["Tiến độ HT - Ví dụ: 31/3/2027", "ct_tien_do"],
  ["Số km, loại dây/cáp", "ct_quy_mo_dz_trung"],
  ["Số lượng, công suất", "ct_quy_mo_tba"],
  ["Số km", "ct_quy_mo_dz_ha"],
  ["Tên Khu vực/Huyện", "ct_khu_vuc"],
  ["Tên Xí Nghiệp", "ten_xi_nghiep"],
  ["Tên Xí nghiệp", "ten_xi_nghiep"],
  ["Tên Tỉnh", "ten_tinh"],
  ["Tổng Giá trị HĐ", "tong_gia_tri_hd"],
  ["Tổng Chi phí L1", "tong_chi_phi_l1"],
  ["Tổng TMĐT", "tong_tmdt"],
  ["Số lượng", "so_luong_cong_trinh"],
  ["hoặc ĐTXD bổ sung năm 2027", "ghi_chu_bo_sung_dieu1"],
  ["Thêm các công trình khác tương tự vào đây", ""],
  ["Đánh dấu X - Ví dụ: TVTK", "ct_danh_dau_goi"],
  ["Số tiền - Ví dụ: 555.420.000", "ct_gia_tri_hd"],
  ["Số tiền - Ví dụ: 55.000.000", "ct_chi_phi_l1"],
  ["BỔ SUNG", "ghi_chu_bo_sung"],
  ["bổ sung", "ghi_chu_bo_sung"],
  ["TDTM", "tong_tdtm"],
  ["KHCB", "tong_khcb"],
  ["Tổng", "tong_khv"],
];

/** Literal (không ngoặc) — header / phụ lục */
const LITERAL_MAP = [
  ["Số: /QĐ-NPSC", "Số: {so_qd}/QĐ-NPSC"],
  [
    "Quyết định số: /QĐ-NPSC ngày tháng năm 2026",
    "Quyết định số: {so_qd}/QĐ-NPSC ngày {ngay_ban_hanh_chu}",
  ],
  [
    "Hà Nội, ngày tháng năm 2026",
    "Hà Nội, {ngay_ban_hanh_chu}",
  ],
  [
    "(Ví dụ mẫu dựa trên nguồn tài liệu Bắc Ninh [6])",
    "",
  ],
  ["năm 2027", "năm {nam_ke_hoach}"],
];

function applyBracketMaps(xml) {
  let out = xml;
  // Ngày: 2 lần khác nghĩa — thay tuần tự
  out = replaceFirstIgnoringXml(
    out,
    "[Ngày/Tháng/Năm]",
    "{ngay_qd_thanh_lap_xn}",
  );
  out = replaceFirstIgnoringXml(
    out,
    "[Ngày/Tháng/Năm]",
    "{ngay_qd_tam_giao_khv}",
  );
  out = replaceFirstIgnoringXml(out, "[Ngày QĐ]", "{ngay_qd_thanh_lap_xn}");
  out = replaceFirstIgnoringXml(out, "[Ngày QĐ]", "{ngay_qd_tam_giao_khv}");

  for (const [from, tag] of BRACKET_MAP_COMMON) {
    const needle = `[${from}]`;
    const replacement = tag ? `{${tag}}` : "";
    out = replaceIgnoringXml(out, needle, replacement);
  }
  return out;
}

function applyLiterals(xml) {
  let out = xml;
  for (const [from, to] of LITERAL_MAP) {
    out = replaceIgnoringXml(out, from, to);
  }
  return out;
}

function listRemainingBrackets(xml) {
  const plain = xml
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  const m = plain.match(/\[[^\]]{1,120}\]/g);
  return m ? [...new Set(m)] : [];
}

function listTags(xml) {
  const plain = xml.replace(/<[^>]+>/g, "");
  const m = plain.match(/\{[a-z0-9_]+\}/g);
  return m ? [...new Set(m)].sort() : [];
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
  xml = applyBracketMaps(xml);
  xml = applyLiterals(xml);
  fs.writeFileSync(xmlPath, xml, "utf8");

  const remaining = listRemainingBrackets(xml);
  const tags = listTags(xml);
  const outPath = path.join(TEMPLATES, fileName);
  zipDocx(path.join(work, "unzip"), outPath);

  return { fileName, remaining, tags, tagCount: tags.length };
}

const FILES = [
  "qd-giao-nhiem-vu-tvtk_110.docx",
  "qd-giao-nhiem-vu-tvtk_tha.docx",
  "qd-giao-nhiem-vu-tnhc.docx",
];

fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });

const results = FILES.map(processFile);
for (const r of results) {
  console.log(`\n=== ${r.fileName} ===`);
  console.log(`Tags (${r.tagCount}): ${r.tags.join(", ")}`);
  if (r.remaining.length) {
    console.log(`Còn [placeholder]: ${r.remaining.join(" | ")}`);
  } else {
    console.log("Không còn [placeholder].");
  }
}

console.log("\nXong. Mẫu đã ghi đè trong public/templates/");

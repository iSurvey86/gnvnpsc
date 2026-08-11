/**
 * Đồng bộ danh xưng GD XN + Nơi nhận + sửa zip path mẫu Word.
 * Chạy: node scripts/fix-danh-xung-va-noi-nhan.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PizZip from "pizzip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.join(__dirname, "..", "public", "templates");

function getDocEntry(zip) {
  const key = Object.keys(zip.files).find((n) =>
    /word[/\\]document\.xml$/i.test(n),
  );
  if (!key) throw new Error("missing word/document.xml");
  return { key, xml: zip.file(key).asText() };
}

function plainText(xml) {
  return [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
    .map((m) => m[1])
    .join("");
}

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

/** Viết lại docx với path chuẩn forward-slash (docxtemplater/PizZip). */
function writeDocxFixed(srcPath, mutateXml) {
  const zipIn = new PizZip(fs.readFileSync(srcPath));
  const { key, xml: rawXml } = getDocEntry(zipIn);
  const xml = mutateXml(rawXml);
  const zipOut = new PizZip();

  for (const [name, entry] of Object.entries(zipIn.files)) {
    if (entry.dir) continue;
    const norm = name.replace(/\\/g, "/");
    const content =
      name === key || norm === "word/document.xml" ? xml : entry.asUint8Array();
    zipOut.file(norm, content);
  }

  fs.writeFileSync(
    srcPath,
    zipOut.generate({ type: "nodebuffer", compression: "DEFLATE" }),
  );
  return plainText(xml);
}

// --- THA / TVGS: Nơi nhận dùng ten_xi_nghiep; giữ danh_xung ---
for (const file of [
  "qd-giao-nhiem-vu-tvtk_tha.docx",
  "qd-giao-nhiem-vu-tvgs.docx",
]) {
  const src = path.join(TEMPLATES, file);
  const plain = writeDocxFixed(src, (xml) => {
    let out = xml;
    let { out: next, count } = replaceIgnoringXml(
      out,
      "XN Dịch vụ Điện lực {ten_tinh}",
      "{ten_xi_nghiep}",
    );
    out = next;
    if (count === 0 && !plainText(out).includes("Nơi nhận:- Như Điều 3;- Ban Giám đốc Công ty (để c/đ);- Các phòng: KD, TCKT, KT-AT;- {ten_xi_nghiep}")) {
      // already fixed or different wording — no-op if already {ten_xi_nghiep} in nơi nhận
      console.log(`${file}: nơi nhận replace count=${count} (may already fixed)`);
    } else {
      console.log(`${file}: nơi nhận replaced=${count}`);
    }
    return out;
  });
  const i = plain.indexOf("Điều 3");
  const n = plain.indexOf("Nơi nhận");
  console.log(`  dieu3: ${JSON.stringify(plain.slice(i, i + 100))}`);
  console.log(`  noihan: ${JSON.stringify(plain.slice(n, n + 110))}`);
}

// --- TNHC: thêm {danh_xung_gd_xn} trước Giám đốc ---
{
  const file = "qd-giao-nhiem-vu-tnhc.docx";
  const src = path.join(TEMPLATES, file);
  const plain = writeDocxFixed(src, (xml) => {
    if (xml.includes("{danh_xung_gd_xn}")) {
      console.log(`${file}: already has danh_xung_gd_xn`);
      return xml;
    }
    // Plain: "Điều 3. Giám đốc Xí nghiệp Dịch vụ Điện lực {ten_xi_nghiep}"
    let { out, count } = replaceIgnoringXml(
      xml,
      "Điều 3. Giám đốc Xí nghiệp Dịch vụ Điện lực {ten_xi_nghiep}",
      "Điều 3. {danh_xung_gd_xn} Giám đốc Xí nghiệp Dịch vụ Điện lực {ten_xi_nghiep}",
    );
    if (count === 0) {
      ({ out, count } = replaceIgnoringXml(
        xml,
        "Giám đốc Xí nghiệp Dịch vụ Điện lực {ten_xi_nghiep}",
        "{danh_xung_gd_xn} Giám đốc Xí nghiệp Dịch vụ Điện lực {ten_xi_nghiep}",
      ));
    }
    if (count === 0) {
      throw new Error(`${file}: không tìm thấy câu Điều 3 để gắn danh xưng`);
    }
    console.log(`${file}: danh_xung inserted count=${count}`);
    return out;
  });
  const i = plain.indexOf("Điều 3");
  console.log(`  dieu3: ${JSON.stringify(plain.slice(i, i + 120))}`);
}

// --- 110: chỉ verify ---
{
  const zip = new PizZip(
    fs.readFileSync(path.join(TEMPLATES, "qd-giao-nhiem-vu-tvtk_110.docx")),
  );
  const { xml } = getDocEntry(zip);
  const plain = plainText(xml);
  console.log(
    "110 dieu3:",
    JSON.stringify(plain.slice(plain.indexOf("Điều 3"), plain.indexOf("Điều 3") + 90)),
  );
}

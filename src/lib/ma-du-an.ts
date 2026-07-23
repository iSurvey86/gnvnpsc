import type { CapDienAp } from "@/lib/types";

/** Quy tắc mã dự án — cùng nguyên tắc ksnpsc: TỈNH-NĂM-PHÂNĐOẠN-VIẾTTẮT */

const PROVINCE_MAP: Record<string, string> = {
  "lào cai": "LK",
  "lai châu": "LC",
  "sơn la": "SL",
  "phú thọ": "PT",
  "bắc giang": "BG",
  "hưng yên": "HY",
  "bắc ninh": "BN",
  "lạng sơn": "LS",
  "hải phòng": "HP",
  "ninh bình": "NB",
  "thanh hóa": "TH",
  "quảng ninh": "QN",
  "nghệ an": "NA",
  "hà tĩnh": "HT",
  "thái nguyên": "TN",
  "vĩnh phúc": "VP",
  "hòa bình": "HB",
  "hải dương": "HD",
  "thái bình": "TB",
  "hà nam": "HNA",
  "nam định": "ND",
  "yên bái": "YB",
  "tuyên quang": "TQ",
  "bắc kạn": "BK",
  "cao bằng": "CB",
  "hà giang": "HG",
  "điện biên": "DB",
};

export function removeVietnameseTones(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, "");
}

export function getProvinceCode(diaDiem: string, tenDuAn: string): string {
  const searchString = `${diaDiem || ""} ${tenDuAn || ""}`.toLowerCase();
  let provinceCount = 0;
  let single = "DA";

  for (const key of Object.keys(PROVINCE_MAP)) {
    if (searchString.includes(key)) {
      provinceCount += 1;
      single = PROVINCE_MAP[key];
    }
  }

  if (provinceCount >= 2) return "DA";
  if (provinceCount === 1) return single;
  return "DA";
}

export function getNameAcronym(tenDuAn: string): string {
  const cleanStr = removeVietnameseTones(tenDuAn).replace(/[^a-zA-Z0-9 ]/g, "");
  return cleanStr
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Phân đoạn giữa năm và viết tắt: 110 / THA / PCM (thay giai đoạn FS bên ksnpsc) */
export function segmentFromCapDienAp(cap: CapDienAp | null | undefined): string {
  if (cap === "110kv") return "110";
  if (cap === "trung_ha_ap") return "THA";
  return "PCM";
}

export function buildProjectCode(
  pCode: string,
  nam: string | number,
  segment: string,
  acronymSuffix: string,
): string {
  return `${pCode}-${nam}-${segment}-${acronymSuffix}`;
}

export function extractNamFromQd(
  soQd: string | null | undefined,
  ngayQd: string | null | undefined,
): string {
  if (ngayQd && /^\d{4}/.test(ngayQd)) return ngayQd.slice(0, 4);
  const fromSo = String(soQd || "").match(/(20\d{2})/);
  if (fromSo) return fromSo[1];
  return String(new Date().getFullYear());
}

export function resolveAcronymSuffix(
  pCode: string,
  nam: string,
  segment: string,
  tenDuAn: string,
  takenCodes: string[],
): string {
  const acronym = getNameAcronym(tenDuAn) || "DA";
  for (let attempt = 0; attempt <= 99; attempt++) {
    const numSuffix = attempt > 0 ? String(attempt) : "";
    const acronymSuffix =
      acronym.substring(0, Math.max(1, 10 - numSuffix.length)) + numSuffix;
    const code = buildProjectCode(pCode, nam, segment, acronymSuffix);
    if (!takenCodes.includes(code)) return acronymSuffix;
  }
  return acronym.substring(0, 10);
}

export type MaDuAnInput = {
  ten_du_an: string;
  dia_diem?: string | null;
  cap_dien_ap?: CapDienAp | null;
  nam?: string;
};

/** Sinh mã mới, tránh trùng với takenCodes */
export function generateMaDuAn(
  input: MaDuAnInput,
  takenCodes: string[] = [],
): string {
  const pCode = getProvinceCode(input.dia_diem || "", input.ten_du_an);
  const nam = input.nam || String(new Date().getFullYear());
  const segment = segmentFromCapDienAp(input.cap_dien_ap);
  const suffix = resolveAcronymSuffix(
    pCode,
    nam,
    segment,
    input.ten_du_an,
    takenCodes,
  );
  return buildProjectCode(pCode, nam, segment, suffix);
}

/** Gán mã cho danh sách (bỏ qua dòng đã có mã) */
export function assignMaDuAnList<
  T extends {
    ma_du_an?: string | null;
    ten_du_an: string;
    dia_diem?: string | null;
    cap_dien_ap?: CapDienAp | null;
  },
>(rows: T[], nam: string, existingCodes: string[] = []): T[] {
  const taken = [...existingCodes];
  return rows.map((row) => {
    if (row.ma_du_an?.trim()) {
      taken.push(row.ma_du_an.trim());
      return row;
    }
    const ma = generateMaDuAn(
      {
        ten_du_an: row.ten_du_an,
        dia_diem: row.dia_diem,
        cap_dien_ap: row.cap_dien_ap,
        nam,
      },
      taken,
    );
    taken.push(ma);
    return { ...row, ma_du_an: ma };
  });
}

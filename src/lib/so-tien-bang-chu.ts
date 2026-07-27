/**
 * Đọc số tiền Việt Nam bằng chữ (đồng).
 * Nhận chuỗi có dấu chấm/phẩy ngăn cách nghìn: «786.000.000» → «Bảy trăm tám mươi sáu triệu đồng».
 */

const CHU_SO = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
] as const;

const HANG = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ"] as const;

/** Chỉ lấy chữ số → BigInt; bỏ dấu ngăn cách. */
export function parseSoTienVnd(raw: string | null | undefined): bigint | null {
  if (raw == null) return null;
  const digits = String(raw).replace(/[^\d]/g, "");
  if (!digits) return null;
  try {
    return BigInt(digits);
  } catch {
    return null;
  }
}

/** Triệu đồng → chuỗi VND có dấu chấm nghìn (786 → «786.000.000»). */
export function formatVndTuTrieu(trieu: number | null | undefined): string {
  if (trieu == null || !Number.isFinite(trieu) || trieu < 0) return "";
  const dong = Math.round(trieu * 1_000_000);
  return String(dong).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function docBaChuSo(n: number, dayDu: boolean): string {
  const tram = Math.floor(n / 100);
  const chuc = Math.floor((n % 100) / 10);
  const donVi = n % 10;
  const parts: string[] = [];

  if (tram > 0) {
    parts.push(`${CHU_SO[tram]} trăm`);
  } else if (dayDu && (chuc > 0 || donVi > 0)) {
    parts.push("không trăm");
  }

  if (chuc > 1) {
    parts.push(`${CHU_SO[chuc]} mươi`);
    if (donVi === 1) parts.push("mốt");
    else if (donVi === 4) parts.push("tư");
    else if (donVi === 5) parts.push("lăm");
    else if (donVi > 0) parts.push(CHU_SO[donVi]);
  } else if (chuc === 1) {
    parts.push("mười");
    if (donVi === 1) parts.push("một");
    else if (donVi === 5) parts.push("lăm");
    else if (donVi > 0) parts.push(CHU_SO[donVi]);
  } else if (donVi > 0) {
    if (dayDu || tram > 0) parts.push(`lẻ ${CHU_SO[donVi]}`);
    else parts.push(CHU_SO[donVi]);
  }

  return parts.join(" ");
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * @returns chuỗi viết hoa chữ cái đầu + « đồng», hoặc "" nếu không parse được.
 */
export function soTienBangChu(
  raw: string | number | bigint | null | undefined,
): string {
  let n: bigint | null;
  if (typeof raw === "bigint") n = raw;
  else if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw < 0) return "";
    n = BigInt(Math.trunc(raw));
  } else n = parseSoTienVnd(raw);

  if (n == null || n < 0n) return "";
  if (n === 0n) return "Không đồng";

  const groups: number[] = [];
  let rest = n;
  while (rest > 0n) {
    groups.push(Number(rest % 1000n));
    rest = rest / 1000n;
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) continue;
    const dayDu = i < groups.length - 1;
    const doc = docBaChuSo(g, dayDu);
    const hang = HANG[i] ?? "";
    parts.push(hang ? `${doc} ${hang}` : doc);
  }

  if (!parts.length) return "Không đồng";
  return `${capitalizeFirst(parts.join(" ").replace(/\s+/g, " ").trim())} đồng`;
}

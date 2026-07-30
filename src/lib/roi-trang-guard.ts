/**
 * Chặn rời trang khi màn Review còn bản quét chưa lưu.
 *
 * Nút «Về Quản lý dự án» nằm ở header (component khác với bảng Review) nên hai
 * bên nói chuyện qua store nhỏ này: bảng Review đăng ký hàm kiểm tra, header gọi
 * hàm đó trước khi điều hướng.
 */

type GuardFn = () => Promise<boolean>;

let guard: GuardFn | null = null;

export function dangKyChanRoiTrang(fn: GuardFn): () => void {
  guard = fn;
  return () => {
    if (guard === fn) guard = null;
  };
}

/** true = được phép rời trang */
export async function xinPhepRoiTrang(): Promise<boolean> {
  if (!guard) return true;
  return guard();
}

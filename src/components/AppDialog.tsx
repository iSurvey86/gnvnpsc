"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type DialogVariant = "success" | "warning" | "error" | "info";
type DialogType = "alert" | "confirm";

type DialogState = {
  type: DialogType;
  message: string;
  title: string;
  variant: DialogVariant;
  confirmLabel: string;
  cancelLabel?: string;
};

type ShowOptions = {
  title?: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
};

type AppDialogContextValue = {
  showAlert: (message: string, options?: ShowOptions) => Promise<void>;
  showConfirm: (message: string, options?: ShowOptions) => Promise<boolean>;
};

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

function inferVariant(message: string): DialogVariant {
  const msg = String(message || "");
  if (/thành công/i.test(msg)) return "success";
  if (/cảnh báo|trùng/i.test(msg)) return "warning";
  if (/^lỗi|lỗi:|thất bại|không thể/i.test(msg.trim())) return "error";
  return "info";
}

const DEFAULT_TITLES: Record<DialogVariant, string> = {
  success: "Thành công",
  warning: "Cảnh báo",
  error: "Lỗi",
  info: "Thông báo",
};

const VARIANT_UI: Record<
  DialogVariant,
  { iconBg: string; iconColor: string; border: string; button: string }
> = {
  success: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-emerald-200",
    button:
      "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200/50",
  },
  warning: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "border-amber-200",
    button: "bg-amber-600 hover:bg-amber-700 shadow-amber-200/50",
  },
  error: {
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    border: "border-rose-200",
    button: "bg-rose-600 hover:bg-rose-700 shadow-rose-200/50",
  },
  info: {
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    border: "border-sky-200",
    button: "bg-sky-600 hover:bg-sky-700 shadow-sky-200/50",
  },
};

function DialogIcon({ variant }: { variant: DialogVariant }) {
  const common = "h-7 w-7";
  if (variant === "success") {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }
  if (variant === "warning") {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }
  return (
    <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const closeDialog = useCallback((result: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setDialog(null);
    if (resolve) resolve(result);
  }, []);

  const showAlert = useCallback((message: string, options: ShowOptions = {}) => {
    return new Promise<void>((resolve) => {
      const variant = options.variant || inferVariant(message);
      resolverRef.current = () => resolve();
      setDialog({
        type: "alert",
        message: String(message),
        title: options.title || DEFAULT_TITLES[variant],
        variant,
        confirmLabel: options.confirmLabel || "Đóng",
      });
    });
  }, []);

  const showConfirm = useCallback(
    (message: string, options: ShowOptions = {}) => {
      return new Promise<boolean>((resolve) => {
        const inferred = inferVariant(message);
        const variant =
          options.variant ||
          (inferred === "success" ? "warning" : inferred);
        resolverRef.current = resolve;
        setDialog({
          type: "confirm",
          message: String(message),
          title: options.title || "Xác nhận",
          variant,
          confirmLabel: options.confirmLabel || "Đồng ý",
          cancelLabel: options.cancelLabel || "Hủy",
        });
      });
    },
    [],
  );

  const styles = dialog ? VARIANT_UI[dialog.variant] : null;

  return (
    <AppDialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {dialog && styles ? (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-[2px]"
          onClick={() =>
            closeDialog(dialog.type === "confirm" ? false : true)
          }
          role="presentation"
        >
          <div
            className={`w-full max-w-md overflow-hidden rounded-2xl border-2 bg-white shadow-2xl ${styles.border}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-dialog-title"
          >
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full shadow-inner ${styles.iconBg} ${styles.iconColor}`}
                >
                  <DialogIcon variant={dialog.variant} />
                </div>
                <h3
                  id="app-dialog-title"
                  className="mb-2 text-[16px] font-black tracking-tight text-slate-800 uppercase"
                >
                  {dialog.title}
                </h3>
                <p className="mb-6 w-full whitespace-pre-line text-[13px] leading-relaxed font-medium text-slate-600">
                  {dialog.message}
                </p>
                <div
                  className={`flex w-full ${
                    dialog.type === "confirm" ? "flex-row gap-3" : "justify-center"
                  }`}
                >
                  {dialog.type === "confirm" ? (
                    <button
                      type="button"
                      onClick={() => closeDialog(false)}
                      className="flex-1 cursor-pointer rounded-xl bg-slate-100 py-2.5 font-bold text-slate-700 transition hover:bg-slate-200 active:scale-[0.98]"
                    >
                      {dialog.cancelLabel}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    autoFocus
                    onClick={() =>
                      closeDialog(dialog.type === "confirm" ? true : true)
                    }
                    className={`${
                      dialog.type === "confirm"
                        ? "flex-1"
                        : "min-w-[7.5rem] px-6"
                    } cursor-pointer rounded-xl py-2.5 font-bold text-white shadow-lg transition active:scale-[0.98] ${styles.button}`}
                  >
                    {dialog.confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppDialogContext.Provider>
  );
}

export function useAppDialog() {
  const ctx = useContext(AppDialogContext);
  if (!ctx) {
    throw new Error("useAppDialog phải dùng trong AppDialogProvider");
  }
  return ctx;
}

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CheckCircle, WarningCircle, Info, X } from '@phosphor-icons/react';

export type ToastTone = 'ok' | 'warn' | 'info';

export type Toast = {
  id: string;
  tone: ToastTone;
  title: string;
  body?: string;
};

type ToastContextValue = {
  push: (toast: Omit<Toast, 'id'> & { id?: string }) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const reduce = useReducedMotion();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<Toast, 'id'> & { id?: string }) => {
      const id = toast.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 5200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(100vw-2rem,360px)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon =
              toast.tone === 'ok' ? CheckCircle : toast.tone === 'warn' ? WarningCircle : Info;
            return (
              <motion.div
                key={toast.id}
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className={`pointer-events-auto border bg-bc-elevated px-4 py-3 ${
                  toast.tone === 'ok'
                    ? 'border-bc-ok/40'
                    : toast.tone === 'warn'
                      ? 'border-bc-rust/50'
                      : 'border-bc-line'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    size={18}
                    weight="fill"
                    className={
                      toast.tone === 'ok'
                        ? 'mt-0.5 shrink-0 text-bc-ok'
                        : toast.tone === 'warn'
                          ? 'mt-0.5 shrink-0 text-bc-rust'
                          : 'mt-0.5 shrink-0 text-bc-mute'
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-bc-ink">{toast.title}</p>
                    {toast.body ? (
                      <p className="mt-1 text-xs leading-relaxed text-bc-mute">{toast.body}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    className="shrink-0 text-bc-mute transition hover:text-bc-ink"
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToasts(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used within ToastProvider');
  return ctx;
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';

/**
 * Confirmation dialog modal with backdrop blur.
 * Used for destructive actions like task deletion.
 */
export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            {/* Icon */}
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${danger ? 'bg-red-50' : 'bg-[var(--color-primary-light)]'} mb-4`}>
              {danger ? (
                <svg className="h-6 w-6 text-[var(--color-danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <h3 className="text-lg font-semibold text-center text-[var(--color-text)] mb-2">{title}</h3>
            <p className="text-sm text-center text-[var(--color-text-secondary)] mb-6">{message}</p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg)] rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors border border-[var(--color-border)]"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors ${
                  danger
                    ? 'bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)]'
                    : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

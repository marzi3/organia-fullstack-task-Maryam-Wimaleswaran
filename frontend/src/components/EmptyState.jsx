'use client';

import { motion } from 'framer-motion';

/**
 * Empty state component shown when no tasks exist.
 * Displays an illustration and a call-to-action button.
 */
export default function EmptyState({ onCreateTask }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-24 h-24 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">No tasks yet</h3>
      <p className="text-[var(--color-text-secondary)] text-center max-w-sm mb-6">
        Your task list is empty. Create your first task to get started with organizing your work.
      </p>
      <button
        onClick={onCreateTask}
        className="px-6 py-3 text-sm font-semibold text-white rounded-xl gradient-primary hover:opacity-90 transition-opacity shadow-lg"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create First Task
        </span>
      </button>
    </motion.div>
  );
}

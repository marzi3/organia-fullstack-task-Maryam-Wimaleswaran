'use client';

import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';

/**
 * Task card component — displays a single task with status, due date, and action buttons.
 * Supports edit, delete, and quick status change actions.
 */
export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  /** Format date to readable string. */
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /** Check if the task is overdue. */
  const isOverdue = () => {
    if (!task.dueDate || task.status === 'COMPLETED') return false;
    return new Date(task.dueDate) < new Date();
  };

  const statusOptions = [
    { value: 'TO_DO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold text-[var(--color-text)] truncate ${task.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </h3>
        </div>
        <StatusBadge status={task.status} />
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Due Date */}
      <div className="flex items-center gap-4 mb-4">
        {task.dueDate && (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue() ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isOverdue() ? 'Overdue: ' : 'Due: '}{formatDate(task.dueDate)}
          </div>
        )}
        {task.createdAt && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(task.createdAt)}
          </div>
        )}
      </div>

      {/* Actions — visible on hover or always on mobile */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
        {/* Quick Status Change */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors cursor-pointer"
          aria-label={`Change status for ${task.title}`}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Edit / Delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
            aria-label={`Edit ${task.title}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Delete ${task.title}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Task create/edit form modal with validation.
 * Supports both creation and editing modes based on the `task` prop.
 */
export default function TaskForm({ isOpen, onClose, onSubmit, task = null, isLoading = false, isTodayView = false }) {
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TO_DO',
    dueDate: '',
    priority: 'MEDIUM',
  });
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title ? task.title.replace(/\[CAT:.*?\]\s*/, '') : '',
        description: task.description || '',
        status: task.status || 'TO_DO',
        dueDate: task.dueDate || '',
        priority: task.priority || 'MEDIUM',
      });
    } else {
      setFormData({ title: '', description: '', status: 'TO_DO', dueDate: '', priority: 'MEDIUM' });
    }
    setErrors({});
  }, [task, isOpen]);

  /** Client-side validation. */
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      if (isNaN(dueDate.getTime())) newErrors.dueDate = 'Invalid date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      ...formData,
      dueDate: formData.dueDate || null,
      description: formData.description || null,
    };

    onSubmit(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const statusOptions = [
    { value: 'TO_DO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low', color: 'bg-slate-400', activeColor: 'ring-slate-400/30 border-slate-400 text-slate-700 bg-slate-50' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-indigo-400', activeColor: 'ring-indigo-400/30 border-indigo-400 text-indigo-700 bg-indigo-50' },
    { value: 'HIGH', label: 'High', color: 'bg-amber-500', activeColor: 'ring-amber-500/30 border-amber-500 text-amber-700 bg-amber-50' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-red-500', activeColor: 'ring-red-500/30 border-red-500 text-red-700 bg-red-50' },
  ];

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
            onClick={onClose}
          />

          {/* Form Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                aria-label="Close form"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="task-title" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                  Title <span className="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  id="task-title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors outline-none ${
                    errors.title ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'
                  }`}
                />
                {errors.title && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="task-description" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                  Description
                </label>
                <textarea
                  id="task-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your task (optional)"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors outline-none resize-none"
                />
              </div>

              {/* Status + Due Date row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label htmlFor="task-status" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                    Status <span className="text-[var(--color-danger)]">*</span>
                  </label>
                  <select
                    id="task-status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors outline-none cursor-pointer ${
                      errors.status ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'
                    }`}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.status && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.status}</p>}
                </div>

                {/* Due Date - Only visible if not in Today view */}
                {!isTodayView && (
                  <div>
                    <label htmlFor="task-dueDate" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                      Due Date
                    </label>
                    <input
                      id="task-dueDate"
                      name="dueDate"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors outline-none ${
                        errors.dueDate ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'
                      }`}
                    />
                    {errors.dueDate && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.dueDate}</p>}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: opt.value }))}
                      className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                        formData.priority === opt.value
                          ? `${opt.activeColor} border-2`
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mb-1 ${opt.color}`}></span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg)] rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors border border-[var(--color-border)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

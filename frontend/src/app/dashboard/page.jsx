'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getTasks, getTaskSummary, createTask, updateTask, updateTaskStatus, deleteTask } from '@/services/api';
import Navbar from '@/components/Navbar';
import DashboardStats from '@/components/DashboardStats';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmDialog from '@/components/ConfirmDialog';

/**
 * Main dashboard page — protected route.
 * Displays task summary, search/filter controls, and task list with full CRUD operations.
 */
export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Data state
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /** Show a toast notification that auto-dismisses. */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /** Fetch tasks and summary data. */
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingTasks(true);
    try {
      const [tasksData, summaryData] = await Promise.all([
        getTasks(statusFilter || undefined, debouncedSearch || undefined),
        getTaskSummary(),
      ]);
      setTasks(tasksData);
      setSummary(summaryData);
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      showToast('Failed to load tasks', 'error');
    } finally {
      setIsLoadingTasks(false);
    }
  }, [isAuthenticated, statusFilter, debouncedSearch, logout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Handle task creation or update. */
  const handleFormSubmit = async (data) => {
    setIsFormLoading(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
        showToast('Task updated successfully');
      } else {
        await createTask(data);
        showToast('Task created successfully');
      }
      setIsFormOpen(false);
      setEditingTask(null);
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setIsFormLoading(false);
    }
  };

  /** Handle quick status change from TaskCard. */
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      showToast('Status updated');
      await fetchData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  /** Handle task deletion with confirmation. */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget.id);
      showToast('Task deleted successfully');
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const statusFilterOptions = [
    { value: '', label: 'All Tasks' },
    { value: 'TO_DO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  // Don't render until auth check completes
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user?.name}</span> 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Here&apos;s an overview of your tasks</p>
        </motion.div>

        {/* Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats summary={summary} />
        </div>

        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--color-border)] rounded-xl bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors outline-none"
              aria-label="Search tasks by title"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {statusFilterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Create Button */}
          <button
            onClick={openCreateForm}
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl gradient-primary hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </motion.div>

        {/* Task List */}
        {isLoadingTasks ? (
          <LoadingSpinner message="Loading tasks..." />
        ) : tasks.length === 0 ? (
          statusFilter || debouncedSearch ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">No matching tasks</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => { setStatusFilter(''); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <EmptyState onCreateTask={openCreateForm} />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openEditForm}
                  onDelete={(t) => setDeleteTarget(t)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTask(null); }}
        onSubmit={handleFormSubmit}
        task={editingTask}
        isLoading={isFormLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete Task"
        danger
      />

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
              toast.type === 'error' ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-success)]'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

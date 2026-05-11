'use client';

import { motion } from 'framer-motion';

/**
 * Context-aware empty state component.
 * Shows different messaging depending on which view triggered it (Urgent, Today, category, or general tasks).
 * Only shows a "Create" button for actionable views.
 */
export default function EmptyState({ view, onCreateTask }) {
  const isFilteredView = ['IMPORTANT', 'TODAY', 'COMPLETED', 'TO_DO', 'IN_PROGRESS'].includes(view);

  const messages = {
    IMPORTANT: { title: 'No urgent tasks', desc: 'You have no tasks marked as urgent. Nice work!', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    TODAY: { title: 'Nothing due today', desc: 'You\'re all caught up for today. Enjoy your free time!', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
    COMPLETED: { title: 'No completed tasks', desc: 'Complete some tasks to see them here.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    TO_DO: { title: 'No to-do tasks', desc: 'All your tasks are in progress or completed!', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    IN_PROGRESS: { title: 'Nothing in progress', desc: 'Start working on a task to see it here.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  };

  const msg = messages[view] || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-24 h-24 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={msg?.icon || 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'} />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {msg?.title || (view && !isFilteredView ? `No tasks in ${view}` : 'No tasks yet')}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        {msg?.desc || (view && !isFilteredView
          ? `Add tasks to your "${view}" list to see them here.`
          : 'Your task list is empty. Create your first task to get started.'
        )}
      </p>
      {!isFilteredView && onCreateTask && (
        <button
          onClick={onCreateTask}
          className="px-6 py-3 text-sm font-semibold text-white rounded-xl gradient-primary hover:opacity-90 transition-opacity shadow-lg"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Task
          </span>
        </button>
      )}
    </motion.div>
  );
}

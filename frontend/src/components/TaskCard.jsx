'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Task list item component — displays a single task in a horizontal row,
 * mimicking the Microsoft To Do layout.
 */
export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onToggleImportant }) {
  const isCompleted = task.status === 'COMPLETED';
  const isImportant = task.title?.includes('!');
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const toggleCompletion = () => {
    onStatusChange(task.id, isCompleted ? 'TO_DO' : 'COMPLETED');
  };

  /** Format date to readable string (e.g., 'Wed, May 24') */
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = () => {
    if (!task.dueDate || isCompleted) return false;
    return new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
  };

  const categoryTag = task.category || task.title?.match(/\[CAT:(.*?)\]/)?.[1];

  const statusConfig = {
    'TO_DO': { label: 'To Do', color: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' },
    'IN_PROGRESS': { label: 'On Going', color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' },
    'COMPLETED': { label: 'Done', color: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' }
  };

  const priorityConfig = {
    'LOW': { color: 'bg-slate-400', label: 'Low' },
    'MEDIUM': { color: 'bg-indigo-400', label: 'Medium' },
    'HIGH': { color: 'bg-amber-500', label: 'High' },
    'URGENT': { color: 'bg-red-500', label: 'Urgent' },
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.002 }}
      className={`group flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-[#f3f4f6] dark:hover:bg-gray-700 rounded-md px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors relative ${isStatusOpen ? 'z-50' : 'z-0'}`}
    >
      {/* Priority Indicator Line */}
      <div 
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 rounded-r-full transition-all ${priorityConfig[task.priority]?.color || 'bg-slate-200'}`}
        title={`Priority: ${task.priority || 'Medium'}`}
      />
      {/* Circular Checkbox */}
      <button
        onClick={toggleCompletion}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
          isCompleted 
            ? 'bg-indigo-600 border-indigo-600 text-white' 
            : 'border-gray-400 hover:border-indigo-600 text-transparent hover:text-indigo-600'
        }`}
        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer" onClick={() => onEdit(task)}>
        <div className="flex items-center justify-between gap-4">
          <h3 className={`text-[15px] font-medium truncate transition-colors ${
            isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {task.title?.replace(/\[CAT:.*?\]\s*/, '').replace('!', '')}
          </h3>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsStatusOpen(!isStatusOpen); }}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all uppercase tracking-tight ${statusConfig[task.status]?.color || statusConfig['TO_DO'].color}`}
              >
                {statusConfig[task.status]?.label || 'To Do'}
                <svg className={`w-2.5 h-2.5 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isStatusOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsStatusOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      className="absolute right-0 mt-1.5 w-28 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-20 overflow-hidden"
                    >
                      {Object.entries(statusConfig).map(([val, cfg]) => (
                        <button
                          key={val}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(task.id, val);
                            setIsStatusOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                            task.status === val ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onToggleImportant && onToggleImportant(task); }}
              className={`p-1 rounded-md transition-colors ${isImportant ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-gray-500'}`}
            >
              <svg className="w-5 h-5" fill={isImportant ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isImportant ? 0 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Metadata Row (Due date, Category, Description preview) */}
        {(task.dueDate || task.description || categoryTag) && (
          <div className="flex items-center gap-3 text-[13px] mt-0.5">
            {task.dueDate && (
              <span className={`flex items-center gap-1 font-medium ${
                isCompleted ? 'text-gray-400 dark:text-gray-500' : isOverdue() ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(task.dueDate)}
              </span>
            )}

            {isOverdue() && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, task.status, new Date().toISOString().split('T')[0]);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded transition-all border border-red-100 dark:border-red-800"
              >
                Reschedule to Today
              </button>
            )}
            
            {categoryTag && (
              <span className="flex items-center gap-1 font-semibold text-[#5a32fa] dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider border border-purple-100 dark:border-purple-800/50">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                {categoryTag}
              </span>
            )}

            {task.description && (
              <span className="text-gray-500 dark:text-gray-400 truncate flex-1 flex items-center">
                {(task.dueDate || categoryTag) && <span className="mr-3 text-gray-300 dark:text-gray-600 font-bold">•</span>}
                {task.description}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Actions (Delete) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task); }}
          className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Delete task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

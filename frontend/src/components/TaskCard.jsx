'use client';

import { motion } from 'framer-motion';

/**
 * Task list item component — displays a single task in a horizontal row,
 * mimicking the Microsoft To Do layout.
 */
export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onToggleImportant }) {
  const isCompleted = task.status === 'COMPLETED';
  const isImportant = task.title?.includes('!');

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.002 }}
      className="group flex items-center gap-3 bg-white hover:bg-[#f3f4f6] rounded-md px-4 py-3 border-b border-gray-100 transition-colors"
    >
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
        <div className="flex items-center justify-between">
          <h3 className={`text-[15px] font-medium truncate transition-colors ${
            isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
          }`}>
            {task.title?.replace('!', '')}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleImportant && onToggleImportant(task); }}
            className={`p-1 rounded-md transition-colors ${isImportant ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-gray-500'}`}
          >
            <svg className="w-5 h-5" fill={isImportant ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isImportant ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>
        
        {/* Metadata Row (Due date, Description preview) */}
        {(task.dueDate || task.description) && (
          <div className="flex items-center gap-3 text-[13px] mt-0.5">
            {task.dueDate && (
              <span className={`flex items-center gap-1 font-medium ${
                isCompleted ? 'text-gray-400' : isOverdue() ? 'text-red-600' : 'text-indigo-600'
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.description && (
              <span className="text-gray-500 truncate flex-1">
                {task.dueDate && <span className="mr-3 text-gray-300">•</span>}
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
          className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-200 transition-colors"
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

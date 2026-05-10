'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Layout, Calendar, BarChart3, Plus, Command, X, ArrowRight, Zap } from 'lucide-react';

/**
 * CommandPalette - A "Spotlight" style global search and navigation tool.
 * Activated by Cmd+K or Ctrl+K.
 */
export default function CommandPalette({ isOpen, onClose, tasks, onNavigate, onCreateTask }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define navigation items
  const navItems = [
    { id: 'tasks', label: 'Dashboard', icon: Layout, action: () => onNavigate('tasks') },
    { id: 'kanban', label: 'Kanban Board', icon: Zap, action: () => onNavigate('kanban') },
    { id: 'calendar', label: 'Calendar View', icon: Calendar, action: () => onNavigate('calendar') },
    { id: 'insights', label: 'Productivity Insights', icon: BarChart3, action: () => onNavigate('insights') },
    { id: 'create', label: 'Create New Task', icon: Plus, action: onCreateTask },
  ];

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!search.trim()) return [];
    return tasks.filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    ).slice(0, 5);
  }, [search, tasks]);

  // Combined results for keyboard navigation
  const results = useMemo(() => {
    if (!search.trim()) return navItems.map(item => ({ ...item, type: 'nav' }));
    
    return [
      ...filteredTasks.map(t => ({ id: `task-${t.id}`, label: t.title, icon: ArrowRight, type: 'task', task: t })),
      ...navItems.filter(n => n.label.toLowerCase().includes(search.toLowerCase())).map(item => ({ ...item, type: 'nav' }))
    ];
  }, [search, filteredTasks, navItems]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = (item) => {
    if (!item) return;
    if (item.type === 'task') {
      // For tasks, we could edit them. For now, let's just close and maybe scroll to them?
      // Or just open the edit modal.
      onCreateTask(item.task); 
    } else {
      item.action();
    }
    onClose();
    setSearch('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Search Input */}
            <div className="flex items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <Search className="w-5 h-5 text-gray-400 mr-4" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks or commands (Cmd + K)..."
                className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-lg"
              />
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-gray-600">
                  ESC
                </span>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        index === selectedIndex 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon className={`w-5 h-5 ${index === selectedIndex ? 'text-white' : 'text-gray-400'}`} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {index === selectedIndex && (
                        <div className="flex items-center gap-1.5 opacity-80">
                           <span className="text-[10px] font-bold uppercase tracking-widest">Select</span>
                           <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                  <Search className="w-10 h-10 mb-4 opacity-20" />
                  <p className="text-sm font-medium">No results found for "{search}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
               <div className="flex gap-4">
                 <span className="flex items-center gap-1.5">
                   <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[8px] text-gray-500">↓</div>
                   <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[8px] text-gray-500">↑</div>
                   Navigate
                 </span>
                 <span className="flex items-center gap-1.5">
                   <div className="w-6 h-4 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[8px] text-gray-500">ENTER</div>
                   Select
                 </span>
               </div>
               <div className="flex items-center gap-1">
                 <Command className="w-3 h-3" /> K
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

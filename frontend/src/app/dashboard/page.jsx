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
import CalendarView from '@/components/CalendarView';
import KanbanView from '@/components/KanbanView';
import AnalyticsView from '@/components/AnalyticsView';
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
  
  // New features state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentView, setCurrentView] = useState('tasks'); // 'tasks', 'calendar'
  const [customCategories, setCustomCategories] = useState(['Work', 'Personal']);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sortOption, setSortOption] = useState('date'); // 'date', 'name', 'status', 'priority'
  const [showMainSortMenu, setShowMainSortMenu] = useState(false);
  const [showMainFilterMenu, setShowMainFilterMenu] = useState(false);
  const [showMainSuggestions, setShowMainSuggestions] = useState(false);
  const [userSettings, setUserSettings] = useState({ darkMode: false, compactView: false, emailNotifications: true });
  
  // Quick Add state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickDate, setQuickDate] = useState('');
  const [quickPriority, setQuickPriority] = useState('MEDIUM');
  const [quickSubTasks, setQuickSubTasks] = useState([]);
  const [quickNewSubTask, setQuickNewSubTask] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [isQuickAddActive, setIsQuickAddActive] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [filterOption, setFilterOption] = useState('all'); // all, active, completed
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
    if (authLoading || !isAuthenticated) return;
    setIsLoadingTasks(true);
    try {
      // Fetch all tasks so sidebar counts are accurate globally.
      // We still pass debouncedSearch if we want server-side search.
      const [tasksData, summaryData] = await Promise.all([
        getTasks(undefined, debouncedSearch || undefined, undefined, undefined),
        getTaskSummary(),
      ]);
      setTasks(tasksData);
      setSummary(summaryData);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      showToast('Failed to load tasks', 'error');
    } finally {
      setIsLoadingTasks(false);
    }
  }, [authLoading, isAuthenticated, statusFilter, debouncedSearch, selectedCategory, logout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Handle task creation or update. */
  const handleFormSubmit = async (data) => {
    setIsFormLoading(true);
    const submissionData = { ...data };
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Validate due date - prevent past dates for new tasks
    if (submissionData.dueDate && !editingTask) {
      const dueDate = new Date(submissionData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        showToast('Due date cannot be in the past', 'error');
        setIsFormLoading(false);
        return;
      }
    }
    
    // Handle automatic date and category assignment for new tasks
    if (!editingTask) {
      if (selectedCategory && !submissionData.category) {
        submissionData.category = selectedCategory;
      }
      if (statusFilter === 'TODAY' || !submissionData.dueDate) {
        submissionData.dueDate = todayStr;
      }
    }
      
    // Strip any legacy [CAT:] tags from the title before saving
    if (submissionData.title) {
      submissionData.title = submissionData.title.replace(/\[CAT:.*?\]\s*/, '');
    }

    try {
      if (editingTask) {
        await updateTask(editingTask.id, submissionData);
        showToast('Task updated successfully');
      } else {
        await createTask(submissionData);
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

  /** Update task status or date. */
  const handleStatusChange = async (taskId, newStatus, newDate = null) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;

      // Build a clean payload matching backend TaskRequest DTO exactly
      const payload = {
        title: taskToUpdate.title,
        description: taskToUpdate.description || null,
        status: newStatus,
        dueDate: newDate || taskToUpdate.dueDate || null,
        priority: taskToUpdate.priority || 'MEDIUM',
        category: taskToUpdate.category || null,
        subTasks: (taskToUpdate.subTasks || []).map(st => ({
          id: st.id || null,
          title: st.title,
          completed: st.completed,
        })),
      };

      await updateTask(taskId, payload);
      if (newDate) {
        showToast('Task rescheduled to today');
      }
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  /** Handle Priority toggle */
  const handleToggleImportant = async (task) => {
    try {
      const isUrgent = task.priority === 'URGENT';
      const payload = {
        title: task.title,
        description: task.description || null,
        status: task.status,
        dueDate: task.dueDate || null,
        priority: isUrgent ? 'MEDIUM' : 'URGENT',
        category: task.category || null,
        subTasks: (task.subTasks || []).map(st => ({
          id: st.id || null,
          title: st.title,
          completed: st.completed,
        })),
      };
      await updateTask(task.id, payload);
      showToast(isUrgent ? 'Priority set to Medium' : 'Priority set to Urgent');
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to update task', 'error');
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

  /** Toggle a subtask's completion inline without opening the modal. */
  const handleSubTaskToggle = async (task, subTaskIndex) => {
    // Optimistically update local state so the UI doesn't re-render/collapse
    const updatedSubTasks = (task.subTasks || []).map((st, idx) => ({
      id: st.id || null,
      title: st.title,
      completed: idx === subTaskIndex ? !st.completed : st.completed,
    }));
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, subTasks: updatedSubTasks } : t
    ));

    try {
      const payload = {
        title: task.title,
        description: task.description || null,
        status: task.status,
        dueDate: task.dueDate || null,
        priority: task.priority || 'MEDIUM',
        category: task.category || null,
        subTasks: updatedSubTasks,
      };
      await updateTask(task.id, payload);
    } catch (err) {
      // Revert on failure
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, subTasks: task.subTasks } : t
      ));
      showToast('Failed to update subtask', 'error');
    }
  };

  const statusFilterOptions = [
    { value: '', label: 'All Tasks' },
    { value: 'TO_DO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  // Apply filtering and sorting
  let filteredTasks = [...tasks];
  if (statusFilter === 'IMPORTANT') {
    filteredTasks = filteredTasks.filter(t => t.priority === 'URGENT');
  } else if (statusFilter === 'TODAY') {
    // "Today" logic: tasks due today OR overdue — include completed tasks due today
    filteredTasks = filteredTasks.filter(t => {
      if (!t.dueDate) return t.status !== 'COMPLETED'; // Inbox: show undated non-completed
      
      const d = new Date(t.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDate = new Date(d);
      taskDate.setHours(0, 0, 0, 0);
      
      if (taskDate.getTime() === today.getTime()) return true; // Today's tasks (including completed)
      if (t.status !== 'COMPLETED' && taskDate < today) return true; // Overdue non-completed
      return false;
    });
  } else if (statusFilter === 'TO_DO') {
    filteredTasks = filteredTasks.filter(t => t.status === 'TO_DO');
  } else if (statusFilter === 'COMPLETED') {
    filteredTasks = filteredTasks.filter(t => t.status === 'COMPLETED');
  } else if (selectedCategory) {
    // Robust category filtering (Check field OR hidden tag)
    filteredTasks = filteredTasks.filter(t => {
      const hasCategoryField = t.category && t.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
      const hasCategoryTag = t.title && t.title.includes(`[CAT:${selectedCategory}]`);
      return hasCategoryField || hasCategoryTag;
    });
  }

  // Apply secondary status filtering (Filter dropdown)
  if (filterOption === 'active') {
    filteredTasks = filteredTasks.filter(t => t.status !== 'COMPLETED');
  } else if (filterOption === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.status === 'COMPLETED');
  }

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (sortOption === 'name') {
      return (a.title || '').localeCompare(b.title || '');
    } else if (sortOption === 'status') {
      return (a.status || '').localeCompare(b.status || '');
    } else if (sortOption === 'priority') {
      const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
    } else {
      // date
      return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
    }
  });

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden text-[14px] transition-colors duration-300 ${userSettings.darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      
      {/* Top Header - MS To Do Blue Bar */}
      <header className="flex-shrink-0 h-12 bg-[#5a32fa] flex items-center justify-between px-3 md:px-4 text-white z-40">
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <button onClick={() => {
            // On mobile: toggle sidebar open/close. On desktop: toggle collapse.
            if (window.innerWidth < 768) {
              setIsSidebarOpen(!isSidebarOpen);
            } else {
              setIsSidebarCollapsed(prev => !prev);
            }
          }} className="p-1.5 hover:bg-white/10 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-[15px]">OrganiaTasks</span>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-[400px] flex mx-1 md:mx-4 justify-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-[#5a32fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-12 py-1.5 border-transparent rounded bg-white dark:bg-gray-800 text-[#5a32fa] dark:text-purple-400 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-purple-500 focus:border-transparent sm:text-sm"
              placeholder="Search tasks..."
            />

          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 justify-end">
          {/* Dark Mode Toggle (Sun/Moon) */}
          <button 
            onClick={() => setUserSettings(s => ({...s, darkMode: !s.darkMode}))}
            className="p-1.5 hover:bg-white/10 rounded transition-all"
            title={userSettings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {userSettings.darkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-1.5 hover:bg-white/10 rounded relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {(() => { const oc = tasks.filter(t => { if (t.status === 'COMPLETED' || !t.dueDate) return false; return new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0)); }).length; return oc > 0 ? <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[#5a32fa] px-1">{oc}</span> : null; })()}
            </button>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 text-sm font-bold border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <span>Notifications</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                    {(() => {
                      const overdueTasks = tasks.filter(t => {
                        if (t.status === 'COMPLETED' || !t.dueDate) return false;
                        return new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));
                      });
                      if (overdueTasks.length === 0) {
                        return <div className="px-4 py-8 text-center text-gray-400"><svg className="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p className="text-sm font-medium">All caught up!</p></div>;
                      }
                      return overdueTasks.map(t => (
                        <div key={t.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer" onClick={() => { openEditForm(t); setShowNotifications(false); }}>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{t.title?.replace(/\[CAT:.*?\]\s*/, '')}</p>
                              <p className="text-[11px] text-red-500 font-medium mt-0.5">Overdue — was due {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="ml-2 w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-semibold text-xs hover:bg-white/10">
              {user?.name?.substring(0, 2).toUpperCase() || 'IW'}
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
                </div>
                <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Mobile Sidebar Backdrop */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-30 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} ${isSidebarCollapsed ? 'md:w-[60px]' : 'md:w-[280px]'} flex-shrink-0 bg-[#faf9f8] dark:bg-gray-900 border-r border-[#e1dfdd] dark:border-gray-800 flex flex-col absolute md:relative z-40 h-full transition-all duration-300 overflow-hidden`}>
          <div className="p-3 md:hidden flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
            <span className="font-bold text-purple-600">Menu</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto mt-2 md:mt-0">
            <div className="space-y-0.5">
              <button
                onClick={() => { setStatusFilter(''); setCurrentView('tasks'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 border-l-2 transition-colors ${
                  statusFilter === '' && currentView === 'tasks' && !selectedCategory ? 'bg-purple-50 dark:bg-purple-900/30 border-[#5a32fa] text-[#5a32fa] dark:text-purple-400' : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-5 h-5 text-[#5a32fa] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  {!isSidebarCollapsed && <span className="font-medium">Tasks</span>}
                </div>
                {!isSidebarCollapsed && summary?.total > 0 && <span className="text-xs font-semibold">{(summary.total || 0) - (summary.completed || 0)}</span>}
              </button>

              <button
                onClick={() => { setStatusFilter('TODAY'); setCurrentView('tasks'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 border-l-2 transition-colors ${
                  statusFilter === 'TODAY' ? 'bg-purple-50 dark:bg-purple-900/30 border-[#5a32fa] text-[#5a32fa] dark:text-purple-400' : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  {!isSidebarCollapsed && <span className="font-medium">Today</span>}
                </div>
                {!isSidebarCollapsed && (() => { const today = new Date().toISOString().split('T')[0]; const count = tasks.filter(t => t.status !== 'COMPLETED' && t.dueDate && (t.dueDate === today || new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0)))).length; return count > 0 ? <span className="text-xs font-semibold">{count}</span> : null; })()}
              </button>

              <button
                onClick={() => { setCurrentView('calendar'); setStatusFilter(''); setIsSidebarOpen(false); setSelectedCategory(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 border-l-2 transition-colors ${
                  currentView === 'calendar' ? 'bg-purple-50 dark:bg-purple-900/30 border-[#5a32fa] text-[#5a32fa] dark:text-purple-400' : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {!isSidebarCollapsed && <span className="font-medium">Calendar</span>}
                </div>
              </button>

              <button
                onClick={() => { setCurrentView('kanban'); setStatusFilter(''); setIsSidebarOpen(false); setSelectedCategory(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 border-l-2 transition-colors ${
                  currentView === 'kanban' ? 'bg-purple-50 dark:bg-purple-900/30 border-[#5a32fa] text-[#5a32fa] dark:text-purple-400' : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                  {!isSidebarCollapsed && <span className="font-medium">Board</span>}
                </div>
              </button>

              <button
                onClick={() => { setStatusFilter('IMPORTANT'); setCurrentView('tasks'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 border-l-2 transition-colors ${
                  statusFilter === 'IMPORTANT' ? 'bg-purple-50 dark:bg-purple-900/30 border-[#5a32fa] text-[#5a32fa] dark:text-purple-400' : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {!isSidebarCollapsed && <span className="font-medium">Urgent</span>}
                </div>
                {!isSidebarCollapsed && (() => { const count = tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length; return count > 0 ? <span className="text-xs font-semibold">{count}</span> : null; })()}
              </button>

              <button
                onClick={() => { setCurrentView('insights'); setStatusFilter(''); setIsSidebarOpen(false); setSelectedCategory(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 border-l-2 transition-colors ${
                  currentView === 'insights' ? 'bg-purple-50 dark:bg-purple-900/30 border-[#5a32fa] text-[#5a32fa] dark:text-purple-400' : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  {!isSidebarCollapsed && <span className="font-medium">Insights</span>}
                </div>
              </button>
            </div>

            <div className="my-3 border-t border-[#e1dfdd] mx-4" />

            {/* Custom Categories */}
            {!isSidebarCollapsed && (
            <>
            <div className="space-y-0.5">
              {customCategories.map(cat => (
                <div key={cat} className={`group flex items-center justify-between w-full border-l-2 transition-colors ${
                  selectedCategory === cat && currentView === 'tasks' ? 'bg-purple-50 dark:bg-purple-900/30 border-[#5a32fa] text-[#5a32fa] dark:text-purple-400' : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                  <button
                    onClick={() => { setSelectedCategory(cat); setCurrentView('tasks'); setStatusFilter(''); setIsSidebarOpen(false); }}
                    className="flex items-center gap-4 px-4 py-3 flex-1"
                  >
                    <svg className="w-5 h-5 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    <span className="font-medium text-sm">{cat}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400">
                      {tasks.filter(t => 
                        t.status !== 'COMPLETED' &&
                        ((t.category && t.category.toLowerCase() === cat.toLowerCase()) || 
                        (t.title && t.title.includes(`[CAT:${cat}]`)))
                      ).length}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomCategories(customCategories.filter(c => c !== cat));
                        if (selectedCategory === cat) setSelectedCategory(null);
                      }}
                      className="p-2 mr-2 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

              <div className="px-4 py-2 mt-2 group flex items-center gap-3">
                <svg className="w-5 h-5 text-[#5a32fa] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                <input
                  type="text"
                  placeholder="New list"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      setCustomCategories([...customCategories, newCategoryName.trim()]);
                      setNewCategoryName('');
                    }
                  }}
                  className="flex-1 bg-transparent border-none focus:outline-none placeholder-purple-400 text-[#5a32fa] font-medium"
                />
              </div>
            </>
            )}
            </nav>

          </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col bg-[#faf9f8] dark:bg-gray-900 h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar">
            {/* Header Area */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {currentView === 'calendar' ? (
                    'Calendar'
                  ) : currentView === 'kanban' ? (
                    'Board'
                  ) : currentView === 'insights' ? (
                    'Insights'
                  ) : selectedCategory ? (
                    selectedCategory
                  ) : statusFilter === 'TODAY' ? (
                    <><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Today</>
                  ) : statusFilter === 'IMPORTANT' ? (
                    'Urgent Tasks'
                  ) : statusFilter === 'COMPLETED' ? (
                    'Completed'
                  ) : statusFilter === 'TO_DO' ? (
                    'To Do'
                  ) : statusFilter === 'IN_PROGRESS' ? (
                    'In Progress'
                  ) : 'Tasks'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              
              {/* Right Side Header Controls */}
              {currentView !== 'calendar' && currentView !== 'kanban' && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  {/* Sort Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => { setShowMainSortMenu(!showMainSortMenu); setShowMainFilterMenu(false); }} 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${showMainSortMenu ? 'border-[#5a32fa] text-[#5a32fa] bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                      <span className="font-semibold uppercase text-[10px] tracking-wider">Sort {sortOption !== 'date' && `(${sortOption})`}</span>
                    </button>
                    <AnimatePresence>
                      {showMainSortMenu && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowMainSortMenu(false)} />
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-1.5 z-20 overflow-hidden"
                          >
                            {[
                              { val: 'date', label: 'Due Date', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                              { val: 'name', label: 'Alphabetical', icon: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12' },
                              { val: 'status', label: 'By Status', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                              { val: 'priority', label: 'By Priority', icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9' }
                            ].map(opt => (
                              <button 
                                key={opt.val}
                                onClick={() => { setSortOption(opt.val); setShowMainSortMenu(false); }} 
                                className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${sortOption === opt.val ? 'text-[#5a32fa] bg-purple-50/50 dark:bg-purple-900/20' : 'text-gray-600 dark:text-gray-300'}`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} /></svg>
                                {opt.label}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Filter Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => { setShowMainFilterMenu(!showMainFilterMenu); setShowMainSortMenu(false); }} 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${showMainFilterMenu ? 'border-[#5a32fa] text-[#5a32fa] bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      <span className="font-semibold uppercase text-[10px] tracking-wider">Filter {filterOption !== 'all' && `(${filterOption})`}</span>
                    </button>
                    <AnimatePresence>
                      {showMainFilterMenu && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowMainFilterMenu(false)} />
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-1.5 z-20 overflow-hidden"
                          >
                            {[
                              { val: 'all', label: 'All Tasks', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                              { val: 'active', label: 'Active Only', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                              { val: 'completed', label: 'Completed', icon: 'M5 13l4 4L19 7' }
                            ].map(opt => (
                              <button 
                                key={opt.val}
                                onClick={() => { setFilterOption(opt.val); setShowMainFilterMenu(false); }} 
                                className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${filterOption === opt.val ? 'text-[#5a32fa] bg-purple-50/50 dark:bg-purple-900/20' : 'text-gray-600 dark:text-gray-300'}`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} /></svg>
                                {opt.label}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

            </div>

            {/* Input Box Component */}
            {currentView === 'tasks' && (
              <div 
                className={`bg-white dark:bg-gray-800 rounded-xl border transition-all duration-300 mb-6 overflow-hidden ${
                isQuickAddActive 
                  ? 'border-purple-300 dark:border-purple-600 shadow-lg ring-1 ring-purple-100 dark:ring-purple-900/30' 
                  : 'border-gray-200 dark:border-gray-700 shadow-sm'
              }`}
              onFocus={() => setIsQuickAddActive(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  if (!quickTitle && !quickDesc && !quickDate && quickSubTasks.length === 0) setIsQuickAddActive(false);
                }
              }}
            >
              <div className="p-4 flex gap-4">
                <div className="pt-1">
                  <div className={`w-6 h-6 rounded-full border-2 transition-colors ${isQuickAddActive ? 'border-purple-400' : 'border-gray-300'}`}></div>
                </div>
                
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="Add a task"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium placeholder-purple-300 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && quickTitle.trim()) {
                        handleFormSubmit({ 
                          title: quickTitle, 
                          description: quickDesc, 
                          dueDate: quickDate,
                          priority: quickPriority,
                          category: quickCategory || selectedCategory || null,
                          status: 'TO_DO',
                          subTasks: quickSubTasks.map(st => ({ title: st.title, completed: false })),
                        });
                        setQuickTitle(''); setQuickDesc(''); setQuickDate(''); setQuickPriority('MEDIUM');
                        setQuickSubTasks([]); setQuickNewSubTask(''); setQuickCategory('');
                        setIsQuickAddActive(false);
                      }
                    }}
                    disabled={isFormLoading}
                  />
                  
                  <textarea
                    placeholder="Add description..."
                    value={quickDesc}
                    onChange={(e) => setQuickDesc(e.target.value)}
                    className={`w-full bg-transparent border-none focus:ring-0 text-sm text-gray-500 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-600 outline-none resize-none transition-all duration-300 ${
                      isQuickAddActive || quickDesc ? 'opacity-100 h-12 mt-1' : 'opacity-0 h-0 pointer-events-none'
                    }`}
                    rows={2}
                  />
                </div>
              </div>

              {/* Subtask inline list */}
              {isQuickAddActive && quickSubTasks.length > 0 && (
                <div className="px-4 pb-2 pt-1 space-y-1 border-t border-gray-100 dark:border-gray-700">
                  {quickSubTasks.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="flex-1">{st.title}</span>
                      <button onClick={() => setQuickSubTasks(quickSubTasks.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add subtask input */}
              {isQuickAddActive && (
                <div className="px-4 pb-2 flex items-center gap-2 border-t border-gray-50 dark:border-gray-700/50">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Add a checklist item..."
                    value={quickNewSubTask}
                    onChange={(e) => setQuickNewSubTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && quickNewSubTask.trim()) {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuickSubTasks([...quickSubTasks, { title: quickNewSubTask.trim(), completed: false }]);
                        setQuickNewSubTask('');
                      }
                    }}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-600 outline-none"
                  />
                </div>
              )}

              <div className={`flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 transition-all duration-300 ${
                isQuickAddActive || quickDate ? 'min-h-[48px] opacity-100' : 'h-0 opacity-0 pointer-events-none border-none'
              }`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative group">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={quickDate}
                      onChange={(e) => setQuickDate(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 w-8"
                    />
                    <button className="p-1.5 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </button>
                  </div>
                  {quickDate && (
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg">
                      Due: {new Date(quickDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  
                  {/* Quick Priority Selector */}
                  <div className="flex items-center gap-1.5 ml-1 border-l border-gray-200 dark:border-gray-700 pl-3">
                    {[
                      { val: 'LOW', color: 'bg-slate-400' },
                      { val: 'MEDIUM', color: 'bg-indigo-400' },
                      { val: 'HIGH', color: 'bg-amber-500' },
                      { val: 'URGENT', color: 'bg-red-500' }
                    ].map(p => (
                      <button
                        key={p.val}
                        onClick={() => setQuickPriority(p.val)}
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${quickPriority === p.val ? 'ring-2 ring-offset-1 ring-purple-400 scale-110' : 'opacity-40 hover:opacity-100'}`}
                        title={`Set Priority: ${p.val}`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${p.color}`}></span>
                      </button>
                    ))}
                  </div>

                  {/* Quick Category Selector */}
                  {customCategories.length > 0 && (
                    <div className="border-l border-gray-200 dark:border-gray-700 pl-3">
                      <select
                        value={quickCategory || selectedCategory || ''}
                        onChange={(e) => setQuickCategory(e.target.value)}
                        className="text-xs font-semibold bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-purple-600 dark:text-purple-400 focus:ring-1 focus:ring-purple-400 outline-none cursor-pointer"
                      >
                        <option value="">No list</option>
                        {customCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => {
                    if (quickTitle.trim()) {
                      handleFormSubmit({ 
                        title: quickTitle, 
                        description: quickDesc, 
                        dueDate: quickDate,
                        priority: quickPriority,
                        category: quickCategory || selectedCategory || null,
                        status: 'TO_DO',
                        subTasks: quickSubTasks.map(st => ({ title: st.title, completed: false })),
                      });
                      setQuickTitle(''); setQuickDesc(''); setQuickDate(''); setQuickPriority('MEDIUM');
                      setQuickSubTasks([]); setQuickNewSubTask(''); setQuickCategory('');
                      setIsQuickAddActive(false);
                    }
                  }}
                  disabled={!quickTitle.trim() || isFormLoading}
                  className="px-4 py-1.5 text-sm font-bold text-white gradient-primary rounded-lg shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
                >
                  Add Task
                </button>
              </div>
            </div>
          )}

            {/* Main Content Component */}
            {currentView === 'calendar' ? (
              <CalendarView 
                tasks={tasks} 
                onTaskClick={openEditForm} 
                onStatusChange={handleStatusChange}
                onDelete={(t) => setDeleteTarget(t)}
                onToggleImportant={handleToggleImportant}
                onSubTaskToggle={handleSubTaskToggle}
              />
            ) : currentView === 'kanban' ? (
              <KanbanView 
                tasks={tasks} 
                onStatusChange={handleStatusChange}
                onTaskClick={openEditForm}
                onDelete={(t) => setDeleteTarget(t)}
              />
            ) : currentView === 'insights' ? (
              <AnalyticsView tasks={tasks} />
            ) : isLoadingTasks ? (
              <LoadingSpinner message="Loading..." />
            ) : sortedTasks.length === 0 ? (
              <EmptyState view={selectedCategory || statusFilter || 'tasks'} onCreateTask={() => { setEditingTask(null); setIsFormOpen(true); }} />
            ) : (
              <div className="flex flex-col gap-6">
                {/* Overdue Section */}
                {sortedTasks.some(t => {
                  if (!t.dueDate || t.status === 'COMPLETED') return false;
                  return new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));
                }) && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-1 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-widest">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Attention Needed (Overdue)
                    </div>
                    <div className="flex flex-col rounded border border-red-100 dark:border-red-900/30">
                      <AnimatePresence>
                        {sortedTasks.filter(t => {
                          if (!t.dueDate || t.status === 'COMPLETED') return false;
                          return new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));
                        }).map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={openEditForm}
                            onDelete={(t) => setDeleteTarget(t)}
                            onStatusChange={handleStatusChange}
                            onToggleImportant={handleToggleImportant}
                            onSubTaskToggle={handleSubTaskToggle}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Active Tasks */}
                <div className="flex flex-col rounded">
                  <AnimatePresence>
                    {sortedTasks.filter(t => {
                      const isCompleted = t.status === 'COMPLETED';
                      const isOverdue = t.dueDate && !isCompleted && new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));
                      return !isCompleted && !isOverdue;
                    }).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={openEditForm}
                        onDelete={(t) => setDeleteTarget(t)}
                        onStatusChange={handleStatusChange}
                        onToggleImportant={handleToggleImportant}
                        onSubTaskToggle={handleSubTaskToggle}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Completed Tasks Collapsible */}
                {sortedTasks.some(t => t.status === 'COMPLETED') && (
                  <div className="mt-4">
                    <button 
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-all"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-90' : ''}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      Completed ({sortedTasks.filter(t => t.status === 'COMPLETED').length})
                    </button>
                    
                    {showCompleted && (
                      <div className="mt-2 flex flex-col rounded opacity-80">
                        <AnimatePresence>
                          {sortedTasks.filter(t => t.status === 'COMPLETED').map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onEdit={openEditForm}
                              onDelete={(t) => setDeleteTarget(t)}
                              onStatusChange={handleStatusChange}
                              onToggleImportant={handleToggleImportant}
                            onSubTaskToggle={handleSubTaskToggle}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals & Dialogs (Hidden) */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTask(null); }}
        onSubmit={handleFormSubmit}
        task={editingTask}
        isLoading={isFormLoading}
        isTodayView={statusFilter === 'TO_DO'}
        customCategories={customCategories}
        selectedCategory={selectedCategory}
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
              toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

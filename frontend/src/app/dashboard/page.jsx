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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentView, setCurrentView] = useState('tasks'); // 'tasks', 'calendar'
  const [customCategories, setCustomCategories] = useState(['Work', 'Personal']);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sortOption, setSortOption] = useState('date'); // 'date', 'name', 'status'
  const [showMainSortMenu, setShowMainSortMenu] = useState(false);
  const [showMainGroupMenu, setShowMainGroupMenu] = useState(false);
  const [showMainSuggestions, setShowMainSuggestions] = useState(false);
  const [userSettings, setUserSettings] = useState({ darkMode: false, compactView: false, emailNotifications: true });

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

  /** Handle Important toggle */
  const handleToggleImportant = async (task) => {
    try {
      const isImportant = task.title?.includes('!');
      const newTitle = isImportant ? task.title.replace('!', '') : `!${task.title}`;
      await updateTask(task.id, { ...task, title: newTitle });
      showToast(isImportant ? 'Removed from Important' : 'Added to Important');
      await fetchData();
    } catch (err) {
      showToast('Failed to update task', 'error');
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

  // Apply filtering and sorting
  let filteredTasks = [...tasks];
  if (statusFilter === 'IMPORTANT') {
    filteredTasks = filteredTasks.filter(t => t.title?.includes('!'));
  } else if (statusFilter === 'TO_DO') {
    // "Today" logic: tasks without a dueDate OR dueDate is today
    filteredTasks = filteredTasks.filter(t => {
      if (!t.dueDate) return true;
      const d = new Date(t.dueDate);
      const today = new Date();
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });
  } else if (statusFilter === 'COMPLETED') {
    filteredTasks = filteredTasks.filter(t => t.status === 'COMPLETED');
  } else if (selectedCategory) {
    // Mock category filtering
    filteredTasks = filteredTasks.filter(t => t.category === selectedCategory);
  }

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (sortOption === 'name') {
      return (a.title || '').localeCompare(b.title || '');
    } else if (sortOption === 'status') {
      return (a.status || '').localeCompare(b.status || '');
    } else {
      // date
      return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
    }
  });

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden text-[14px] transition-colors duration-300 ${userSettings.darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      
      {/* Top Header - MS To Do Blue Bar */}
      <header className="flex-shrink-0 h-12 bg-[#5a32fa] flex items-center justify-between px-4 text-white z-20">
        <div className="flex items-center gap-4 w-64 flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/10 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-[15px]">OrganiaTasks</span>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-[400px] flex mx-2 md:mx-4 justify-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-[#5a32fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-1.5 border-transparent rounded bg-white text-[#5a32fa] placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent sm:text-sm"
              placeholder="Search tasks..."
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 w-64 justify-end">
          {/* Settings */}
          <div className="relative">
            <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 hover:bg-white/10 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 text-gray-800 border border-gray-100 divide-y divide-gray-100">
                <div className="px-4 py-2 text-sm font-bold text-[#5a32fa]">Settings</div>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Dark Mode</span>
                    <button 
                      onClick={() => setUserSettings(s => ({...s, darkMode: !s.darkMode}))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${userSettings.darkMode ? 'bg-[#5a32fa]' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${userSettings.darkMode ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Compact View</span>
                    <button 
                      onClick={() => setUserSettings(s => ({...s, compactView: !s.compactView}))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${userSettings.compactView ? 'bg-[#5a32fa]' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${userSettings.compactView ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-1.5 hover:bg-white/10 rounded relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              {summary?.todo > 0 && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#5a32fa]" />}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50 text-gray-800 border border-gray-100">
                <div className="px-4 py-2 text-sm font-semibold border-b border-gray-100">Notifications</div>
                <div className="px-4 py-2 text-sm text-gray-500">
                  {summary?.todo > 0 ? `You have ${summary.todo} incomplete tasks.` : 'All caught up!'}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="ml-2 w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-semibold text-xs hover:bg-white/10">
              {user?.name?.substring(0, 2).toUpperCase() || 'IW'}
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800 border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                </div>
                <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full md:w-[280px] md:translate-x-0'} flex-shrink-0 bg-[#faf9f8] border-r border-[#e1dfdd] flex flex-col absolute md:relative z-30 h-full transition-all duration-300 overflow-hidden`}>
          <div className="p-3 md:hidden">
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-200 rounded">
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto mt-2 md:mt-0">
            <div className="space-y-0.5">
              <button
                onClick={() => setStatusFilter('TO_DO')}
                className={`w-full flex items-center justify-between px-4 py-3 border-l-2 transition-colors ${
                  statusFilter === 'TO_DO' ? 'bg-purple-50 border-[#5a32fa] text-[#5a32fa]' : 'border-transparent text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <span className="font-medium">Today</span>
                </div>
                {summary?.todo > 0 && <span className="text-xs font-semibold">{summary.todo}</span>}
              </button>

              <button
                onClick={() => { setStatusFilter(''); setCurrentView('tasks'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 border-l-2 transition-colors ${
                  statusFilter === '' && currentView === 'tasks' && !selectedCategory ? 'bg-purple-50 border-[#5a32fa] text-[#5a32fa]' : 'border-transparent text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-5 h-5 text-[#5a32fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  <span className="font-medium">Tasks</span>
                </div>
                {summary?.total > 0 && <span className="text-xs font-semibold">{summary.total}</span>}
              </button>

              <button
                onClick={() => { setCurrentView('calendar'); setStatusFilter(''); setIsSidebarOpen(false); setSelectedCategory(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 border-l-2 transition-colors ${
                  currentView === 'calendar' ? 'bg-purple-50 border-[#5a32fa] text-[#5a32fa]' : 'border-transparent text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="font-medium">Calendar</span>
                </div>
              </button>

              <button
                onClick={() => setStatusFilter('IMPORTANT')}
                className={`w-full flex items-center px-4 py-3 border-l-2 transition-colors ${
                  statusFilter === 'IMPORTANT' ? 'bg-purple-50 border-[#5a32fa] text-[#5a32fa]' : 'border-transparent text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  <span className="font-medium">Important</span>
                </div>
              </button>
            </div>

            <div className="my-3 border-t border-[#e1dfdd] mx-4" />

            {/* Custom Categories */}
            <div className="space-y-0.5">
              {customCategories.map(cat => (
                <div key={cat} className={`group flex items-center justify-between w-full border-l-2 transition-colors ${
                  selectedCategory === cat && currentView === 'tasks' ? 'bg-purple-50 border-[#5a32fa] text-[#5a32fa]' : 'border-transparent text-gray-700 hover:bg-gray-100'
                }`}>
                  <button
                    onClick={() => { setSelectedCategory(cat); setCurrentView('tasks'); setStatusFilter(''); setIsSidebarOpen(false); }}
                    className="flex items-center gap-4 px-4 py-3 flex-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10H4zM4 14h16M4 18h16" /></svg>
                    <span className="font-medium text-sm">{cat}</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomCategories(customCategories.filter(c => c !== cat));
                      if (selectedCategory === cat) setSelectedCategory(null);
                    }}
                    className="p-2 mr-2 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="px-4 py-2 mt-2 group flex items-center gap-3">
              <svg className="w-5 h-5 text-[#5a32fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
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
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-[#faf9f8] h-full overflow-hidden">
          
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 max-w-5xl">
            {/* Header Area */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-2">
                  {currentView === 'calendar' ? (
                    'Calendar'
                  ) : selectedCategory ? (
                    selectedCategory
                  ) : statusFilter === 'TO_DO' ? (
                    <><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Today</>
                  ) : statusFilter === 'COMPLETED' ? (
                    'Completed'
                  ) : 'Tasks'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              
              {/* Right Side Header Controls */}
              {currentView !== 'calendar' && (
                <div className="flex items-center gap-4 text-sm text-gray-600 relative">
                  <div className="relative">
                    <button onClick={() => setShowMainSortMenu(!showMainSortMenu)} className="flex items-center gap-1.5 hover:text-gray-900"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg> Sort</button>
                    {showMainSortMenu && (
                      <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow border py-1 z-10">
                        <button onClick={() => { setSortOption('date'); setShowMainSortMenu(false); }} className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">By Date</button>
                        <button onClick={() => { setSortOption('name'); setShowMainSortMenu(false); }} className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">By Name</button>
                        <button onClick={() => { setSortOption('status'); setShowMainSortMenu(false); }} className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">By Status</button>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button onClick={() => setShowMainGroupMenu(!showMainGroupMenu)} className="flex items-center gap-1.5 hover:text-gray-900"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg> Filter</button>
                    {showMainGroupMenu && (
                      <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow border py-1 z-10">
                        <button onClick={() => setShowMainGroupMenu(false)} className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">All Tasks</button>
                        <button onClick={() => setShowMainGroupMenu(false)} className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">Active Only</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Input Box Component */}
            <div className="bg-white rounded border border-[#e1dfdd] shadow-sm mb-4">
              <div className="flex items-center px-4 py-3">
                <div className="w-5 h-5 rounded-full border border-gray-400 mr-3"></div>
                <input
                  type="text"
                  placeholder="Add a task"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] placeholder-[#c084fc] text-[#c084fc] outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleFormSubmit({ title: e.target.value, status: 'TO_DO' });
                      e.target.value = '';
                    }
                  }}
                  disabled={isFormLoading}
                />
              </div>
              <div className="flex items-center justify-end px-4 py-2 border-t border-gray-100 bg-[#f8f8f8] rounded-b">
                <button className="px-3 py-1 text-sm font-medium text-gray-400 bg-transparent border border-gray-200 rounded hover:bg-gray-200 hover:text-gray-700 transition-colors">
                  Add
                </button>
              </div>
            </div>

            {/* Main Content Component */}
            {currentView === 'calendar' ? (
              <CalendarView tasks={tasks} onTaskClick={openEditForm} />
            ) : isLoadingTasks ? (
              <LoadingSpinner message="Loading..." />
            ) : sortedTasks.length === 0 ? (
              <EmptyState onCreateTask={openCreateForm} />
            ) : (
              <div className="flex flex-col rounded overflow-hidden">
                <AnimatePresence>
                  {sortedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEditForm}
                      onDelete={(t) => setDeleteTarget(t)}
                      onStatusChange={handleStatusChange}
                      onToggleImportant={handleToggleImportant}
                    />
                  ))}
                </AnimatePresence>
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

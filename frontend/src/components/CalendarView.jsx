import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';

export default function CalendarView({ tasks, onTaskClick, onStatusChange, onDelete, onToggleImportant }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getDayTasks = (day) => tasks.filter(t => {
    const d = new Date(t.dueDate || t.createdAt || Date.now());
    return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  const selectedTasks = getDayTasks(selectedDay);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-purple-100 dark:border-gray-700 shadow-xl shadow-purple-900/5 p-3 md:p-4 relative overflow-hidden transition-colors">
        {/* Decorative gradient blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 rounded-full bg-purple-400/10 blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-4 relative z-10">
          <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-[#5a32fa] to-blue-500 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent tracking-tight">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1.5">
            <button onClick={prevMonth} className="p-1.5 hover:bg-purple-50 dark:hover:bg-gray-700 text-purple-700 dark:text-purple-400 rounded-full transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-purple-50 dark:hover:bg-gray-700 text-purple-700 dark:text-purple-400 rounded-full transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 text-center mb-2 relative z-10">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-[10px] font-bold text-purple-400 dark:text-purple-500 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 md:gap-2 relative z-10">
          {blanks.map(i => <div key={`b-${i}`} className="h-14 md:h-20 rounded-lg bg-transparent"></div>)}
          
          {days.map(day => {
            const dayTasks = getDayTasks(day);
            const today = new Date();
            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
            const isSelected = selectedDay === day;
            const isPast = !isToday && new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().setHours(0,0,0,0));

            return (
              <motion.div 
                key={day} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(day)}
                className={`h-14 md:h-20 border rounded-lg p-1 md:p-1.5 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer ${
                  isSelected
                    ? 'border-[#5a32fa] ring-2 ring-purple-100 dark:ring-purple-900/30 bg-purple-50/50 dark:bg-purple-900/20'
                    : isToday 
                      ? 'border-purple-300 bg-purple-50/30 dark:bg-purple-900/10' 
                      : isPast
                        ? 'border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10 opacity-60'
                        : 'border-purple-50 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-500 bg-white/50 dark:bg-gray-800/40'
                }`}
              >
                <div className={`text-[10px] md:text-[11px] font-bold mb-0.5 md:mb-1 ${isSelected || isToday ? 'text-[#5a32fa] dark:text-purple-400' : 'text-slate-700 dark:text-gray-300'}`}>
                  {day}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-wrap gap-0.5 items-start content-start">
                  {dayTasks.map((t, idx) => {
                    const dotColor = t.status === 'COMPLETED' ? 'bg-green-400'
                      : t.priority === 'URGENT' ? 'bg-red-500'
                      : t.priority === 'HIGH' ? 'bg-orange-400'
                      : t.priority === 'MEDIUM' ? 'bg-[#5a32fa]'
                      : 'bg-gray-400';
                    return (
                      <div key={idx} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Tasks Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5a32fa]"></span>
              Tasks for {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).replace(/\d+$/, selectedDay)}
            </h3>
            <span className="text-[10px] font-bold text-[#5a32fa] bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
              {selectedTasks.length} Tasks
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {selectedTasks.length > 0 ? (
              selectedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onTaskClick}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  onToggleImportant={onToggleImportant}
                />
              ))
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                <p className="text-sm text-gray-400 dark:text-gray-500">No tasks scheduled for this day.</p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

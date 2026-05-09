import React, { useState } from 'react';

export default function CalendarView({ tasks, onTaskClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100 shadow-xl shadow-purple-900/5 p-6 w-full max-w-full relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-purple-400/10 blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#5a32fa] to-blue-500 bg-clip-text text-transparent tracking-tight">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-purple-50 text-purple-700 rounded-full transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
          <button onClick={nextMonth} className="p-2 hover:bg-purple-50 text-purple-700 rounded-full transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 text-center mb-4 relative z-10">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-xs font-bold text-purple-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-3 relative z-10">
        {blanks.map(i => <div key={`b-${i}`} className="h-32 rounded-xl bg-transparent"></div>)}
        
        {days.map(day => {
          const dayTasks = tasks.filter(t => {
            const d = new Date(t.createdAt || Date.now());
            return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
          });

          const today = new Date();
          const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

          return (
            <div 
              key={day} 
              className={`h-32 border rounded-xl p-3 transition-all duration-300 overflow-hidden flex flex-col ${
                isToday ? 'border-purple-500 bg-purple-50 shadow-sm shadow-purple-200/50 scale-[1.02]' : 'border-purple-50 hover:border-purple-300 hover:shadow-md hover:bg-white bg-white/50'
              }`}
            >
              <div className={`text-sm font-bold mb-2 ${isToday ? 'text-[#5a32fa]' : 'text-slate-700'}`}>
                {day}
              </div>
              <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
                {dayTasks.map((t, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onTaskClick && onTaskClick(t)}
                    className="w-full bg-white border border-blue-100 text-blue-900 text-[11px] px-2 py-1 rounded-md shadow-sm truncate font-medium flex items-center gap-1.5 cursor-pointer hover:bg-blue-50"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'COMPLETED' ? 'bg-green-400' : 'bg-blue-500'}`}></span>
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

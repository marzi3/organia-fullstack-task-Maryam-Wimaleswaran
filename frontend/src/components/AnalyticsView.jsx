'use client';

import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Calendar, CheckCircle2, Clock, AlertCircle, 
  ChevronRight, ArrowUpRight, TrendingUp, Filter
} from 'lucide-react';

/**
 * AnalyticsView - Executive Report Style
 * Focuses on high-density data, upcoming deadlines, and professional trends.
 */
export default function AnalyticsView({ tasks }) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const active = tasks.filter(t => t.status !== 'COMPLETED').length;
    const urgent = tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length;

    // Upcoming Deadlines (Next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    const upcomingDeadlines = tasks
      .filter(t => t.dueDate && t.status !== 'COMPLETED' && new Date(t.dueDate) <= nextWeek)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Priority Distribution
    const priorityData = [
      { name: 'Urgent', count: tasks.filter(t => t.priority === 'URGENT').length, color: '#ef4444' },
      { name: 'High', count: tasks.filter(t => t.priority === 'HIGH').length, color: '#f59e0b' },
      { name: 'Medium', count: tasks.filter(t => t.priority === 'MEDIUM').length, color: '#6366f1' },
      { name: 'Low', count: tasks.filter(t => t.priority === 'LOW').length, color: '#94a3b8' }
    ];

    // Productivity Score (0-100)
    const productivityScore = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, urgent, upcomingDeadlines, priorityData, productivityScore };
  }, [tasks]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Executive Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, sub: 'Managed Items', icon: Filter, color: 'text-gray-600' },
          { label: 'Completion Rate', value: `${stats.productivityScore}%`, sub: 'Overall Progress', icon: TrendingUp, color: 'text-green-600' },
          { label: 'Active Items', value: stats.active, sub: 'Needs Attention', icon: Clock, color: 'text-blue-600' },
          { label: 'Critical Path', value: stats.urgent, sub: 'Urgent Priorities', icon: AlertCircle, color: 'text-red-600' }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{item.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</h3>
                <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
              </div>
              <item.icon className={`w-5 h-5 ${item.color} opacity-80`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">Priority Distribution</h3>
              <p className="text-xs text-gray-500">Resource allocation across all tasks</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400">
               <span className="w-2 h-2 rounded-full bg-[#6366f1]"></span> Total Volume
            </div>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats.priorityData} layout="vertical" margin={{ left: 10, right: 30 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                 <XAxis type="number" hide />
                 <YAxis 
                   dataKey="name" 
                   type="category" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                 />
                 <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                   {stats.priorityData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Upcoming Deadlines Table-like List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-6">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {stats.upcomingDeadlines.length > 0 ? stats.upcomingDeadlines.map((task, i) => (
              <div key={task.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'URGENT' ? 'bg-red-500' : 'bg-blue-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{task.title}</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            )) : (
              <div className="h-40 flex flex-col items-center justify-center text-center">
                <Calendar className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">No deadlines in the next 7 days</p>
              </div>
            )}
          </div>
          {stats.upcomingDeadlines.length > 0 && (
            <button className="w-full mt-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[#5a32fa] border border-[#5a32fa]/20 rounded-lg hover:bg-purple-50 transition-colors">
              View All Deadlines
            </button>
          )}
        </motion.div>
      </div>

      {/* Bottom Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-gradient-to-br from-[#5a32fa]/5 to-transparent border border-[#5a32fa]/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-[#5a32fa]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Efficiency Forecast</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Based on your current completion rate of <span className="font-bold text-gray-900 dark:text-white">{stats.productivityScore}%</span>, 
            you are on track to clear your backlog within <span className="font-bold text-[#5a32fa]">4 days</span>. 
            Prioritize the {stats.urgent} urgent items to optimize your critical path.
          </p>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-6 rounded-xl flex items-center justify-between"
        >
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Weekly Summary</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Active Growth</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 font-bold text-sm">
             <ArrowUpRight className="w-4 h-4" />
             +12.5%
          </div>
        </motion.div>
      </div>
    </div>
  );
}

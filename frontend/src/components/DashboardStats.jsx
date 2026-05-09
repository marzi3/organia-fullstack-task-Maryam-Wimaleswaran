'use client';

import { motion } from 'framer-motion';

/**
 * Dashboard summary stats cards — shows total, to-do, in-progress, and completed counts.
 * Uses a responsive grid layout with gradient-accented card designs.
 */
export default function DashboardStats({ summary }) {
  const cards = [
    {
      label: 'Total Tasks',
      value: summary?.total ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      gradient: 'from-indigo-500 to-purple-500',
      bg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'To Do',
      value: summary?.todo ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'In Progress',
      value: summary?.inProgress ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Completed',
      value: summary?.completed ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Gradient accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">{card.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${card.bg}`}>
              <span className={card.iconColor}>{card.icon}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

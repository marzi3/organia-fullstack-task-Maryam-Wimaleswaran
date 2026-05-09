'use client';

/**
 * Status badge component with color-coded styling for task status values.
 */
export default function StatusBadge({ status }) {
  const config = {
    TO_DO: {
      label: 'To Do',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dot: 'bg-amber-400',
      border: 'border-amber-200',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-400',
      border: 'border-blue-200',
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-400',
      border: 'border-emerald-200',
    },
  };

  const c = config[status] || config.TO_DO;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

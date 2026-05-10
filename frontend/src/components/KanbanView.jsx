'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Kanban Board View — allows drag-and-drop task status management.
 */
export default function KanbanView({ tasks, onStatusChange, onTaskClick }) {
  const [columns, setColumns] = useState({
    'TO_DO': { id: 'TO_DO', title: 'To Do', taskIds: [] },
    'IN_PROGRESS': { id: 'IN_PROGRESS', title: 'On Going', taskIds: [] },
    'COMPLETED': { id: 'COMPLETED', title: 'Done', taskIds: [] }
  });

  // Sync columns with tasks prop
  useEffect(() => {
    const newColumns = {
      'TO_DO': { ...columns['TO_DO'], taskIds: tasks.filter(t => t.status === 'TO_DO').map(t => t.id) },
      'IN_PROGRESS': { ...columns['IN_PROGRESS'], taskIds: tasks.filter(t => t.status === 'IN_PROGRESS').map(t => t.id) },
      'COMPLETED': { ...columns['COMPLETED'], taskIds: tasks.filter(t => t.status === 'COMPLETED').map(t => t.id) }
    };
    setColumns(newColumns);
  }, [tasks]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    // If moving between columns
    if (start !== finish) {
      onStatusChange(Number(draggableId), finish.id);
    }
  };

  const statusConfig = {
    'TO_DO': { 
      bg: 'bg-blue-50/50 dark:bg-blue-900/10', 
      border: 'border-blue-100 dark:border-blue-800/50', 
      text: 'text-blue-600 dark:text-blue-400',
      dot: 'bg-blue-500'
    },
    'IN_PROGRESS': { 
      bg: 'bg-amber-50/50 dark:bg-amber-900/10', 
      border: 'border-amber-100 dark:border-amber-800/50', 
      text: 'text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-500'
    },
    'COMPLETED': { 
      bg: 'bg-green-50/50 dark:bg-green-900/10', 
      border: 'border-green-100 dark:border-green-800/50', 
      text: 'text-green-600 dark:text-green-400',
      dot: 'bg-green-500'
    }
  };

  const priorityColors = {
    'LOW': 'bg-slate-400',
    'MEDIUM': 'bg-indigo-400',
    'HIGH': 'bg-amber-500',
    'URGENT': 'bg-red-500'
  };

  return (
    <div className="h-full flex flex-col">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row gap-6 h-full min-h-[500px]">
          {Object.values(columns).map((column) => {
            const columnTasks = column.taskIds.map(id => tasks.find(t => t.id === id)).filter(Boolean);
            const config = statusConfig[column.id];

            return (
              <div key={column.id} className="flex-1 flex flex-col min-w-[280px]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${config.text}`}>
                      {column.title}
                    </h3>
                    <span className="ml-1 text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 rounded-2xl border-2 border-dashed transition-colors duration-300 p-2 ${
                        snapshot.isDraggingOver 
                          ? `${config.bg} ${config.border}` 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => onTaskClick(task)}
                                className={`group relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all ${
                                  snapshot.isDragging ? 'shadow-xl rotate-2 ring-2 ring-purple-400/20' : ''
                                }`}
                              >
                                {/* Priority Indicator */}
                                <div className={`absolute top-0 left-0 bottom-0 w-1 rounded-l-xl ${priorityColors[task.priority] || 'bg-slate-200'}`} />
                                
                                <h4 className={`text-sm font-semibold mb-2 line-clamp-2 transition-colors ${
                                  task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'
                                }`}>
                                  {task.title}
                                </h4>

                                {task.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between">
                                  {task.dueDate ? (
                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                  ) : <div />}

                                  {task.category && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-purple-500 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-800/50">
                                      {task.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

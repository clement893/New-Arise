'use client';

import { useState, ReactNode } from 'react';
import { clsx } from 'clsx';
import Button from './Button';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color?: string;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onCardMove?: (cardId: string, newStatus: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  onCardAdd?: (status: string) => void;
  className?: string;
}

export default function KanbanBoard({
  columns,
  cards,
  onCardMove,
  onCardClick,
  onCardAdd,
  className,
}: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (cardId: string) => {
    setDraggedCard(cardId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    if (draggedCard) {
      onCardMove?.(draggedCard, columnStatus);
    }
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className={clsx('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map((column) => {
        const columnCards = cards.filter((card) => card.status === column.status);
        
        return (
          <div
            key={column.id}
            className={clsx(
              'flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-900 rounded-lg p-4',
              dragOverColumn === column.id && 'ring-2 ring-blue-500'
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    'w-3 h-3 rounded-full',
                    column.color || 'bg-blue-500'
                  )}
                  style={column.color ? { backgroundColor: column.color } : undefined}
                />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {column.title}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                  {columnCards.length}
                </span>
              </div>
              {onCardAdd && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCardAdd(column.status)}
                >
                  +
                </Button>
              )}
            </div>

            {/* Cards */}
            <div className="space-y-3 min-h-[200px]">
              {columnCards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card.id)}
                  onClick={() => onCardClick?.(card)}
                  className={clsx(
                    'bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm cursor-move hover:shadow-md transition-shadow',
                    draggedCard === card.id && 'opacity-50'
                  )}
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {card.title}
                  </h4>
                  {card.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {card.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {card.priority && (
                      <span className={clsx('text-xs px-2 py-1 rounded', getPriorityColor(card.priority))}>
                        {card.priority}
                      </span>
                    )}
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {card.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {card.dueDate && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(card.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}


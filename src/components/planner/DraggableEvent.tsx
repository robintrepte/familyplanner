"use client";

import React, { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from "@/lib/utils";

import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Copy } from "lucide-react";
import type { Event } from "@/types/planner";

export const DraggableEvent = memo(function DraggableEvent({ 
  event, 
  color,
  onEdit,
  onDelete,
  onDuplicate,
  isOverflowPart,
  onResize,
  onResizeEnd,
  isMidnightSegment,
  hourHeight = 80
}: { 
  event: Event, 
  color: string,
  onEdit?: () => void,
  onDelete?: () => void,
  onDuplicate?: () => void,
  isOverflowPart?: boolean,
  onResize?: (id: string, newEndTime: string) => void,
  onResizeEnd?: (id: string, newEndTime: string) => void,
  isMidnightSegment?: boolean,
  hourHeight?: number
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: isOverflowPart ? `${event.id}-overflow` : event.id,
    data: event
  });

  const [, setIsResizing] = React.useState(false);
  const lastEndTimeRef = React.useRef(event.endTime);

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    lastEndTimeRef.current = event.endTime;

    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startEndTime = event.endTime;
    const [startHour, startMin] = startEndTime.split(':').map(Number);
    const [startHourOrig, startMinOrig] = event.startTime.split(':').map(Number);
    
    // If it's an overflow event (ends earlier than it starts), 
    // we treat the end time as being on the next day (+24 hours)
    let totalStartMinutes = startHour * 60 + startMin;
    const totalOrigStartMinutes = startHourOrig * 60 + startMinOrig;
    
    // If we are resizing the overflow part, the "original start" for this segment is 00:00
    // but the actual event start is on the previous day.
    const isActualOverflow = isOverflowPart || totalStartMinutes <= totalOrigStartMinutes;

    if (isActualOverflow && !isOverflowPart) {
      totalStartMinutes += 24 * 60;
    }

    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const deltaY = currentY - startY;
      
      // hourHeight px = 60 mins
      // Snap to 15 mins (hourHeight / 4 px)
      const quarterHeight = hourHeight / 4;
      const minutesChange = Math.round(deltaY / quarterHeight) * 15;
      let newTotalMinutes = totalStartMinutes + minutesChange;
      
      // Don't allow duration to be less than 15 mins
      if (!isOverflowPart && newTotalMinutes <= totalOrigStartMinutes) {
        newTotalMinutes = totalOrigStartMinutes + 15;
      }

      const newHour = Math.floor(newTotalMinutes / 60) % 24;
      const newMin = newTotalMinutes % 60;
      const newTime = `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`;
      
      if (newTime !== event.endTime && onResize) {
        lastEndTimeRef.current = newTime;
        onResize(event.id, newTime);
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      onResizeEnd?.(event.id, lastEndTimeRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onMouseMove, { passive: false });
    window.addEventListener('touchend', onMouseUp);
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
    willChange: 'transform',
  } : undefined;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          onPointerDown={(e) => {
            // Prevent event propagation to grid for click handling
            e.stopPropagation();
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          className={cn(
            "absolute inset-0 rounded-md p-1 text-[10px] overflow-hidden border shadow-sm cursor-grab active:cursor-grabbing transition-all duration-150 ease-out hover:shadow-lg hover:brightness-110 hover:scale-[1.02]",
            isDragging && "opacity-50 shadow-xl z-50"
          )}
          style={{
            ...style,
            backgroundColor: `${color}38`,
            borderColor: color,
            borderLeftWidth: '4px'
          }}
        >
          <div className="font-bold truncate">{event.title}</div>
          <div className="opacity-70">{event.startTime} - {event.endTime}</div>
          
          {/* Resize Handle */}
          {!isMidnightSegment && (
            <div
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
              className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-50"
            />
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEdit} className="gap-2">
          <Edit className="w-4 h-4" />
          Edit
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate} className="gap-2">
          <Copy className="w-4 h-4" />
          Duplicate
        </ContextMenuItem>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <ContextMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4" />
              Delete
            </ContextMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this event. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={onDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ContextMenuContent>
    </ContextMenu>
  );
});

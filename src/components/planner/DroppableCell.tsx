"use client";

import React, { memo } from 'react';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useDroppable } from '@dnd-kit/core';
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface DroppableCellProps {
  dayIndex: number;
  userType: "husband" | "wife";
  hour: number;
  minute: number;
  isCombined?: boolean;
  onAddEvent?: (day: number, hour: number, minute: number, userType: "husband" | "wife") => void;
  onMouseDown?: (day: number, hour: number, minute: number, userType: "husband" | "wife") => void;
  onMouseEnter?: (day: number, hour: number, minute: number, userType: "husband" | "wife") => void;
  children?: React.ReactNode;
}

export const DroppableCell = memo(function DroppableCell({ 
  dayIndex, 
  userType, 
  hour,
  minute,
  isCombined,
  onAddEvent,
  onMouseDown,
  onMouseEnter,
  children 
}: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayIndex}-${userType}-${hour}-${minute}`,
    data: { dayIndex, userType, hour, minute }
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          onMouseDown={(e) => {
            if (e.button === 0) { // Left click only
              onMouseDown?.(dayIndex, hour, minute, userType);
            }
          }}
          onMouseEnter={() => onMouseEnter?.(dayIndex, hour, minute, userType)}
          className={cn(
            "absolute inset-0 border-r border-dashed border-muted-foreground/10 last:border-r-0 h-full",
            isCombined && userType === "husband" && "w-[200%] z-10",
            isCombined && userType === "wife" && "w-[200%] left-[-100%] z-10",
            !isCombined && "w-full",
            isOver && "bg-primary/[0.03] z-50"
          )}
        >
          {isOver && children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onAddEvent?.(dayIndex, hour, minute, userType)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Here
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

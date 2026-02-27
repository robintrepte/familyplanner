"use client";

import React, { useCallback, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  pointerWithin,
  CollisionDetection
} from '@dnd-kit/core';
import { DraggableEvent } from './DraggableEvent';
import { DroppableCell } from './DroppableCell';
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { DEFAULT_CATEGORY_ID, getCategoryColor as getCategoryColorFromConstants } from "@/lib/constants";
import type { Event, Category } from "@/types/planner";

const customCollisionDetection: CollisionDetection = (args) => {
  const { collisionRect } = args;
  
  if (!collisionRect) return [];

  // Use the top-left coordinate of the dragging element for collision
  const pointer = {
    x: collisionRect.left + 5, // small offset to be inside
    y: collisionRect.top + 5,
  };

  return pointerWithin({
    ...args,
    pointerCoordinates: pointer,
  });
};

// Week display: Monday (1) through Sunday (0). Column index i -> dayOfWeek WEEKDAY_ORDER[i]
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const QUARTERS = [0, 15, 30, 45];

export function PlannerGrid({ 
  events, 
  categories,
  onEventUpdate,
  onEventEdit,
  onEventDelete,
  onEventDuplicate,
  onAddEventAtTime,
  zoom = 80
}: { 
  events: Event[], 
  categories: Category[],
  onEventUpdate: (event: Event) => void,
  onEventEdit: (event: Event) => void,
  onEventDelete: (id: string) => void,
  onEventDuplicate: (event: Event) => void,
  onAddEventAtTime: (day: number, startHour: number, startMinute: number, userType: "husband" | "wife", endHour?: number, endMinute?: number) => void,
  zoom?: number
}) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [dragSelection, setDragSelection] = React.useState<{
    dayIndex: number;
    userType: "husband" | "wife";
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  } | null>(null);
  const [draggedEventState, setDraggedEventState] = React.useState<{
    dayIndex: number;
    userType: "husband" | "wife" | "combined";
    hour: number;
    minute: number;
  } | null>(null);
  const [resizingPreview, setResizingPreview] = React.useState<{ id: string; endTime: string } | null>(null);

  const hourHeight = zoom;
  const quarterHeight = hourHeight / 4;

  const addEventAtTime = useCallback((columnIndex: number, startHour: number, startMinute: number, userType: "husband" | "wife", endHour?: number, endMinute?: number) => {
    onAddEventAtTime(WEEKDAY_ORDER[columnIndex], startHour, startMinute, userType, endHour, endMinute);
  }, [onAddEventAtTime]);

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragSelection) {
        addEventAtTime(
          dragSelection.dayIndex,
          dragSelection.startHour,
          dragSelection.startMinute,
          dragSelection.userType,
          dragSelection.endHour,
          dragSelection.endMinute
        );
        setDragSelection(null);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [dragSelection, addEventAtTime]);

  const handleSelectionStart = useCallback((day: number, hour: number, minute: number, userType: "husband" | "wife") => {
    setDragSelection({
      dayIndex: day,
      userType,
      startHour: hour,
      startMinute: minute,
      endHour: hour,
      endMinute: minute + 15
    });
  }, []);

  const handleSelectionMove = useCallback((day: number, hour: number, minute: number, userType: "husband" | "wife") => {
    setDragSelection(prev => {
      if (!prev) return null;
      if (prev.dayIndex !== day || prev.userType !== userType) return prev;

      const currentTotalMinutes = hour * 60 + minute;
      const startTotalMinutes = prev.startHour * 60 + prev.startMinute;

      if (currentTotalMinutes >= startTotalMinutes) {
        const endTotal = currentTotalMinutes + 15;
        const newEndHour = Math.floor(endTotal / 60) % 24;
        const newEndMinute = endTotal % 60;
        
        if (prev.endHour === newEndHour && prev.endMinute === newEndMinute) return prev;

        return {
          ...prev,
          endHour: newEndHour,
          endMinute: newEndMinute
        };
      }
      return prev;
    });
  }, []);

  const handleResize = useCallback((id: string, newEndTime: string) => {
    setResizingPreview(prev => (prev?.id === id ? { id, endTime: newEndTime } : { id, endTime: newEndTime }));
  }, []);

  const handleResizeEnd = useCallback((id: string, newEndTime: string) => {
    const event = events.find(e => e.id === id);
    setResizingPreview(null);
    if (event && event.endTime !== newEndTime) {
      onEventUpdate({ ...event, endTime: newEndTime });
    }
  }, [events, onEventUpdate]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const getCategoryColor = useCallback((id: string, userType?: "husband" | "wife" | "combined") => {
    return getCategoryColorFromConstants(categories ?? [], id, userType, isDark);
  }, [categories, isDark]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const activeEvent = event.active.data.current as Event;
    if (activeEvent) {
      const startParts = activeEvent.startTime.split(':').map(Number);
      const columnIndex = (WEEKDAY_ORDER as readonly number[]).indexOf(activeEvent.dayOfWeek);
      setDraggedEventState({
        dayIndex: columnIndex >= 0 ? columnIndex : activeEvent.dayOfWeek,
        userType: activeEvent.userType,
        hour: startParts[0],
        minute: startParts[1]
      });
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const overData = over.data.current as { dayIndex: number, userType: "husband" | "wife", hour: number, minute: number };
      if (overData) {
        setDraggedEventState(prev => {
          if (prev?.dayIndex === overData.dayIndex && 
              prev?.userType === overData.userType && 
              prev?.hour === overData.hour && 
              prev?.minute === overData.minute) {
            return prev;
          }
          return overData;
        });
      }
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedEventState(null);

    if (over) {
      // Get the original event data
      const activeEvent = active.data.current as Event;
      const overData = over.data.current as { dayIndex: number, userType: "husband" | "wife", hour: number, minute: number };
      
      if (overData && activeEvent) {
        const newDayOfWeek = WEEKDAY_ORDER[overData.dayIndex];
        const newUserType = activeEvent.userType === "combined" ? "combined" : overData.userType;
        
        // Calculate new times based on the hour and minute dropped on
        // We use the original event's duration
        const startParts = activeEvent.startTime.split(':').map(Number);
        const endParts = activeEvent.endTime.split(':').map(Number);
        
        // Handle duration calculation even if it spans midnight
        let durationMinutes = (endParts[0] * 60 + endParts[1]) - (startParts[0] * 60 + startParts[1]);
        if (durationMinutes < 0) {
          durationMinutes += 24 * 60; // Add a full day if it was an overflow event
        }
        
        const newStartHour = overData.hour;
        const newStartMinutes = overData.minute;
        const newStartTime = `${newStartHour.toString().padStart(2, '0')}:${newStartMinutes.toString().padStart(2, '0')}`;
        
        const totalEndMinutes = newStartHour * 60 + newStartMinutes + durationMinutes;
        const newEndHour = Math.floor(totalEndMinutes / 60) % 24;
        const newEndMinutes = totalEndMinutes % 60;
        const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinutes.toString().padStart(2, '0')}`;

        if (
          activeEvent.dayOfWeek !== newDayOfWeek || 
          activeEvent.userType !== newUserType ||
          activeEvent.startTime !== newStartTime
        ) {
          onEventUpdate({
            ...activeEvent,
            dayOfWeek: newDayOfWeek,
            userType: newUserType,
            startTime: newStartTime,
            endTime: newEndTime
          });
        }
      }
    }
  }, [onEventUpdate]);

  const activeEvent = useMemo(() => activeId ? events.find(e => e.id === activeId) : null, [activeId, events]);

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full overflow-hidden bg-background">
        {/* Single horizontal scroll: header + body in one wide block so they always stay aligned */}
        <div className="flex-1 min-w-0 flex flex-col overflow-x-auto">
          <div className="flex flex-col flex-1 min-h-0 min-w-[800px] max-sm:min-w-[calc(60px+7*((100vw-60px)/2))]">
            {/* Header - same grid as body so columns match */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] max-sm:grid-cols-[60px_repeat(7,calc((100vw-60px)/2))] border-b sticky top-0 bg-background z-20">
              <div className="h-16 border-r" />
              {DAYS.map((day) => (
                <div key={day} className="h-16 flex flex-col border-r last:border-r-0">
                  <div className="flex-1 flex items-center justify-center border-b bg-muted/30">
                    <span className="text-xs font-bold text-muted-foreground uppercase">{day.substring(0, 3)}</span>
                  </div>
                  <div className="grid grid-cols-2 h-8 text-sm font-medium text-center border-t">
                    <div className="border-r flex items-center justify-center bg-blue-100/40 dark:bg-blue-900/20">👨</div>
                    <div className="flex items-center justify-center bg-pink-100/40 dark:bg-pink-900/20">👩</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Grid body - same width as header, only vertical scroll */}
            <div className="overflow-y-auto overflow-x-hidden min-h-0 flex-1">
              <div className="grid grid-cols-[60px_repeat(7,1fr)] max-sm:grid-cols-[60px_repeat(7,calc((100vw-60px)/2))] relative min-w-0">
            {/* Time Labels */}
            <div className="col-start-1">
              {HOURS.map(hour => (
                <div 
                  key={hour} 
                  className="border-r border-b text-[10px] flex items-start justify-center pt-1 text-muted-foreground"
                  style={{ height: `${hourHeight}px` }}
                >
                  {`${hour.toString().padStart(2, '0')}:00`}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {DAYS.map((_, dayIndex) => (
              <div key={dayIndex} className="relative border-r last:border-r-0">
                {/* Grid Lines */}
                {HOURS.map(hour => (
                  <div key={hour} className="border-b" style={{ height: `${hourHeight}px` }} />
                ))}

                {/* Drop Zones */}
                <div className="absolute inset-0 z-0">
                  <div className="grid grid-cols-2 h-full w-full">
                    {HOURS.map(hour => (
                      QUARTERS.map(minute => (
                        <React.Fragment key={`${hour}-${minute}`}>
                          <div className="relative border-r border-dashed border-muted-foreground/10 bg-blue-50/20 dark:bg-blue-900/10" style={{ height: `${quarterHeight}px` }}>
                            <DroppableCell 
                              dayIndex={dayIndex} 
                              userType="husband" 
                              hour={hour} 
                              minute={minute}
                              isCombined={activeEvent?.userType === "combined"}
                              onAddEvent={addEventAtTime}
                              onMouseDown={handleSelectionStart}
                              onMouseEnter={handleSelectionMove}
                            >
                              {dragSelection && 
                               dragSelection.dayIndex === dayIndex && 
                               dragSelection.userType === "husband" && 
                               (hour * 60 + minute) >= (dragSelection.startHour * 60 + dragSelection.startMinute) &&
                               (hour * 60 + minute) < (dragSelection.endHour * 60 + dragSelection.endMinute) && (
                                <div className="absolute inset-0 bg-primary/20 border-x-2 border-primary/30 flex flex-col p-1 overflow-hidden rounded-sm ring-1 ring-primary/50 z-20">
                                  <div className="text-[8px] font-bold text-primary truncate">New Event</div>
                                  <div className="text-[8px] text-primary/70">
                                    {`${dragSelection.startHour.toString().padStart(2, '0')}:${dragSelection.startMinute.toString().padStart(2, '0')}`}
                                  </div>
                                </div>
                              )}
                            </DroppableCell>
                          </div>
                          <div className="relative bg-pink-50/20 dark:bg-pink-900/10" style={{ height: `${quarterHeight}px` }}>
                            <DroppableCell 
                              dayIndex={dayIndex} 
                              userType="wife" 
                              hour={hour} 
                              minute={minute}
                              isCombined={activeEvent?.userType === "combined"}
                              onAddEvent={addEventAtTime}
                              onMouseDown={handleSelectionStart}
                              onMouseEnter={handleSelectionMove}
                            >
                              {dragSelection && 
                               dragSelection.dayIndex === dayIndex && 
                               dragSelection.userType === "wife" && 
                               (hour * 60 + minute) >= (dragSelection.startHour * 60 + dragSelection.startMinute) &&
                               (hour * 60 + minute) < (dragSelection.endHour * 60 + dragSelection.endMinute) && (
                                <div className="absolute inset-0 bg-primary/20 border-x-2 border-primary/30 flex flex-col p-1 overflow-hidden rounded-sm ring-1 ring-primary/50 z-20">
                                  <div className="text-[8px] font-bold text-primary truncate">New Event</div>
                                  <div className="text-[8px] text-primary/70">
                                    {`${dragSelection.startHour.toString().padStart(2, '0')}:${dragSelection.startMinute.toString().padStart(2, '0')}`}
                                  </div>
                                </div>
                              )}
                            </DroppableCell>
                          </div>
                        </React.Fragment>
                      ))
                    ))}
                  </div>
                </div>

                {/* Events */}
                <div className="absolute inset-0 grid grid-cols-2 pointer-events-none z-10">
                  {events
                    .filter(e => {
                      const startParts = e.startTime.split(':').map(Number);
                      const endParts = e.endTime.split(':').map(Number);
                      const startTotal = startParts[0] * 60 + startParts[1];
                      const endTotal = endParts[0] * 60 + endParts[1];
                      const realDay = WEEKDAY_ORDER[dayIndex];
                      const isStartDay = e.dayOfWeek === realDay;
                      const isEndDay = (e.dayOfWeek + 1) % 7 === realDay && endTotal < startTotal && endTotal !== 0;
                      return isStartDay || isEndDay;
                    })
                    .map(event => {
                      const eventToShow = resizingPreview?.id === event.id
                        ? { ...event, endTime: resizingPreview.endTime }
                        : event;
                      const startParts = eventToShow.startTime.split(':').map(Number);
                      const endParts = eventToShow.endTime.split(':').map(Number);
                      const startTotal = startParts[0] * 60 + startParts[1];
                      const endTotal = endParts[0] * 60 + endParts[1];
                      
                      const realDay = WEEKDAY_ORDER[dayIndex];
                      const isStartDay = event.dayOfWeek === realDay;
                      const isOverflow = endTotal < startTotal && endTotal !== 0;
                      
                      let displayStartTime = eventToShow.startTime;
                      let displayEndTime = eventToShow.endTime;
                      let top = (startTotal / 60) * hourHeight;
                      let height = ((endTotal - startTotal) / 60) * hourHeight;

                      let isMidnightSegment = false;

                      if (isOverflow) {
                        if (isStartDay) {
                          // Part 1: From start time to end of day
                          displayEndTime = "24:00";
                          height = ((24 * 60 - startTotal) / 60) * hourHeight;
                          isMidnightSegment = true;
                        } else {
                          // Part 2: From start of day to end time
                          displayStartTime = "00:00";
                          top = 0;
                          height = (endTotal / 60) * hourHeight;
                        }
                      } else if (endTotal === 0 && isStartDay) {
                        // Event ends exactly at midnight (00:00)
                        displayEndTime = "24:00";
                        height = ((24 * 60 - startTotal) / 60) * hourHeight;
                      }

                      // Skip rendering the overflow part if it has 0 duration (ends exactly at midnight)
                      if (!isStartDay && endTotal === 0) return null;

                      return (
                        <div 
                          key={`${event.id}-${isStartDay ? 'start' : 'end'}`} 
                          className={cn(
                            "pointer-events-auto absolute left-0",
                            event.userType === "combined" ? "w-full" : "w-1/2",
                            event.userType === "wife" && "left-1/2",
                            activeId === event.id && "opacity-20 grayscale-[0.5]"
                          )}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                        >
                        <DraggableEvent 
                          event={{
                            ...event,
                            startTime: displayStartTime,
                            endTime: displayEndTime,
                          }} 
                          color={getCategoryColor(event.categoryId ?? DEFAULT_CATEGORY_ID, event.userType)} 
                          onEdit={() => onEventEdit(event)}
                          onDelete={() => onEventDelete(event.id)}
                          onDuplicate={() => onEventDuplicate(event)}
                          // Pass original ID for dnd-kit but indicate if it's the second part
                          isOverflowPart={!isStartDay}
                          onResize={handleResize}
                          onResizeEnd={handleResizeEnd}
                          isMidnightSegment={isMidnightSegment}
                          hourHeight={hourHeight}
                        />
                        </div>
                      );
                    })}

                  {/* Ghost Snapping Preview */}
                  {activeEvent && draggedEventState && (
                    (() => {
                      const startParts = activeEvent.startTime.split(':').map(Number);
                      const endParts = activeEvent.endTime.split(':').map(Number);
                      const startTotal = startParts[0] * 60 + startParts[1];
                      const endTotal = endParts[0] * 60 + endParts[1];
                      let duration = endTotal - startTotal;
                      if (duration < 0) duration += 24 * 60;

                      const isStartDay = draggedEventState.dayIndex === dayIndex;
                      const newStartTotal = draggedEventState.hour * 60 + draggedEventState.minute;
                      const newEndTotal = (newStartTotal + duration) % (24 * 60);
                      const isOverflow = (newStartTotal + duration) >= (24 * 60) && newEndTotal !== 0;
                      const draggedDayOfWeek = WEEKDAY_ORDER[draggedEventState.dayIndex];
                      const isEndDay = WEEKDAY_ORDER[dayIndex] === (draggedDayOfWeek + 1) % 7 && isOverflow;

                      if (!isStartDay && !isEndDay) return null;

                      let top = (newStartTotal / 60) * hourHeight;
                      let height = (duration / 60) * hourHeight;

                      if (isOverflow) {
                        if (isStartDay) {
                          height = ((24 * 60 - newStartTotal) / 60) * hourHeight;
                        } else {
                          top = 0;
                          height = (newEndTotal / 60) * hourHeight;
                        }
                      } else if (newEndTotal === 0 && isStartDay) {
                        height = ((24 * 60 - newStartTotal) / 60) * hourHeight;
                      }

                      const userType = activeEvent.userType === "combined" ? "combined" : draggedEventState.userType;

                      return (
                        <div 
                          className={cn(
                            "pointer-events-none absolute left-0 z-0",
                            userType === "combined" ? "w-full" : "w-1/2",
                            userType === "wife" && "left-1/2"
                          )}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                        >
                          <div 
                            className="w-full h-full rounded-md border-2 border-dashed opacity-40"
                            style={{ 
                              borderColor: getCategoryColor(activeEvent.categoryId ?? DEFAULT_CATEGORY_ID, activeEvent.userType),
                              backgroundColor: `${getCategoryColor(activeEvent.categoryId ?? DEFAULT_CATEGORY_ID, activeEvent.userType)}33`
                            }}
                          />
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
      </div>

      <DragOverlay dropAnimation={null} adjustScale={false}>
        {activeEvent ? (
          <div className="w-[200px] opacity-80 pointer-events-none transition-none">
            <DraggableEvent 
              event={activeEvent} 
              color={getCategoryColor(activeEvent.categoryId ?? DEFAULT_CATEGORY_ID, activeEvent.userType)} 
              hourHeight={hourHeight}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

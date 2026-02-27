"use client";

import { useState, useEffect } from "react";
import { PlannerGrid } from "@/components/planner/PlannerGrid";
import { EventEditor } from "@/components/planner/EventEditor";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, ZoomIn, ZoomOut, Heart } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { DEFAULT_CATEGORY_ID, isFixedCategoryId } from "@/lib/constants";
import type { Event, Category } from "@/types/planner";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeWeek, setActiveWeek] = useState("A");
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | Partial<Event> | null>(null);
  const [zoom, setZoom] = useState(80); // Pixels per hour

  useEffect(() => {
    fetchEvents();
    const savedWeek = localStorage.getItem("activeWeek");
    if (savedWeek) setActiveWeek(savedWeek);
    
    // Calculate minimum zoom to fit 24 hours
    const calculateMinZoom = () => {
      if (typeof window === 'undefined') return 40;
      const headerHeight = 64; // header
      const gridHeaderHeight = 64; // day headers
      const availableHeight = window.innerHeight - headerHeight - gridHeaderHeight - 20; // 20px buffer
      return Math.floor(availableHeight / 24);
    };

    const savedZoom = localStorage.getItem("plannerZoom");
    if (savedZoom) {
      setZoom(parseInt(savedZoom));
    } else {
      setZoom(80);
    }

    // Prevent default browser zoom on trackpad pinch/ctrl+wheel
    const handleGlobalWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoom((prev) => {
          const minZoom = calculateMinZoom();
          const newZoom = Math.min(200, Math.max(minZoom, prev + delta));
          localStorage.setItem("plannerZoom", newZoom.toString());
          return newZoom;
        });
      }
    };

    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleGlobalWheel);
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => {
      const minZoom = calculateMinZoom();
      const next = Math.min(200, prev + 10);
      const value = Math.max(minZoom, next);
      localStorage.setItem("plannerZoom", value.toString());
      return value;
    });
  };
  const handleZoomOut = () => {
    setZoom((prev) => {
      const minZoom = calculateMinZoom();
      const value = Math.max(minZoom, prev - 10);
      localStorage.setItem("plannerZoom", value.toString());
      return value;
    });
  };

  const calculateMinZoom = () => {
    if (typeof window === 'undefined') return 20;
    const headerHeight = 64; // header
    const gridHeaderHeight = 64; // day headers
    const availableHeight = window.innerHeight - headerHeight - gridHeaderHeight - 20; // 20px buffer
    return Math.max(20, Math.floor(availableHeight / 24));
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events);
      setCategories(data.categories);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = (checked: boolean) => {
    const newWeek = checked ? "B" : "A";
    setActiveWeek(newWeek);
    localStorage.setItem("activeWeek", newWeek);
  };

  const handleEventUpdate = async (updatedEvent: Event | Omit<Event, "id">) => {
    // Optimistic update
    const hasId = "id" in updatedEvent && (updatedEvent as Event).id;
    const optimisticTempId = hasId ? undefined : `temp-${Date.now()}`;
    setEvents((prev) => {
      const currentEvents = prev || [];
      if (hasId) {
        const existing = currentEvents.find((e) => e.id === (updatedEvent as Event).id);
        if (existing) {
          return currentEvents.map((e) => (e.id === (updatedEvent as Event).id ? (updatedEvent as Event) : e));
        }
      }
      const toAdd = { ...updatedEvent, id: optimisticTempId ?? (updatedEvent as Event).id } as Event;
      return [...currentEvents, toAdd];
    });

    try {
      const isNew = !("id" in updatedEvent && updatedEvent.id);
      const method = isNew ? "POST" : "PATCH";
      const url = isNew ? "/api/events" : `/api/events/${(updatedEvent as Event).id}`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      const saved = await res.json();
      if (isNew && optimisticTempId) {
        // Replace optimistic event (with temp id) with saved event from DB
        setEvents((prev) => prev.map((e) => (e.id === optimisticTempId ? (saved as Event) : e)));
      }
      toast.success("Event saved");
    } catch (error) {
      console.error("Failed to update event:", error);
      toast.error("Failed to save event");
      fetchEvents(); // Rollback
    }
  };

  const handleEventDelete = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    try {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
      toast.success("Event deleted");
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
      fetchEvents();
    }
  };

  const handleEventDuplicate = async (event: Event) => {
    const duplicatedEvent = { ...event, title: `${event.title} (Copy)` };
    delete (duplicatedEvent as { id?: string }).id;
    handleEventUpdate(duplicatedEvent);
  };

  const handleCategoryCreate = async (newCat: { name: string, color: string }) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCat),
      });
      if (!res.ok) throw new Error("Failed to create category");
      const saved = await res.json();
      setCategories((prev) => [...prev, saved]);
      toast.success("Category created");
      return saved;
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category");
      return null;
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (isFixedCategoryId(id)) {
      toast.error("This category cannot be deleted");
      return;
    }
    if (categories.length <= 1) {
      toast.error("You must have at least one category");
      return;
    }
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete category");
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setEvents((prev) =>
        prev.map((e) => (e.categoryId === id ? { ...e, categoryId: DEFAULT_CATEGORY_ID } : e))
      );
      toast.success("Category deleted");
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleAddEventAtTime = (day: number, startHour: number, startMinute: number, userType: "husband" | "wife", endHour?: number, endMinute?: number) => {
    const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
    
    let endTime;
    if (endHour !== undefined && endMinute !== undefined) {
      endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      if (endTime === "00:00") endTime = "24:00";
    } else {
      const eHour = (startHour + 1) % 24;
      endTime = `${eHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
    }
    
    setEditingEvent({
      dayOfWeek: day,
      startTime,
      endTime,
      userType,
      weekType: activeWeek as "A" | "B",
      title: "",
      categoryId: categories[0]?.id || DEFAULT_CATEGORY_ID
    });
    setIsEditorOpen(true);
  };

  const handleAddClick = () => {
    setEditingEvent(null);
    setIsEditorOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setEditingEvent(event);
    setIsEditorOpen(true);
  };

  const filteredEvents = (events || []).filter(
    (e) => e.weekType === "both" || e.weekType === activeWeek
  );

  return (
    <main className="flex flex-col h-screen max-h-screen" role="main" aria-label="Family week planner">
      <Toaster />
      {/* SEO / LLM: crawlable intro (sr-only so it doesn't affect layout) */}
      <p className="sr-only">
        Family Planner is a weekly calendar app for families. View husband and wife columns side by side, create combined events for family time, and switch between A/B weeks. Drag and drop events to reschedule; add categories and resize events. Install as an app on your phone or desktop.
      </p>
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card" role="banner">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 shrink-0 text-pink-500 fill-pink-500" aria-hidden />
          <h1 className="text-xl font-bold tracking-tight max-sm:sr-only">Family Planner</h1>
        </div>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="flex items-center gap-0.5 border-r pr-6 mr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} aria-label="Zoom out">
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} aria-label="Zoom in">
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="week-toggle" className="text-sm font-medium">
              Week {activeWeek}
            </Label>
            <Switch
              id="week-toggle"
              checked={activeWeek === "B"}
              onCheckedChange={handleWeekChange}
            />
          </div>

          <Button size="icon" variant="default" className="h-8 w-8 shrink-0" onClick={handleAddClick} aria-label="Add event">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <PlannerGrid 
            events={filteredEvents} 
            categories={categories} 
            onEventUpdate={handleEventUpdate}
            onEventEdit={handleEventClick}
            onEventDelete={handleEventDelete}
            onEventDuplicate={handleEventDuplicate}
            onAddEventAtTime={handleAddEventAtTime}
            zoom={zoom}
          />
        )}
      </div>

      <EventEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        event={editingEvent}
        categories={categories}
        onSave={handleEventUpdate}
        onDelete={handleEventDelete}
        onCategoryCreate={handleCategoryCreate}
        onCategoryDelete={handleCategoryDelete}
      />
    </main>
  );
}

"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useTheme } from "next-themes";
import { Plus, Trash2 } from "lucide-react";
import { DEFAULT_CATEGORY_ID, isFixedCategoryId } from "@/lib/constants";
import type { Event as EventType, Category } from "@/types/planner";

import {
  ColorPicker,
  ColorPickerTrigger,
  ColorPickerContent,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerSwatch,
  ColorPickerEyeDropper,
  ColorPickerInput,
} from "@/components/ui/color-picker";

export function EventEditor({
  open,
  onOpenChange,
  event,
  categories,
  onSave,
  onDelete,
  onCategoryCreate,
  onCategoryDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Partial<EventType> | null;
  categories: Category[];
  onSave: (event: EventType) => void;
  onDelete?: (id: string) => void;
  onCategoryCreate?: (cat: { name: string; color: string }) => Promise<Category | null>;
  onCategoryDelete?: (id: string) => void;
}) {
  const [formData, setFormData] = React.useState<Partial<EventType>>({
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    userType: "husband",
    categoryId: DEFAULT_CATEGORY_ID,
    dayOfWeek: 1,
    weekType: "both",
  });

  const [newCategory, setNewCategory] = React.useState({ name: "", color: "#3b82f6" });
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const sortedCategories = React.useMemo(() => {
    if (!categories?.length) return categories ?? [];
    const general = categories.find((c) => c.id === DEFAULT_CATEGORY_ID);
    const rest = categories.filter((c) => c.id !== DEFAULT_CATEGORY_ID);
    return general ? [general, ...rest] : categories;
  }, [categories]);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  React.useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        title: "",
        startTime: "09:00",
        endTime: "10:00",
        userType: "husband",
        categoryId: (sortedCategories && sortedCategories[0]) ? sortedCategories[0].id : DEFAULT_CATEGORY_ID,
        dayOfWeek: 1,
        weekType: "both",
      });
    }
  }, [event, categories, sortedCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as EventType);
    onOpenChange(false);
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name || !onCategoryCreate) return;
    const saved = await onCategoryCreate(newCategory);
    if (saved) {
      setFormData({ ...formData, categoryId: saved.id });
      setNewCategory({ name: "", color: "#3b82f6" });
      setIsPopoverOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[400px] flex flex-col p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>{event?.id ? "Edit Event" : "Add New Event"}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-semibold">Title</Label>
              <Input
                id="title"
                placeholder="What are you doing?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Time</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startTime" className="text-xs text-muted-foreground uppercase">From</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="h-12 text-base"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endTime" className="text-xs text-muted-foreground uppercase">To</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="day" className="text-base font-semibold">Day</Label>
              <Select
                value={formData.dayOfWeek?.toString()}
                onValueChange={(v) => setFormData({ ...formData, dayOfWeek: parseInt(v) })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, i) => (
                    <SelectItem key={i} value={i.toString()} className="text-base">
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="userType" className="text-base font-semibold">Who</Label>
              <Select
                value={formData.userType}
                onValueChange={(v: "husband" | "wife" | "combined") => setFormData({ ...formData, userType: v })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="husband" className="text-base">Husband</SelectItem>
                  <SelectItem value="wife" className="text-base">Wife</SelectItem>
                  <SelectItem value="combined" className="text-base">Combined</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="category" className="text-base font-semibold">Category</Label>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5 rounded-full">
                      <Plus className="w-3.5 h-3.5" />
                      New Category
                    </Button>
                  </PopoverTrigger>
                    <PopoverContent 
                      className="w-72 p-4 space-y-4" 
                      side="top" 
                      align="end"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Create New Category</h4>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="cat-name" className="text-[10px] uppercase text-muted-foreground font-bold">Name & Color</Label>
                            <div className="flex gap-2">
                              <Input 
                                id="cat-name"
                                className="h-10 text-sm flex-1"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                placeholder="e.g. Work, Gym..."
                              />
                              <ColorPicker
                                value={newCategory.color}
                                onValueChange={(color) => setNewCategory({ ...newCategory, color })}
                              >
                                <ColorPickerTrigger asChild>
                                  <Button variant="outline" className="h-10 w-10 p-0 overflow-hidden shrink-0">
                                    <ColorPickerSwatch className="h-full w-full border-0 rounded-none" />
                                  </Button>
                                </ColorPickerTrigger>
                                <ColorPickerContent className="w-64 p-4 space-y-4">
                                  <ColorPickerArea />
                                  <div className="flex items-center gap-2">
                                    <ColorPickerEyeDropper />
                                    <div className="flex flex-1 flex-col gap-2">
                                      <ColorPickerHueSlider />
                                    </div>
                                  </div>
                                  <ColorPickerInput />
                                </ColorPickerContent>
                              </ColorPicker>
                            </div>
                          </div>
                          <Button size="sm" className="w-full h-10 font-semibold" onClick={handleCreateCategory}>
                            Save Category
                          </Button>
                        </div>
                      </div>
                      
                      {sortedCategories.length > 0 && (
                        <div className="pt-3 border-t space-y-2">
                          <Label className="text-[10px] uppercase text-muted-foreground font-bold">Manage Existing</Label>
                          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 touch-auto overscroll-contain">
                            {sortedCategories.map(cat => (
                              <div key={cat.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted group">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={cat.colorHusband != null && cat.colorWife != null
                                      ? { background: `linear-gradient(to right, ${(isDark && cat.colorHusbandDark) ? cat.colorHusbandDark : cat.colorHusband} 50%, ${(isDark && cat.colorWifeDark) ? cat.colorWifeDark : cat.colorWife} 50%)` }
                                      : { backgroundColor: (isDark && cat.colorDark) ? cat.colorDark : cat.color }
                                    }
                                  />
                                  <span className="truncate max-w-[140px] font-medium">{cat.name}</span>
                                </div>
                                {!isFixedCategoryId(cat.id) && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will delete the &quot;{cat.name}&quot; category. Events using this category will remain but may lose their color styling.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onCategoryDelete?.(cat.id);
                                        }}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </PopoverContent>
                </Popover>
              </div>
              <Select
                value={formData.categoryId ?? undefined}
                onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortedCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-base">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shrink-0"
                          style={cat.colorHusband != null && cat.colorWife != null
                            ? { background: `linear-gradient(to right, ${(isDark && cat.colorHusbandDark) ? cat.colorHusbandDark : cat.colorHusband} 50%, ${(isDark && cat.colorWifeDark) ? cat.colorWifeDark : cat.colorWife} 50%)` }
                            : { backgroundColor: (isDark && cat.colorDark) ? cat.colorDark : cat.color }
                          }
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pb-4">
              <Label htmlFor="weekType" className="text-base font-semibold">Week Type</Label>
              <Select
                value={formData.weekType}
                onValueChange={(v: "A" | "B" | "both") => setFormData({ ...formData, weekType: v })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both" className="text-base">Both Weeks</SelectItem>
                  <SelectItem value="A" className="text-base">Week A Only</SelectItem>
                  <SelectItem value="B" className="text-base">Week B Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="px-6 py-6 border-t flex flex-row justify-between items-center sm:justify-between bg-muted/30">
            <div>
              {event?.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      size="lg"
                      className="px-6 font-semibold"
                    >
                      Delete
                    </Button>
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
                        onClick={() => {
                          onDelete?.(event.id!);
                          onOpenChange(false);
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                className="px-6 font-semibold"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" className="px-8 font-semibold">
                {event?.id ? "Update" : "Create"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

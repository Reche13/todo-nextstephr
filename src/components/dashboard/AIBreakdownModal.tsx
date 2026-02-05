import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Trash2,
  Plus,
  Edit2,
  Calendar,
  Flag,
  Check,
} from "lucide-react";

import { useAIBreakdownTodo } from "@/hooks/useAITodos";
import { useCreateTodo } from "@/hooks/useTodos";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { type TodoFormData } from "@/schemas/createTodoSchema";
import toast from "react-hot-toast";
import type { CreateTodoInput } from "@/types";
import { cn } from "@/lib/utils";
import { priorityColorsConfig } from "@/lib/colors";
import { MagicCard } from "../ui/magic-card";
import { RainbowButton } from "../ui/rainbow-button";
import { RippleButton } from "../ui/ripple-button";
import Checkbox from "../common/Check";

interface AIBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface EditableTodo extends TodoFormData {
  id: string;
  isEditing?: boolean;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Overdue", isOverdue: true };
  if (diffDays === 0) return { text: "Today", isOverdue: false, isToday: true };
  if (diffDays === 1) return { text: "Tomorrow", isOverdue: false };
  if (diffDays <= 7) return { text: `In ${diffDays} days`, isOverdue: false };

  return {
    text: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }),
    isOverdue: false,
  };
};

function TodoPreviewCard({
  todo,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  todo: EditableTodo;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const priority = priorityColorsConfig[todo.priority];
  const dateInfo = todo.due_date ? formatDate(todo.due_date) : null;

  return (
    <Card className="p-0 shadow-none border-none">
      <MagicCard gradientColor="#D9D9D955" className="p-0">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <Checkbox isSelected={isSelected} onToggleSelect={onToggleSelect} />
            <div className="flex-1 min-w-0 -mt-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-base text-foreground">
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {todo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                        priority.color,
                      )}
                    >
                      <Flag className={cn("h-3 w-3", priority.icon)} />
                      <span className="capitalize">{todo.priority}</span>
                    </span>
                    {dateInfo && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs",
                          dateInfo.isOverdue
                            ? "text-destructive font-medium"
                            : dateInfo.isToday
                              ? "text-orange-600 dark:text-orange-400 font-medium"
                              : "text-muted-foreground",
                        )}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        {dateInfo.text}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <RippleButton
                    type="button"
                    onClick={onEdit}
                    className="cursor-pointer p-1.5"
                  >
                    <Edit2 className="h-4 w-4" />
                  </RippleButton>
                  <RippleButton
                    type="button"
                    onClick={onDelete}
                    className="p-1.5 cursor-pointer text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </RippleButton>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </MagicCard>
    </Card>
  );
}

function TodoEditForm({
  todo,
  onSave,
  onCancel,
  onUpdate,
}: {
  todo: EditableTodo;
  onSave: () => void;
  onCancel: () => void;
  onUpdate: (field: keyof EditableTodo, value: string) => void;
}) {
  const [showTitleError, setShowTitleError] = useState(false);

  const handleDone = () => {
    if (!todo.title.trim()) {
      toast.error("Title cannot be empty");
      setShowTitleError(true);
      return;
    }
    setShowTitleError(false);
    onSave();
  };

  return (
    <Card className="p-0 shadow-none border-none">
      <MagicCard gradientColor="#D9D9D955" className="p-0">
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Title</Label>
            <Input
              value={todo.title}
              onChange={(e) => {
                onUpdate("title", e.target.value);
                if (showTitleError) setShowTitleError(false);
              }}
              placeholder="Task title"
              className={cn("font-medium", showTitleError && "border-destructive")}
            />
            {showTitleError && (
              <p className="text-xs text-destructive">Title is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Description</Label>
            <Input
              value={todo.description}
              onChange={(e) => onUpdate("description", e.target.value)}
              placeholder="Task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Priority</Label>
              <Select
                value={todo.priority}
                onValueChange={(value) => onUpdate("priority", value)}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Due Date</Label>
              <Input
                type="date"
                value={todo.due_date || ""}
                onChange={(e) => onUpdate("due_date", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              onClick={handleDone}
              size="sm"
              className="flex-1 cursor-pointer"
            >
              <Check className="h-3 w-3 mr-2" />
              Done
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              size="sm"
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </MagicCard>
    </Card>
  );
}

export function AIBreakdownModal({
  open,
  onOpenChange,
  onSuccess,
}: AIBreakdownModalProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedTodos, setGeneratedTodos] = useState<EditableTodo[]>([]);
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());

  const aiBreakdownTodo = useAIBreakdownTodo();
  const createTodo = useCreateTodo();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (prompt.length > 800) {
      toast.error("Prompt must be 800 characters or less");
      return;
    }

    try {
      const results = await aiBreakdownTodo.mutateAsync(prompt);
      const todos: EditableTodo[] = results.map((result, index) => ({
        id: `temp-${Date.now()}-${index}`,
        title: result.title,
        description: result.description || "",
        priority: result.priority,
        due_date: result.due_date ? result.due_date.split("T")[0] : undefined,
        isEditing: false,
      }));
      setGeneratedTodos(todos);
      setSelectedTodos(new Set(todos.map((t) => t.id)));
      toast.success(`Generated ${todos.length} tasks!`);
    } catch (error) {
      console.error("Failed to generate todos:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate tasks. Please try again.",
      );
    }
  };

  const handleSave = async () => {
    const todosToSave = generatedTodos.filter((todo) =>
      selectedTodos.has(todo.id),
    );

    if (todosToSave.length === 0) {
      toast.error("Please select at least one task to save");
      return;
    }

    try {
      const savePromises = todosToSave.map((todo) => {
        const todoInput: CreateTodoInput = {
          title: todo.title,
          description: todo.description || undefined,
          priority: todo.priority,
          due_date: todo.due_date || undefined,
        };
        return createTodo.mutateAsync(todoInput);
      });
      await Promise.all(savePromises);

      toast.success(`Saved ${todosToSave.length} task(s) successfully!`);
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save todos:", error);
      toast.error("Failed to save tasks. Please try again.");
    }
  };

  const handleClose = () => {
    setPrompt("");
    setGeneratedTodos([]);
    setSelectedTodos(new Set());
    onOpenChange(false);
  };

  const handleDeleteTodo = (id: string) => {
    setGeneratedTodos((prev) => prev.filter((t) => t.id !== id));
    setSelectedTodos((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedTodos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleUpdateTodo = (
    id: string,
    field: keyof EditableTodo,
    value: string,
  ) => {
    setGeneratedTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, [field]: value } : todo)),
    );
  };

  const handleToggleEdit = (id: string) => {
    setGeneratedTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo,
      ),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Break Down Task with AI
          </DialogTitle>
          <DialogDescription>
            Describe a goal or task, and AI will break it down into actionable
            todos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {generatedTodos.length === 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="breakdown-prompt">Describe your goal</Label>
                <textarea
                  id="breakdown-prompt"
                  placeholder="e.g., Plan a vacation to Japan, including flights, hotels, and itinerary..."
                  value={prompt}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 800) {
                      setPrompt(value);
                    }
                  }}
                  rows={6}
                  className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Maximum 800 characters</span>
                  <span
                    className={
                      prompt.length > 800 ? "text-destructive" : undefined
                    }
                  >
                    {prompt.length}/800
                  </span>
                </div>
              </div>
              <RainbowButton
                type="button"
                onClick={handleGenerate}
                disabled={aiBreakdownTodo.isPending || !prompt.trim()}
                className="w-full cursor-pointer rounded-md"
              >
                {aiBreakdownTodo.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Tasks...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Tasks
                  </>
                )}
              </RainbowButton>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedTodos.size} of {generatedTodos.length} tasks selected
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGeneratedTodos([]);
                    setPrompt("");
                    setSelectedTodos(new Set());
                  }}
                  className="cursor-pointer"
                >
                  Generate New
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {generatedTodos.map((todo) =>
                  todo.isEditing ? (
                    <TodoEditForm
                      key={todo.id}
                      todo={todo}
                      onSave={() => handleToggleEdit(todo.id)}
                      onCancel={() => handleToggleEdit(todo.id)}
                      onUpdate={(field, value) =>
                        handleUpdateTodo(todo.id, field, value)
                      }
                    />
                  ) : (
                    <TodoPreviewCard
                      key={todo.id}
                      todo={todo}
                      isSelected={selectedTodos.has(todo.id)}
                      onToggleSelect={() => handleToggleSelect(todo.id)}
                      onEdit={() => handleToggleEdit(todo.id)}
                      onDelete={() => handleDeleteTodo(todo.id)}
                    />
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {generatedTodos.length > 0 ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={createTodo.isPending || selectedTodos.size === 0}
                className="cursor-pointer"
              >
                {createTodo.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Save Selected Tasks ({selectedTodos.size})
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="cursor-pointer w-full"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

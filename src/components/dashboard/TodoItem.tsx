import { useState } from "react";
import type { Todo } from "@/types";
import { useUpdateTodo, useDeleteTodo } from "@/hooks/useTodos";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit2, Calendar, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onToggleComplete?: () => void;
  onDelete?: () => void;
}

export function TodoItem({
  todo,
  onEdit,
  onToggleComplete,
  onDelete,
}: TodoItemProps) {
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [isDeleting, setIsDeleting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // for dialog

  // Toggle complete
  const handleToggleComplete = async () => {
    await updateTodo.mutateAsync({
      id: todo.id,
      input: { completed: !todo.completed },
    });
    onToggleComplete?.();
  };

  // Delete todo
  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteTodo.mutateAsync(todo.id);
    onDelete?.();
    setOpenDialog(false);
    setIsDeleting(false);
  };

  // Priority config
  const priorityConfig = {
    low: {
      color:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
    },
    medium: {
      color:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
      icon: "text-yellow-600 dark:text-yellow-400",
    },
    high: {
      color:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
    },
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Overdue", isOverdue: true };
    if (diffDays === 0)
      return { text: "Today", isOverdue: false, isToday: true };
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

  const dateInfo = todo.due_date ? formatDate(todo.due_date) : null;
  const isOverdue = dateInfo?.isOverdue || false;
  const priority = priorityConfig[todo.priority];

  return (
    <Card
      className={cn(
        "group transition-all duration-200 py-1",
        todo.completed && "opacity-60",
        isOverdue &&
          !todo.completed &&
          "border-destructive/50 bg-destructive/5",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="mt-0.5">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => handleToggleComplete()}
              className="h-5 w-5 cursor-pointer"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              {/* Todo title + description */}
              <div className="flex-1 space-y-2">
                <div>
                  <h3
                    className={cn(
                      "font-semibold text-base transition-colors",
                      todo.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground",
                    )}
                  >
                    {todo.title}
                  </h3>
                  {todo.description && (
                    <p
                      className={cn(
                        "text-sm mt-1 text-muted-foreground line-clamp-2",
                        todo.completed && "line-through",
                      )}
                    >
                      {todo.description}
                    </p>
                  )}
                </div>

                {/* Priority + due date */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
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
                        isOverdue
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

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(todo)}
                  disabled={todo.completed}
                  className="h-8 w-8"
                  title="Edit todo"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                {/* Delete with ShadCN Dialog */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete todo"
                      disabled={isDeleting || deleteTodo.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Delete Todo</DialogTitle>
                      <p>
                        Are you sure you want to delete "{todo.title}"? This
                        action cannot be undone.
                      </p>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setOpenDialog(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

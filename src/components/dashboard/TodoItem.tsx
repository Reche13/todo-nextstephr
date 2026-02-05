import { useState } from "react";
import type { Todo } from "@/types";
import { useUpdateTodo, useDeleteTodo } from "@/hooks/useTodos";
import { Button } from "@/components/ui/button";
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
import { priorityColorsConfig } from "@/lib/colors";
import DopamineCheckbox from "@/components/common/DopamineCheckbox";
import { RippleButton } from "../ui/ripple-button";

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
  const [pendingCompleted, setPendingCompleted] = useState<boolean | null>(
    null,
  );

  const handleToggleComplete = () => {
    const next =
      pendingCompleted !== null ? !pendingCompleted : !todo.completed;
    setPendingCompleted(next);
    updateTodo.mutate(
      { id: todo.id, input: { completed: next } },
      {
        onSuccess: () => {
          setPendingCompleted(null);
          onToggleComplete?.();
        },
        onError: () => {
          setPendingCompleted(null);
        },
      },
    );
  };

  // Delete todo
  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteTodo.mutateAsync(todo.id);
    onDelete?.();
    setOpenDialog(false);
    setIsDeleting(false);
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
  const priority = priorityColorsConfig[todo.priority];
  const displayCompleted =
    pendingCompleted !== null ? pendingCompleted : todo.completed;

  return (
    <Card
      className={cn(
        "group transition-all duration-200 py-1",
        displayCompleted && "opacity-60",
        isOverdue &&
          !displayCompleted &&
          "border-destructive/50 bg-destructive/5",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="mt-0.5">
            <DopamineCheckbox
              checked={displayCompleted}
              onToggle={handleToggleComplete}
            />
          </div>

          <div className="flex-1 min-w-0 -mt-1">
            <div className="flex items-start justify-between gap-3">
              {/* Todo title + description */}
              <div className="flex-1 space-y-2">
                <div>
                  <h3
                    className={cn(
                      "font-semibold text-base transition-colors",
                      displayCompleted
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
                        displayCompleted && "line-through",
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
                <RippleButton
                  onClick={() => onEdit(todo)}
                  disabled={displayCompleted}
                  className="h-8 w-8 cursor-pointer p-1.5"
                  title="Edit todo"
                >
                  <Edit2 className="h-4 w-4" />
                </RippleButton>

                {/* Delete with ShadCN Dialog */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <RippleButton
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer p-1.5"
                      title="Delete todo"
                      disabled={isDeleting || deleteTodo.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </RippleButton>
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
                        className="cursor-pointer"
                        onClick={() => setOpenDialog(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="cursor-pointer"
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

import type { Todo } from "@/types";
import { TodoItem } from "@/components/dashboard/TodoItem";
import { TodoSkeleton } from "@/components/dashboard/Skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";

import type { EmptyStateType } from "@/types";
import toast from "react-hot-toast";

interface DashboardTodoListProps {
  todos: Todo[];
  isLoading: boolean;
  emptyStateType: EmptyStateType;
  onEdit: (todo: Todo) => void;
  onClearFilters: () => void;
}

export function DashboardTodoList({
  todos,
  isLoading,
  emptyStateType,
  onEdit,
  onClearFilters,
}: DashboardTodoListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <TodoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="bg-card border rounded-lg">
        <EmptyState type={emptyStateType} onClearFilters={onClearFilters} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onEdit={onEdit}
          onToggleComplete={() => {
            toast.success(
              todo.completed
                ? "Todo marked as incomplete"
                : "Todo completed! 🎉",
            );
          }}
          onDelete={() => {
            toast.success("Todo deleted successfully");
          }}
        />
      ))}
    </div>
  );
}

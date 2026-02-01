import { useMemo } from "react";
import type { Todo } from "@/types";
import type { FilterType, SortType } from "../types";

export function useDashboardFilters(
  todos: Todo[],
  filter: FilterType,
  sort: SortType,
  searchQuery: string,
) {
  const filteredAndSortedTodos = useMemo(() => {
    let filtered: Todo[] = todos;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          todo.description?.toLowerCase().includes(query),
      );
    }

    if (filter === "active") {
      filtered = filtered.filter((todo) => !todo.completed);
    } else if (filter === "completed") {
      filtered = filtered.filter((todo) => todo.completed);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "priority": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case "due_date":
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return (
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          );
        default:
          return 0;
      }
    });

    return sorted;
  }, [todos, filter, sort, searchQuery]);

  return filteredAndSortedTodos;
}

type TodoPriority = "low" | "medium" | "high";

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: TodoPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: TodoPriority;
  due_date?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TodoPriority;
  due_date?: string | null;
}

export type FilterType = "all" | "active" | "completed";
export type SortType = "newest" | "oldest" | "priority" | "due_date";
export type EmptyStateType =
  | "empty"
  | "no-results"
  | "no-active"
  | "no-completed";

export interface DashboardStats {
  total: number;
  completed: number;
  active: number;
  completionRate: number;
  overdue: number;
}

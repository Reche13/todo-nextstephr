import { useTodos } from "@/hooks/useTodos";
import { useTodosRealtime } from "@/hooks/useTodosRealtime";

import { toast } from "react-hot-toast";

import { TodoEditDialog } from "@/components/dashboard/TodoEditDialog";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardTodoList } from "@/components/dashboard/DashboardTodoList";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { AIBreakdownModal } from "@/components/dashboard/AIBreakdownModal";

import { useDashboardFilters } from "../hooks/useDashboardFilters";

import type { EmptyStateType, FilterType, SortType, Todo } from "@/types";
import { useMemo, useState } from "react";
import { GridPattern } from "@/components/ui/grid-pattern";

const Dashboard = () => {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIBreakdown, setShowAIBreakdown] = useState(false);

  const clearFilters = () => {
    setSearchQuery("");
    setFilter("all");
  };

  const { data: todos = [], isLoading } = useTodos();
  useTodosRealtime();

  const filteredAndSortedTodos = useDashboardFilters(
    todos,
    filter,
    sort,
    searchQuery,
  );

  const getEmptyStateType = (
    searchQuery: string,
    filter: FilterType,
  ): EmptyStateType => {
    if (searchQuery || filter !== "all") {
      if (filter === "active") return "no-active";
      if (filter === "completed") return "no-completed";
      return "no-results";
    }
    return "empty";
  };

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    const overdue = todos.filter(
      (t) => t.due_date && !t.completed && new Date(t.due_date) < new Date(),
    ).length;

    return { total, completed, active, completionRate, overdue };
  }, [todos]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <DashboardHeader onOpenAIBreakdown={() => setShowAIBreakdown(true)} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <GridPattern
          width={20}
          height={20}
          x={-1}
          y={-1}
          strokeDasharray={"4 2"}
          className="opacity-30"
        />
        <div className="relative z-30 container mx-auto px-4 py-6 max-w-7xl h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <DashboardSidebar />

            {/* Scrollable Todo List Area */}
            <div className="lg:col-span-2 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <DashboardStats stats={stats} />

                <DashboardFilters
                  filter={filter}
                  sort={sort}
                  searchQuery={searchQuery}
                  totalCount={filteredAndSortedTodos.length}
                  onFilterChange={setFilter}
                  onSortChange={setSort}
                  onSearchChange={setSearchQuery}
                  onClearFilters={clearFilters}
                />

                <DashboardTodoList
                  todos={filteredAndSortedTodos}
                  isLoading={isLoading}
                  emptyStateType={getEmptyStateType(searchQuery, filter)}
                  onEdit={setEditingTodo}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingTodo && (
        <TodoEditDialog
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onSuccess={() => toast.success("Todo updated successfully!")}
        />
      )}

      <AIBreakdownModal
        open={showAIBreakdown}
        onOpenChange={setShowAIBreakdown}
        onSuccess={() => {
          setShowAIBreakdown(false);
        }}
      />
    </div>
  );
};

export default Dashboard;

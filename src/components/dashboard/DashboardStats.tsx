import { StatsCard } from "@/components/dashboard/StatsCard";
import { CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types";

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <StatsCard
        title="Total"
        value={stats.total}
        icon={ListTodo}
        color="purple"
      />
      <StatsCard
        title="Active"
        value={stats.active}
        icon={Clock}
        color="blue"
        subtitle={
          stats.total > 0
            ? `${stats.total - stats.active} completed`
            : undefined
        }
      />
      <StatsCard
        title="Completed"
        value={stats.completed}
        icon={CheckCircle2}
        color="green"
        subtitle={
          stats.completionRate > 0 ? `${stats.completionRate}% done` : undefined
        }
      />
      <StatsCard
        title="Overdue"
        value={stats.overdue}
        icon={TrendingUp}
        color="orange"
        subtitle={stats.overdue > 0 ? "Needs attention" : undefined}
      />
    </div>
  );
}

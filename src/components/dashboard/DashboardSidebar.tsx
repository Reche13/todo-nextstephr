import { TodoForm } from "@/components/dashboard/TodoForm";
import toast from "react-hot-toast";

export function DashboardSidebar() {
  return (
    <div className="lg:col-span-1">
      <div className="sticky space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <TodoForm
          onSuccess={() => toast.success("Todo created successfully!")}
        />
      </div>
    </div>
  );
}

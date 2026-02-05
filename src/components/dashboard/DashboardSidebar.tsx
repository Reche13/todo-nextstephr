import { TodoFormWithAI } from "@/components/dashboard/TodoForm";
import toast from "react-hot-toast";

export function DashboardSidebar() {
  return (
    <div className="lg:col-span-1">
      <div className="sticky space-y-4">
        <TodoFormWithAI
          onSuccess={() => toast.success("Todo created successfully!")}
        />
      </div>
    </div>
  );
}

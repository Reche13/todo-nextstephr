export type Todo = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

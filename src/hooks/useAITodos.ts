import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface AICreateTodoResponse {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  due_date: string | null;
}

interface AIBreakdownTodoResponse {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  due_date: string | null;
}

const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export function useAICreateTodo() {
  return useMutation({
    mutationFn: async (prompt: string): Promise<AICreateTodoResponse> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke(
        "ai-create-todo",
        {
          body: { prompt },
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
          },
        },
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data as AICreateTodoResponse;
    },
  });
}

export function useAIBreakdownTodo() {
  return useMutation({
    mutationFn: async (prompt: string): Promise<AIBreakdownTodoResponse[]> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Not authenticated");

      if (prompt.length > 800) {
        throw new Error("Prompt must be 800 characters or less");
      }

      const { data, error } = await supabase.functions.invoke(
        "ai-todo-breakdown",
        {
          body: { prompt },
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
          },
        },
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      return data as AIBreakdownTodoResponse[];
    },
  });
}

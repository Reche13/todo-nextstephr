import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Todo, CreateTodoInput, UpdateTodoInput } from "@/types";
import { queryClient } from "@/providers/QueryProvider";

export function useTodos() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Todo[];
    },
  });
}

export function useCreateTodo() {
  return useMutation({
    mutationFn: async (input: CreateTodoInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("todos")
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          priority: input.priority || "medium",
          due_date: input.due_date || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useUpdateTodo() {
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateTodoInput;
    }) => {
      const { data, error } = await supabase
        .from("todos")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...input } : t)) ?? old,
      );
      return { previousTodos };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTodos != null) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useDeleteTodo() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useBulkUpdateTodos() {
  return useMutation({
    mutationFn: async ({
      ids,
      input,
    }: {
      ids: string[];
      input: UpdateTodoInput;
    }) => {
      const { data, error } = await supabase
        .from("todos")
        .update(input)
        .in("id", ids)
        .select();

      if (error) throw error;
      return data as Todo[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useBulkDeleteTodos() {
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("todos").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

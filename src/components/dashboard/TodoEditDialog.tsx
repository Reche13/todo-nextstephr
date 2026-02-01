import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Todo } from "@/types";
import { useUpdateTodo } from "@/hooks/useTodos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { todoSchema, type TodoFormData } from "@/schemas/editTodoSchema";

interface TodoEditDialogProps {
  todo: Todo | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TodoEditDialog({
  todo,
  onClose,
  onSuccess,
}: TodoEditDialogProps) {
  const updateTodo = useUpdateTodo();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
  });

  useEffect(() => {
    if (todo) {
      reset({
        title: todo.title,
        description: todo.description || "",
        priority: todo.priority,
        due_date: todo.due_date
          ? new Date(todo.due_date).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [todo, reset]);

  if (!todo) return null;

  const onSubmit = async (data: TodoFormData) => {
    try {
      await updateTodo.mutateAsync({
        id: todo.id,
        input: {
          ...data,
          due_date: data.due_date || null,
        },
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Todo</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="What needs to be done?"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                placeholder="Add details..."
                {...register("description")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>

                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due_date">Due Date</Label>
                <Input
                  id="edit-due_date"
                  type="date"
                  {...register("due_date")}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 mt-6">
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              type="submit"
              disabled={updateTodo.isPending}
            >
              {updateTodo.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

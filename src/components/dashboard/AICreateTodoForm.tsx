import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Loader2,
  X,
  Edit2,
  Calendar,
  Flag,
  Check,
} from "lucide-react";

import { useAICreateTodo } from "@/hooks/useAITodos";
import { useCreateTodo } from "@/hooks/useTodos";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todoSchema, type TodoFormData } from "@/schemas/createTodoSchema";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { MagicCard } from "@/components/ui/magic-card";
import { RippleButton } from "@/components/ui/ripple-button";
import { priorityColorsConfig } from "@/lib/colors";

interface AICreateTodoFormProps {
  onSuccess?: () => void;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Overdue", isOverdue: true };
  if (diffDays === 0) return { text: "Today", isOverdue: false, isToday: true };
  if (diffDays === 1) return { text: "Tomorrow", isOverdue: false };
  if (diffDays <= 7) return { text: `In ${diffDays} days`, isOverdue: false };

  return {
    text: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }),
    isOverdue: false,
  };
};

export function AICreateTodoForm({ onSuccess }: AICreateTodoFormProps) {
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedData, setGeneratedData] = useState<TodoFormData | null>(null);

  const aiCreateTodo = useAICreateTodo();
  const createTodo = useCreateTodo();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      priority: "medium",
    },
  });

  const formData = watch();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      const result = await aiCreateTodo.mutateAsync(prompt);
      const todoData: TodoFormData = {
        title: result.title,
        description: result.description || "",
        priority: result.priority,
        due_date: result.due_date ? result.due_date.split("T")[0] : "",
      };
      setValue("title", todoData.title);
      setValue("description", todoData.description);
      setValue("priority", todoData.priority);
      setValue("due_date", todoData.due_date);
      setGeneratedData(todoData);
      setShowPromptInput(false);
      setShowPreview(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to generate todo:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate todo. Please try again.",
      );
    }
  };

  const onSubmit = async (data: TodoFormData) => {
    try {
      await createTodo.mutateAsync({
        ...data,
        due_date: data.due_date || undefined,
      });
      reset();
      setShowPreview(false);
      setPrompt("");
      setGeneratedData(null);
      setIsEditing(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create todo:", error);
      toast.error("Failed to create todo. Please try again.");
    }
  };

  const handleCancel = () => {
    reset();
    setShowPreview(false);
    setShowPromptInput(false);
    setPrompt("");
    setGeneratedData(null);
    setIsEditing(false);
  };

  const handleSaveDirectly = async () => {
    if (!generatedData) return;
    try {
      await createTodo.mutateAsync({
        ...generatedData,
        due_date: generatedData.due_date || undefined,
      });
      reset();
      setShowPreview(false);
      setPrompt("");
      setGeneratedData(null);
      setIsEditing(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create todo:", error);
      toast.error("Failed to create todo. Please try again.");
    }
  };

  if (showPreview && !isEditing) {
    const displayData = generatedData || formData;
    const priority = priorityColorsConfig[displayData.priority];
    const dateInfo = displayData.due_date
      ? formatDate(displayData.due_date)
      : null;

    return (
      <Card className="shadow-none border-none p-0">
        <MagicCard gradientColor="#D9D9D955" className="py-7">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Generated Todo
              </CardTitle>
              <RippleButton
                type="button"
                onClick={() => setIsEditing(true)}
                className="cursor-pointer w-fit p-1.5"
              >
                <Edit2 className="h-4 w-4" />
              </RippleButton>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-1">
                  {displayData.title}
                </h3>
                {displayData.description && (
                  <p className="text-sm text-muted-foreground">
                    {displayData.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                    priority.color,
                  )}
                >
                  <Flag className={cn("h-3 w-3", priority.icon)} />
                  <span className="capitalize">{displayData.priority}</span>
                </span>
                {dateInfo && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs",
                      dateInfo.isOverdue
                        ? "text-destructive font-medium"
                        : dateInfo.isToday
                          ? "text-orange-600 dark:text-orange-400 font-medium"
                          : "text-muted-foreground",
                    )}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {dateInfo.text}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={handleSaveDirectly}
                disabled={createTodo.isPending}
                className="flex-1 cursor-pointer"
              >
                {createTodo.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Todo
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={createTodo.isPending}
                className="cursor-pointer"
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createTodo.isPending}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </MagicCard>
      </Card>
    );
  }

  if (showPreview && isEditing) {
    return (
      <Card className="shadow-none border-none p-0">
        <MagicCard gradientColor="#D9D9D955" className="py-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Edit AI-Generated Todo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="ai-title">Title *</Label>
                <Input
                  id="ai-title"
                  placeholder="What needs to be done?"
                  {...register("title")}
                  className="transition-all focus:ring-2"
                />
                {errors.title && (
                  <p className="text-sm text-destructive animate-in fade-in">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-description">Description</Label>
                <Input
                  id="ai-description"
                  placeholder="Add details (optional)..."
                  {...register("description")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-priority">Priority</Label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                  <Label htmlFor="ai-due_date">Due Date</Label>
                  <Input
                    id="ai-due_date"
                    type="date"
                    {...register("due_date")}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createTodo.isPending}
                  className="flex-1 cursor-pointer"
                >
                  {createTodo.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Todo"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={createTodo.isPending}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </MagicCard>
      </Card>
    );
  }

  if (showPromptInput) {
    return (
      <Card className="p-0 shadow-none border-none">
        <MagicCard gradientColor="#D9D9D955" className="py-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create with AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-">
              <div className="space-y-2">
                <Label
                  htmlFor="ai-prompt"
                  className="text-muted-foreground font-medium"
                >
                  Describe your task
                </Label>
                <Input
                  id="ai-prompt"
                  placeholder="e.g., prepare for exams"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  className="transition-all focus:ring-2"
                />
              </div>
              <div className="flex gap-2">
                <RainbowButton
                  type="button"
                  onClick={handleGenerate}
                  disabled={aiCreateTodo.isPending || !prompt.trim()}
                  className="flex-1 cursor-pointer rounded-md"
                >
                  {aiCreateTodo.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </RainbowButton>
                <RippleButton
                  type="button"
                  onClick={() => {
                    setShowPromptInput(false);
                    setPrompt("");
                  }}
                  disabled={aiCreateTodo.isPending}
                  className="cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </RippleButton>
              </div>
            </div>
          </CardContent>
        </MagicCard>
      </Card>
    );
  }

  return (
    <RainbowButton
      type="button"
      onClick={() => setShowPromptInput(true)}
      size="lg"
      className="flex items-center gap-3 w-full"
    >
      <Sparkles className="h-5 w-5 mr-2" />
      Create with AI
    </RainbowButton>
  );
}

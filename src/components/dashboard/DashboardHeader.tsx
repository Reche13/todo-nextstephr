import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import { RainbowButton } from "../ui/rainbow-button";

interface DashboardHeaderProps {
  onOpenAIBreakdown?: () => void;
}

export function DashboardHeader({ onOpenAIBreakdown }: DashboardHeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              NextStepHR Todos
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Welcome back,{" "}
              <span className="font-medium">{user?.user_metadata?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenAIBreakdown && (
              <RainbowButton
                variant="default"
                onClick={onOpenAIBreakdown}
                className="cursor-pointer rounded-md"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Plan Todos with AI
              </RainbowButton>
            )}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-fit cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

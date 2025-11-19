import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DietDayEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: string;
  currentDayPlan: any;
  userPreferences: any;
  onDayRegenerated: () => void;
}

const DietDayEditor = ({ 
  open, 
  onOpenChange, 
  day, 
  currentDayPlan,
  userPreferences,
  onDayRegenerated 
}: DietDayEditorProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Regenerating diet plan for:", day);

      const { data, error } = await supabase.functions.invoke("generate-diet-plan", {
        body: { 
          preferences: userPreferences,
          singleDay: day 
        }
      });

      if (error) throw error;
      if (!data?.plan) throw new Error("No diet plan returned");

      toast({
        title: "Day regenerated!",
        description: `${day}'s meals have been updated`
      });

      onDayRegenerated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Day regeneration error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate day",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {day}'s Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {currentDayPlan && (
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Breakfast</h4>
                <p className="text-sm">{currentDayPlan.breakfast?.meal}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentDayPlan.breakfast?.calories} cal | {currentDayPlan.breakfast?.protein}g protein
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Lunch</h4>
                <p className="text-sm">{currentDayPlan.lunch?.meal}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentDayPlan.lunch?.calories} cal | {currentDayPlan.lunch?.protein}g protein
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Dinner</h4>
                <p className="text-sm">{currentDayPlan.dinner?.meal}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentDayPlan.dinner?.calories} cal | {currentDayPlan.dinner?.protein}g protein
                </p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleRegenerate} 
            disabled={loading} 
            className="w-full"
            variant="secondary"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate This Day
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DietDayEditor;

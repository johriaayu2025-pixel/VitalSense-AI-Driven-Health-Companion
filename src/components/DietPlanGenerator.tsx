import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DietPlanGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanGenerated?: (plan: any) => void;
}

const DietPlanGenerator = ({ open, onOpenChange, onPlanGenerated }: DietPlanGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    weight: "",
    height: "",
    goal: "maintenance",
    activityLevel: "moderate",
    dietaryRestrictions: "",
    preferences: "",
    budget: "moderate"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Generating diet plan with preferences:", formData);

      const { data, error } = await supabase.functions.invoke("generate-diet-plan", {
        body: { preferences: formData }
      });

      console.log("Diet plan response:", data, error);

      if (error) throw error;
      if (!data?.plan) throw new Error("No diet plan returned from server");

      // Save to database
      const { error: saveError } = await supabase.from("diet_plans").insert({
        user_id: user.id,
        plan_data: data.plan,
        user_preferences: formData
      });

      if (saveError) throw saveError;

      toast({
        title: "Diet plan generated!",
        description: "Your personalized 7-day plan is ready"
      });

      onPlanGenerated?.(data.plan);
      onOpenChange(false);
      
      // Reload the page to show the new diet plan
      window.location.reload();
      
      setFormData({
        age: "",
        gender: "male",
        weight: "",
        height: "",
        goal: "maintenance",
        activityLevel: "moderate",
        dietaryRestrictions: "",
        preferences: "",
        budget: "moderate"
      });
    } catch (error: any) {
      console.error("Diet plan generation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate diet plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Your Personalized Diet Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="25"
                required
              />
            </div>

            <div>
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="70"
                required
              />
            </div>

            <div>
              <Label>Height (cm)</Label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="170"
                required
              />
            </div>
          </div>

          <div>
            <Label>Goal</Label>
            <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="weight_gain">Weight Gain</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Activity Level</Label>
            <Select value={formData.activityLevel} onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                <SelectItem value="very_active">Very Active (intense exercise daily)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Budget</Label>
            <Select value={formData.budget} onValueChange={(value) => setFormData({ ...formData, budget: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Budget</SelectItem>
                <SelectItem value="moderate">Moderate Budget</SelectItem>
                <SelectItem value="high">High Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Dietary Restrictions (optional)</Label>
            <Input
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              placeholder="e.g., Vegetarian, No dairy, Gluten-free"
            />
          </div>

          <div>
            <Label>Food Preferences (optional)</Label>
            <Textarea
              value={formData.preferences}
              onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
              placeholder="e.g., Love spicy food, Prefer Indian cuisine, Don't like fish"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate Plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DietPlanGenerator;

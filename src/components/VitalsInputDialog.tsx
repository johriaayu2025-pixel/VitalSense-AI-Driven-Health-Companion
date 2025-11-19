import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface VitalsInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const VitalsInputDialog = ({ open, onOpenChange, onSuccess }: VitalsInputDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    spo2: "",
    heart_rate: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    temperature: "",
    blood_glucose: "",
    weight: "",
    sleep_hours: "",
    stress_level: "",
    hydration: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const dataToInsert: any = {
        user_id: user.id,
        recorded_at: new Date().toISOString(),
      };

      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          dataToInsert[key] = parseFloat(value);
        }
      });

      const { error } = await supabase.from("health_vitals").insert(dataToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your health vitals have been recorded.",
      });

      setFormData({
        spo2: "",
        heart_rate: "",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        temperature: "",
        blood_glucose: "",
        weight: "",
        sleep_hours: "",
        stress_level: "",
        hydration: "",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enter Your Health Vitals</DialogTitle>
          <DialogDescription>
            Fill in your current health measurements. You can skip any fields.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spo2">SpO2 (%)</Label>
              <Input
                id="spo2"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.spo2}
                onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                placeholder="95-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
              <Input
                id="heart_rate"
                type="number"
                step="1"
                min="0"
                max="300"
                value={formData.heart_rate}
                onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                placeholder="60-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bp_sys">Blood Pressure (Systolic)</Label>
              <Input
                id="bp_sys"
                type="number"
                step="1"
                min="0"
                max="300"
                value={formData.blood_pressure_systolic}
                onChange={(e) =>
                  setFormData({ ...formData, blood_pressure_systolic: e.target.value })
                }
                placeholder="120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bp_dia">Blood Pressure (Diastolic)</Label>
              <Input
                id="bp_dia"
                type="number"
                step="1"
                min="0"
                max="200"
                value={formData.blood_pressure_diastolic}
                onChange={(e) =>
                  setFormData({ ...formData, blood_pressure_diastolic: e.target.value })
                }
                placeholder="80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="90"
                max="110"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                placeholder="98.6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_glucose">Blood Glucose (mg/dL)</Label>
              <Input
                id="blood_glucose"
                type="number"
                step="1"
                min="0"
                value={formData.blood_glucose}
                onChange={(e) => setFormData({ ...formData, blood_glucose: e.target.value })}
                placeholder="70-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleep_hours">Sleep (hours)</Label>
              <Input
                id="sleep_hours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={formData.sleep_hours}
                onChange={(e) => setFormData({ ...formData, sleep_hours: e.target.value })}
                placeholder="7-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stress_level">Stress Level (1-10)</Label>
              <Input
                id="stress_level"
                type="number"
                step="1"
                min="1"
                max="10"
                value={formData.stress_level}
                onChange={(e) => setFormData({ ...formData, stress_level: e.target.value })}
                placeholder="1-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hydration">Hydration (cups)</Label>
              <Input
                id="hydration"
                type="number"
                step="1"
                min="0"
                max="20"
                value={formData.hydration}
                onChange={(e) => setFormData({ ...formData, hydration: e.target.value })}
                placeholder="8"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Vitals"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VitalsInputDialog;
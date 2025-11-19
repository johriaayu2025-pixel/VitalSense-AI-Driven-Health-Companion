import { PageTransition } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pill, Plus, Trash2, Clock, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  reminder_enabled: boolean;
  notes: string | null;
}

const Medications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "Once daily",
    timing: "09:00",
    reminder_enabled: true,
    notes: "",
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedications(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("medications").insert({
        user_id: user.id,
        ...formData,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication added successfully",
      });

      setDialogOpen(false);
      setFormData({
        name: "",
        dosage: "",
        frequency: "Once daily",
        timing: "09:00",
        reminder_enabled: true,
        notes: "",
      });
      fetchMedications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication removed",
      });
      fetchMedications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const upcomingMeds = medications.filter(m => m.reminder_enabled);

  return (
    <PageTransition loading={loading}>
      <div className="space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h1>Medications</h1>
              <p className="text-muted-foreground mt-1">
                Manage your medication schedule
              </p>
            </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Medication Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 500mg"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timing">Time</Label>
                  <Input
                    id="timing"
                    type="time"
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special instructions..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder">Enable Reminders</Label>
                  <Switch
                    id="reminder"
                    checked={formData.reminder_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, reminder_enabled: checked })}
                  />
                </div>
                <Button type="submit" className="w-full">Add Medication</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMeds.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No medications scheduled</p>
            ) : (
              <div className="space-y-3">
                {upcomingMeds.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Pill className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">{med.name}</p>
                        <p className="text-sm text-muted-foreground">{med.dosage} - {med.timing}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{med.frequency}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Medications */}
        <Card>
          <CardHeader>
            <CardTitle>All Medications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading...</p>
            ) : medications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No medications added yet</p>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => (
                  <div key={med.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{med.name}</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <p><span className="text-muted-foreground">Dosage:</span> {med.dosage}</p>
                        <p><span className="text-muted-foreground">Frequency:</span> {med.frequency}</p>
                        <p><span className="text-muted-foreground">Timing:</span> {med.timing}</p>
                        <p><span className="text-muted-foreground">Reminder:</span> {med.reminder_enabled ? "On" : "Off"}</p>
                      </div>
                      {med.notes && (
                        <p className="mt-2 text-sm text-muted-foreground italic">{med.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(med.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </PageTransition>
  );
};

export default Medications;

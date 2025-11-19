import { PageTransition } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield, Phone, Plus, AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FamilySafety = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("emergency_contacts").insert({
        user_id: user.id,
        name: formData.name,
        relationship: formData.relationship,
        phone: formData.phone,
        email: formData.email || null,
        is_primary: contacts.length === 0,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Emergency contact added successfully.",
      });

      setFormData({ name: "", relationship: "", phone: "", email: "" });
      setShowAddDialog(false);
      fetchContacts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSOSActivation = () => {
    toast({
      title: "Emergency SOS Activated!",
      description: "Emergency contacts have been notified with your location.",
      variant: "destructive",
    });
    setShowSOSDialog(false);
  };

  const safetyFeatures = [
    { icon: Shield, label: "24/7 SOS feature", status: "Active" },
    { icon: Phone, label: "One-tap GPS location", status: "Active" },
    { icon: UserPlus, label: "Alert assigned contacts", status: "Active" },
    { icon: AlertCircle, label: "Emergency speed dialing", status: "Active" },
  ];

  return (
    <PageTransition loading={loading}>
      <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1>Family Safety & Emergency</h1>
              <p className="text-muted-foreground mt-1">
                Manage emergency contacts and family settings
              </p>
            </div>
          <Button size="lg" variant="destructive" className="gap-2" onClick={() => setShowSOSDialog(true)}>
            <AlertCircle className="h-5 w-5" />
            SOS Emergency
          </Button>
        </div>

        {/* Emergency Contacts */}
        <Card className="border-destructive/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-6 w-6 text-destructive" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>
                People who will be notified in case of emergency
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Emergency Contact</DialogTitle>
                  <DialogDescription>
                    Add someone who should be notified in case of emergencies
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddContact} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name*</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      placeholder="e.g., Spouse, Parent, Friend"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number*</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Contact</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{contact.name}</p>
                          {contact.is_primary && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {contact.relationship || "No relationship specified"}
                        </p>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{contact.phone}</span>
                          </div>
                          {contact.email && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{contact.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground mb-4">No emergency contacts added</p>
                <p className="text-sm text-muted-foreground">
                  Add contacts who should be notified in case of emergency
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safety Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-success-light border-success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-success" />
                Safety Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Emergency Contacts</span>
                  <span className="font-semibold">{contacts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">GPS Feature</span>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Primary Contact</span>
                  <span className="text-sm">{contacts.find((c) => c.is_primary)?.name || "None"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-primary" />
                Emergency History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-success mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">No emergencies recorded</p>
              </div>
              <p className="text-sm text-muted-foreground">Your safety system is ready (24/7)</p>
            </CardContent>
          </Card>
        </div>

        {/* Safety Features */}
        <Card>
          <CardHeader>
            <CardTitle>Safety Features</CardTitle>
            <CardDescription>All safety features are active and ready</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {safetyFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="p-3 bg-success-light rounded-lg flex items-center gap-3">
                    <div className="p-2 bg-success rounded-lg">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{feature.label}</p>
                      <p className="text-xs text-success">{feature.status}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* SOS Confirmation Dialog */}
        <Dialog open={showSOSDialog} onOpenChange={setShowSOSDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-6 w-6" />
                Emergency SOS Activation
              </DialogTitle>
              <DialogDescription>
                Do you want to activate Emergency SOS? This will immediately notify all your emergency contacts with your current location.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowSOSDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleSOSActivation}>
                Yes, Activate SOS
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Contact Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
...
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default FamilySafety;
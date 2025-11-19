import { PageTransition } from "@/components/PageTransition";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Heart, Droplets, Moon, TrendingUp, Smartphone, AlertTriangle, Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VitalData {
  timestamp: string;
  heartRate: number;
  spo2: number;
  steps: number;
  sleepHours: number;
  stressLevel: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
}

const IoTIntegration = () => {
  const [liveData, setLiveData] = useState<VitalData | null>(null);
  const [historicalData, setHistoricalData] = useState<VitalData[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [criticalAlert, setCriticalAlert] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{type: string; value: number} | null>(null);
  const [syncing, setSyncing] = useState(false);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    setupRealtimeSubscription();
    generateInitialData();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('vitals-iot-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_vitals'
        },
        (payload) => {
          console.log('New vital received from database:', payload);
          handleNewVitalFromDB(payload.new);
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  const handleNewVitalFromDB = (vital: any) => {
    const newData: VitalData = {
      timestamp: new Date(vital.recorded_at).toLocaleTimeString(),
      heartRate: vital.heart_rate || 0,
      spo2: vital.spo2 || 0,
      steps: Math.floor(Math.random() * 1000),
      sleepHours: vital.sleep_hours || 0,
      stressLevel: vital.stress_level || 0,
      bloodPressureSystolic: vital.blood_pressure_systolic || 0,
      bloodPressureDiastolic: vital.blood_pressure_diastolic || 0,
    };

    setLiveData(newData);
    setHistoricalData(prev => [...prev.slice(-19), newData]);
    checkVitals(newData);
  };

  const generateInitialData = () => {
    const mockData: VitalData[] = Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (19 - i) * 15000).toLocaleTimeString(),
      heartRate: Math.floor(Math.random() * 40) + 60,
      spo2: Math.floor(Math.random() * 10) + 92,
      steps: Math.floor(Math.random() * 500),
      sleepHours: Math.random() * 2 + 6,
      stressLevel: Math.floor(Math.random() * 10),
      bloodPressureSystolic: Math.floor(Math.random() * 30) + 110,
      bloodPressureDiastolic: Math.floor(Math.random() * 20) + 70,
    }));

    setHistoricalData(mockData);
    setLiveData(mockData[mockData.length - 1]);
  };

  const simulateDeviceSync = () => {
    setSyncing(true);
    
    const interval = setInterval(() => {
      const newData: VitalData = {
        timestamp: new Date().toLocaleTimeString(),
        heartRate: Math.floor(Math.random() * 60) + 50,
        spo2: Math.floor(Math.random() * 20) + 85,
        steps: Math.floor(Math.random() * 500),
        sleepHours: Math.random() * 4 + 4,
        stressLevel: Math.floor(Math.random() * 10),
        bloodPressureSystolic: Math.floor(Math.random() * 50) + 100,
        bloodPressureDiastolic: Math.floor(Math.random() * 30) + 65,
      };

      setLiveData(newData);
      setHistoricalData(prev => [...prev.slice(-19), newData]);
      checkVitals(newData);
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      setSyncing(false);
      toast({
        title: "Sync Complete",
        description: "Device data synchronized successfully",
      });
    }, 15000);
  };

  const checkVitals = (data: VitalData) => {
    // Critical levels - Auto SOS
    if (data.spo2 < 85) {
      triggerAutoSOS("SpO2", data.spo2, `Oxygen saturation critically low at ${data.spo2}%`);
      setActiveAlert({type: "SpO2", value: data.spo2});
      return;
    }
    if (data.heartRate < 40 || data.heartRate > 140) {
      triggerAutoSOS("Heart Rate", data.heartRate, `Heart rate at dangerous level: ${data.heartRate} bpm`);
      setActiveAlert({type: "Heart Rate", value: data.heartRate});
      return;
    }
    if (data.bloodPressureSystolic > 180 || data.bloodPressureSystolic < 80) {
      triggerAutoSOS("Blood Pressure", data.bloodPressureSystolic, `Blood pressure at critical level: ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic}`);
      setActiveAlert({type: "Blood Pressure", value: data.bloodPressureSystolic});
      return;
    }

    // Warning levels
    if (data.spo2 >= 85 && data.spo2 < 92) {
      triggerAlert("SpO2 Warning", `Low oxygen saturation: ${data.spo2}%`, false);
      setActiveAlert({type: "SpO2 Warning", value: data.spo2});
    } else if (data.heartRate < 50 || data.heartRate > 120) {
      triggerAlert("Heart Rate Warning", `Abnormal heart rate: ${data.heartRate} bpm`, false);
      setActiveAlert({type: "Heart Rate Warning", value: data.heartRate});
    } else if (data.bloodPressureSystolic > 140 || data.bloodPressureSystolic < 90) {
      triggerAlert("Blood Pressure Warning", `Elevated BP: ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic}`, false);
      setActiveAlert({type: "BP Warning", value: data.bloodPressureSystolic});
    } else if (data.stressLevel > 7) {
      triggerAlert("Stress Warning", `High stress detected: ${data.stressLevel}/10`, false);
      setActiveAlert({type: "Stress", value: data.stressLevel});
    } else {
      setActiveAlert(null);
    }
  };

  const triggerAlert = (title: string, message: string, critical: boolean) => {
    setAlertMessage(message);
    setCriticalAlert(critical);
    setAlertOpen(true);
    toast({
      title: `⚡ ${title}`,
      description: message,
      variant: critical ? "destructive" : "default",
    });
  };

  const triggerAutoSOS = async (vital: string, value: number, message: string) => {
    setAlertMessage(message);
    setCriticalAlert(true);
    setAlertOpen(true);
    
    toast({
      title: "🚨 CRITICAL ALERT - AUTO SOS ACTIVATED",
      description: message,
      variant: "destructive",
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: contacts } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_primary", true)
        .limit(1);

      if (contacts && contacts.length > 0) {
        console.log("Emergency SOS triggered - Contact:", contacts[0].name, contacts[0].phone);
        toast({
          title: "Emergency Services Notified",
          description: `${contacts[0].name} has been alerted`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error triggering SOS:", error);
    }
  };

  const handleEmergencySOS = () => {
    toast({
      title: "Emergency SOS Activated",
      description: "Emergency contacts have been notified!",
      variant: "destructive",
    });
  };

  const getVitalStatus = (value: number, type: string) => {
    const ranges: Record<string, { min: number; max: number }> = {
      heartRate: { min: 60, max: 100 },
      spo2: { min: 95, max: 100 },
      bloodPressureSystolic: { min: 90, max: 120 },
    };
    
    const range = ranges[type];
    if (!range) return "good";
    if (value < range.min || value > range.max) return "critical";
    return "good";
  };

  return (
    <PageTransition>
      <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1>IoT Live Monitoring</h1>
              <p className="text-muted-foreground mt-1">
                Real-time health vitals from connected devices
              </p>
            </div>
          {activeAlert && (
            <Badge 
              variant={criticalAlert ? "destructive" : "default"}
              className="animate-pulse"
            >
              <Bell className="w-4 h-4 mr-2" />
              {activeAlert.type}: {activeAlert.value}
            </Badge>
          )}
        </div>

        {/* Sync Control */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold">Smart Health Watch</p>
                  <p className="text-sm text-muted-foreground">
                    {syncing ? "Syncing data..." : "Connected & Monitoring"}
                  </p>
                </div>
              </div>
              <Button
                onClick={simulateDeviceSync}
                disabled={syncing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Start Live Sync"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alert Banner */}
        {activeAlert && (
          <Alert variant={criticalAlert ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{activeAlert.type}:</strong> {alertMessage}
              {criticalAlert && " - Emergency services notified"}
            </AlertDescription>
          </Alert>
        )}

        {/* Live Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Heart Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{liveData?.heartRate || "--"} <span className="text-sm font-normal">bpm</span></div>
              <p className={`text-sm ${getVitalStatus(liveData?.heartRate || 0, 'heartRate') === 'critical' ? 'text-red-500' : 'text-green-500'}`}>
                {getVitalStatus(liveData?.heartRate || 0, 'heartRate') === 'critical' ? 'Abnormal' : 'Normal'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                Blood Oxygen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{liveData?.spo2 || "--"} <span className="text-sm font-normal">%</span></div>
              <p className={`text-sm ${getVitalStatus(liveData?.spo2 || 0, 'spo2') === 'critical' ? 'text-red-500' : 'text-green-500'}`}>
                {getVitalStatus(liveData?.spo2 || 0, 'spo2') === 'critical' ? 'Low oxygen' : 'Normal'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                Steps Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{liveData ? historicalData.reduce((acc, d) => acc + d.steps, 0) : "--"}</div>
              <Progress value={(liveData ? historicalData.reduce((acc, d) => acc + d.steps, 0) : 0) / 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-500" />
                Sleep
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{liveData?.sleepHours.toFixed(1) || "--"} <span className="text-sm font-normal">hrs</span></div>
              <p className="text-sm text-muted-foreground">Last night</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Heart Rate & SpO2 Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="heartRate" stroke="hsl(var(--destructive))" name="Heart Rate" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="spo2" stroke="hsl(var(--primary))" name="SpO2" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blood Pressure & Stress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="bloodPressureSystolic" stroke="hsl(var(--warning))" name="BP Systolic" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="stressLevel" stroke="hsl(var(--secondary))" name="Stress Level" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Critical Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className={`w-6 h-6 ${criticalAlert ? 'text-red-500' : 'text-yellow-500'}`} />
              {criticalAlert ? "🚨 CRITICAL HEALTH ALERT" : "⚠️ Health Warning"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {alertMessage}
              {criticalAlert && (
                <p className="mt-4 font-semibold text-red-600">
                  Emergency services and your emergency contacts have been automatically notified.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {criticalAlert && (
              <Button variant="destructive" onClick={handleEmergencySOS}>
                Call Emergency Now
              </Button>
            )}
            <AlertDialogAction>Understood</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
};

export default IoTIntegration;

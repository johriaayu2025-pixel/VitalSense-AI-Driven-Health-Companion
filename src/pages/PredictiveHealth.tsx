import { PageTransition } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity, Brain, Heart, Droplets, AlertCircle } from "lucide-react";

const PredictiveHealth = () => {
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVitalsHistory();
  }, []);

  const fetchVitalsHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("health_vitals")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: true })
        .limit(30);

      if (error) throw error;
      setVitalsHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = vitalsHistory.map((vital, index) => ({
    name: new Date(vital.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    heartRate: vital.heart_rate || 0,
    spo2: vital.spo2 || 0,
    stress: vital.stress_level || 0,
    sleep: vital.sleep_hours || 0,
  }));

  const predictions = [
    {
      type: "High",
      title: "Heart Rate and elevated stress levels",
      description:
        "Your heart rate has been slightly elevated. We recommend professional consultation for cardiovascular issues of this scale.",
      icon: Heart,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      type: "High",
      title: "Sleep time affected stress",
      description:
        "Your average sleep time of 5-7 hrs is linked with increased stress and blood glucose fluctuations",
      icon: Brain,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      type: "Medium",
      title: "Hydration patterns make slow bad for circulation and energy balance",
      description: "Staying hydrated is a sustainable task which helps tremendously with better focusing ability.",
      icon: Droplets,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  // Calculate dynamic trends from actual data
  const getLatestValue = (data: any[], key: string) => {
    return data.length > 0 ? data[data.length - 1][key] : null;
  };

  const getTrend = (data: any[], key: string): "up" | "down" | "stable" => {
    if (data.length < 2) return "stable";
    const recent = data.slice(-5);
    const avg1 = recent.slice(0, 2).reduce((sum, v) => sum + (v[key] || 0), 0) / 2;
    const avg2 = recent.slice(-2).reduce((sum, v) => sum + (v[key] || 0), 0) / 2;
    if (avg2 > avg1 * 1.05) return "up";
    if (avg2 < avg1 * 0.95) return "down";
    return "stable";
  };

  const latestVital = vitalsHistory[vitalsHistory.length - 1];

  const keyTrends = [
    { 
      label: "Heart Rate", 
      value: latestVital?.heart_rate ? `${latestVital.heart_rate} bpm` : "No data",
      trend: getTrend(vitalsHistory, "heart_rate"),
      icon: Heart 
    },
    { 
      label: "Stress", 
      value: latestVital?.stress_level ? `Level ${latestVital.stress_level}` : "No data",
      trend: getTrend(vitalsHistory, "stress_level"),
      icon: Brain 
    },
    { 
      label: "Hydration", 
      value: latestVital?.hydration ? `${latestVital.hydration} glasses` : "No data",
      trend: getTrend(vitalsHistory, "hydration"),
      icon: Droplets 
    },
    { 
      label: "Sleep", 
      value: latestVital?.sleep_hours ? `${latestVital.sleep_hours} hrs` : "No data",
      trend: getTrend(vitalsHistory, "sleep_hours"),
      icon: Activity 
    },
  ];

  return (
    <PageTransition loading={loading}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1>Predictive Health & Trends</h1>
              <p className="text-muted-foreground mt-1">
                Track your health metrics over time with real-time updates and AI predictions
              </p>
            </div>
          <Button className="gap-2" onClick={() => {
            if (vitalsHistory.length === 0) {
              alert("No data available. Please add vitals first.");
              return;
            }
            window.print();
          }}>
            <TrendingUp className="h-5 w-5" />
            Generate Report
          </Button>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trends">All Metrics</TabsTrigger>
            <TabsTrigger value="vitals">Vitals Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            {/* Key Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {keyTrends.map((trend, index) => {
                const Icon = trend.icon;
                return (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <TrendingUp
                          className={`h-4 w-4 ${
                            trend.trend === "up"
                              ? "text-success"
                              : trend.trend === "down"
                              ? "text-destructive"
                              : "text-warning"
                          }`}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{trend.label}</p>
                      <p className="text-xl font-bold mt-1">{trend.value}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Heart Rate Trend
                </CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--destructive))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Stress & Energy Levels
                </CardTitle>
                <CardDescription>Daily tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="stress"
                      stroke="hsl(var(--warning))"
                      strokeWidth={2}
                      name="Stress"
                    />
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Sleep"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals">
            <Card>
              <CardHeader>
                <CardTitle>Vitals History</CardTitle>
                <CardDescription>All recorded health measurements</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading...</p>
                ) : vitalsHistory.length > 0 ? (
                  <div className="space-y-3">
                    {vitalsHistory.slice(0, 10).map((vital) => (
                      <div key={vital.id} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">
                            {new Date(vital.recorded_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {vital.heart_rate && <div>HR: {vital.heart_rate} bpm</div>}
                          {vital.spo2 && <div>SpO2: {vital.spo2}%</div>}
                          {vital.blood_pressure_systolic && (
                            <div>
                              BP: {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                            </div>
                          )}
                          {vital.temperature && <div>Temp: {vital.temperature}°F</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No vitals recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fitness">
            <Card>
              <CardHeader>
                <CardTitle>Fitness Entries</CardTitle>
                <CardDescription>Exercise and activity logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No fitness entries yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </PageTransition>
  );
};

export default PredictiveHealth;
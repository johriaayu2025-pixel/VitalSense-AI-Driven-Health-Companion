import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Weight,
  Moon,
  Brain,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Loader2,
} from "lucide-react";
import VitalsInputDialog from "@/components/VitalsInputDialog";
import { PageTransition } from "@/components/PageTransition";

interface VitalCard {
  icon: any;
  label: string;
  value: string;
  unit: string;
  color: string;
  bgColor: string;
  status?: "good" | "warning" | "critical";
}

const Dashboard = () => {
  const [latestVitals, setLatestVitals] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVitalsDialog, setShowVitalsDialog] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzingVitals, setAnalyzingVitals] = useState(false);
  const { toast } = useToast();

  const fetchLatestVitals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("health_vitals")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setLatestVitals(data);
    } catch (error) {
      console.error("Error fetching vitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeVitals = async () => {
    if (!latestVitals) {
      toast({
        title: "No vitals data",
        description: "Please add your vitals first to get AI analysis",
        variant: "destructive",
      });
      return;
    }

    setAnalyzingVitals(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-vitals", {
        body: { vitals: latestVitals },
      });

      if (error) throw error;
      setAiAnalysis(data.analysis);
      toast({
        title: "Analysis complete",
        description: "AI health analysis generated successfully",
      });
    } catch (error) {
      console.error("Error analyzing vitals:", error);
      toast({
        title: "Analysis failed",
        description: "Could not generate AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingVitals(false);
    }
  };

  useEffect(() => {
    fetchLatestVitals();
  }, []);

  useEffect(() => {
    if (latestVitals && !aiAnalysis) {
      analyzeVitals();
    }
  }, [latestVitals]);

  const getVitalStatus = (type: string, value: number | null): "good" | "warning" | "critical" => {
    if (!value) return "good";

    switch (type) {
      case "heart_rate":
        if (value < 60 || value > 100) return "critical";
        if (value < 70 || value > 90) return "warning";
        return "good";
      case "spo2":
        if (value < 90) return "critical";
        if (value < 95) return "warning";
        return "good";
      case "bp_systolic":
        if (value < 90 || value > 140) return "critical";
        if (value < 100 || value > 130) return "warning";
        return "good";
      default:
        return "good";
    }
  };

  // Calculate dynamic health score based on vitals
  const calculateHealthScore = () => {
    if (!latestVitals) return 0;
    
    let score = 100;
    const vitals = latestVitals;
    
    // Heart rate (60-100 normal)
    if (vitals.heart_rate) {
      if (vitals.heart_rate < 60 || vitals.heart_rate > 100) score -= 15;
      else if (vitals.heart_rate < 70 || vitals.heart_rate > 90) score -= 5;
    }
    
    // SpO2 (95-100 normal)
    if (vitals.spo2) {
      if (vitals.spo2 < 90) score -= 20;
      else if (vitals.spo2 < 95) score -= 10;
    }
    
    // Blood pressure
    if (vitals.blood_pressure_systolic) {
      if (vitals.blood_pressure_systolic < 90 || vitals.blood_pressure_systolic > 140) score -= 15;
      else if (vitals.blood_pressure_systolic < 100 || vitals.blood_pressure_systolic > 130) score -= 5;
    }
    
    // Sleep (7-9 hours normal)
    if (vitals.sleep_hours) {
      if (vitals.sleep_hours < 5 || vitals.sleep_hours > 10) score -= 10;
      else if (vitals.sleep_hours < 7 || vitals.sleep_hours > 9) score -= 5;
    }
    
    // Hydration (8+ glasses normal)
    if (vitals.hydration) {
      if (vitals.hydration < 4) score -= 10;
      else if (vitals.hydration < 8) score -= 5;
    }
    
    // Stress level (0-3 low, 4-6 medium, 7-10 high)
    if (vitals.stress_level) {
      if (vitals.stress_level > 7) score -= 15;
      else if (vitals.stress_level > 5) score -= 8;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();

  const vitalCards: VitalCard[] = [
    {
      icon: Heart,
      label: "Heart Rate",
      value: latestVitals?.heart_rate?.toString() || "--",
      unit: "bpm",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      status: getVitalStatus("heart_rate", latestVitals?.heart_rate),
    },
    {
      icon: Activity,
      label: "SpO2",
      value: latestVitals?.spo2?.toString() || "--",
      unit: "%",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      status: getVitalStatus("spo2", latestVitals?.spo2),
    },
    {
      icon: Activity,
      label: "Blood Pressure",
      value: latestVitals?.blood_pressure_systolic 
        ? `${latestVitals.blood_pressure_systolic}/${latestVitals.blood_pressure_diastolic}`
        : "--",
      unit: "mmHg",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      status: getVitalStatus("bp_systolic", latestVitals?.blood_pressure_systolic),
    },
    {
      icon: Droplets,
      label: "Blood Glucose",
      value: latestVitals?.blood_glucose?.toString() || "--",
      unit: "mg/dL",
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      icon: Thermometer,
      label: "Temperature",
      value: latestVitals?.temperature?.toString() || "--",
      unit: "°F",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      icon: Droplets,
      label: "Hydration",
      value: latestVitals?.hydration?.toString() || "--",
      unit: "glasses",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
    {
      icon: Weight,
      label: "Weight",
      value: latestVitals?.weight?.toString() || "--",
      unit: "kg",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Moon,
      label: "Sleep",
      value: latestVitals?.sleep_hours?.toString() || "--",
      unit: "hrs",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      icon: Brain,
      label: "Stress Level",
      value: latestVitals?.stress_level?.toString() || "--",
      unit: "/10",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <PageTransition loading={loading}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1>Welcome back!</h1>
            <p className="text-muted-foreground mt-1">
              Here's your comprehensive health overview for today
            </p>
          </div>
          <Button 
            onClick={() => setShowVitalsDialog(true)}
            size="lg" 
            className="gap-2 shadow-md hover:shadow-lg smooth-transition w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
            Add Vitals
          </Button>
        </div>

        {/* Health Summary Banner */}
        <Card 
          className="bg-gradient-to-br from-primary via-secondary to-accent text-white overflow-hidden relative shadow-xl border-0"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-xl md:text-2xl text-white font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Today's Health Score
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative pb-5">
            <div className="space-y-0.5">
              <div className="text-2xl md:text-3xl font-bold drop-shadow-sm">
                {latestVitals?.spo2 || "--"}
              </div>
              <div className="text-white/90 text-xs font-medium">SpO2 Level</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl md:text-3xl font-bold drop-shadow-sm">
                {latestVitals?.heart_rate || "--"}
              </div>
              <div className="text-white/90 text-xs font-medium">Heart Rate</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl md:text-3xl font-bold drop-shadow-sm">{healthScore}%</div>
              <div className="text-white/90 text-xs font-medium">Overall Health</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl md:text-3xl font-bold drop-shadow-sm">
                {latestVitals?.sleep_hours || "--"}
              </div>
              <div className="text-white/90 text-xs font-medium">Sleep Hours</div>
            </div>
          </CardContent>
        </Card>

          {/* Vitals Grid */}
          <div>
            <h2 className="mb-3">Track Your Vitals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {vitalCards.map((card, index) => {
                const Icon = card.icon;
                const StatusIcon = card.status === "good" ? TrendingUp : 
                                  card.status === "warning" ? Minus : TrendingDown;
                const statusColor = card.status === "good" ? "text-success" : 
                                   card.status === "warning" ? "text-warning" : "text-destructive";
                
                return (
                  <Card 
                    key={index}
                    className="card-shadow hover:shadow-lg smooth-transition group border-l-4"
                    style={{ borderLeftColor: `hsl(var(--${card.status === "good" ? "success" : card.status === "warning" ? "warning" : "destructive"}))` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${card.bgColor} group-hover:scale-110 smooth-transition`}>
                          <Icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        {card.status && (
                          <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">{card.value}</span>
                          <span className="text-xs text-muted-foreground">{card.unit}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>


          {/* AI Health Recommendations */}
          <div>
            <h2 className="mb-3">AI Health Recommendations</h2>
            {!latestVitals ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">Add your vitals to get personalized AI recommendations</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {latestVitals.heart_rate && latestVitals.heart_rate >= 60 && latestVitals.heart_rate <= 100 && latestVitals.spo2 && latestVitals.spo2 >= 95 && (
                  <Card className="border-l-4 border-l-success bg-success/5">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-success/20">
                          <Heart className="h-5 w-5 text-success" />
                        </div>
                        <h3 className="font-semibold">Cardiovascular Health</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ✅ Heart rate and SpO2 in optimal range - keep up your routine
                      </p>
                    </CardContent>
                  </Card>
                )}

                {latestVitals.heart_rate && (latestVitals.heart_rate < 60 || latestVitals.heart_rate > 100) && (
                  <Card className="border-l-4 border-l-destructive bg-destructive/5">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-destructive/20">
                          <Heart className="h-5 w-5 text-destructive" />
                        </div>
                        <h3 className="font-semibold">Heart Rate Alert</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ⚠️ Heart rate outside normal range - consider consulting a doctor
                      </p>
                    </CardContent>
                  </Card>
                )}

                {latestVitals.hydration && latestVitals.hydration >= 8 && (
                  <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Droplets className="h-5 w-5 text-blue-500" />
                        </div>
                        <h3 className="font-semibold">Hydration Goals</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        💧 Great hydration! Keep drinking water throughout the day
                      </p>
                    </CardContent>
                  </Card>
                )}

                {latestVitals.hydration && latestVitals.hydration < 8 && (
                  <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Droplets className="h-5 w-5 text-blue-500" />
                        </div>
                        <h3 className="font-semibold">Hydration Alert</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        💧 Increase water intake to 8+ glasses daily for better health
                      </p>
                    </CardContent>
                  </Card>
                )}

                {latestVitals.sleep_hours && latestVitals.sleep_hours >= 7 && latestVitals.sleep_hours <= 9 && (
                  <Card className="border-l-4 border-l-purple-500 bg-purple-50/50">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Moon className="h-5 w-5 text-purple-500" />
                        </div>
                        <h3 className="font-semibold">Sleep Quality</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        😴 Good sleep duration - maintain this sleep schedule
                      </p>
                    </CardContent>
                  </Card>
                )}

                {latestVitals.sleep_hours && latestVitals.sleep_hours < 7 && (
                  <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-amber-100">
                          <Moon className="h-5 w-5 text-amber-500" />
                        </div>
                        <h3 className="font-semibold">Sleep Alert</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        😴 Aim for 7-9 hours of sleep for optimal recovery
                      </p>
                    </CardContent>
                  </Card>
                )}

                {latestVitals.stress_level && latestVitals.stress_level <= 5 && (
                  <Card className="border-l-4 border-l-green-500 bg-green-50/50">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-100">
                          <Brain className="h-5 w-5 text-green-500" />
                        </div>
                        <h3 className="font-semibold">Stress Management</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        🧘 Stress levels are low - great job managing stress
                      </p>
                    </CardContent>
                  </Card>
                )}

                {latestVitals.stress_level && latestVitals.stress_level > 6 && (
                  <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-amber-100">
                          <Brain className="h-5 w-5 text-amber-500" />
                        </div>
                        <h3 className="font-semibold">Stress Alert</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        🧘 High stress detected - try meditation or breathing exercises
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* AI Analysis Section */}
          <Card className="card-shadow bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Health Analysis
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Comprehensive AI-powered insights about your vitals
                  </CardDescription>
                </div>
                <Button 
                  onClick={analyzeVitals} 
                  disabled={analyzingVitals}
                  className="gap-2 w-full sm:w-auto"
                >
                  {analyzingVitals ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {aiAnalysis && (
              <CardContent>
                <div className="space-y-2 text-sm leading-relaxed">
                  {aiAnalysis.split('\n').filter(line => line.trim()).map((line, idx) => (
                    <p key={idx} className="text-sm">{line}</p>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <VitalsInputDialog 
          open={showVitalsDialog} 
          onOpenChange={setShowVitalsDialog} 
          onSuccess={() => {
            fetchLatestVitals();
            setAiAnalysis(null);
          }}
        />
      </PageTransition>
  );
};

export default Dashboard;

import { PageTransition } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, PieChart, Plus, TrendingUp, Star, Edit } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EnhancedMealDialog from "@/components/EnhancedMealDialog";
import DietPlanGenerator from "@/components/DietPlanGenerator";
import NutritionChatbot from "@/components/NutritionChatbot";
import WeeklyNutritionChart from "@/components/WeeklyNutritionChart";
import DietDayEditor from "@/components/DietDayEditor";
import DietPlanChatbot from "@/components/DietPlanChatbot";

const Nutrition = () => {
  const [activeTab, setActiveTab] = useState("log");
  const [meals, setMeals] = useState<any[]>([]);
  const [showMealDialog, setShowMealDialog] = useState(false);
  const [showDietGenerator, setShowDietGenerator] = useState(false);
  const [currentDietPlan, setCurrentDietPlan] = useState<any>(null);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [showDayEditor, setShowDayEditor] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchMeals();
    fetchDietPlan();
  }, []);

  const fetchMeals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("consumed_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .order("consumed_at", { ascending: false});

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
    }
  };

  const fetchDietPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setCurrentDietPlan(data?.plan_data || null);
      setUserPreferences(data?.user_preferences || null);
    } catch (error) {
      console.error("Error fetching diet plan:", error);
    }
  };

  const handleEditDay = (day: string) => {
    setSelectedDay(day);
    setShowDayEditor(true);
  };

  const handleSaveFavoriteMeal = async (meal: any, day: string, mealType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("favorite_meals").insert({
        user_id: user.id,
        name: meal.meal,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        meal_type: mealType,
        portion_description: meal.ingredients?.join(", ")
      });

      if (error) throw error;

      toast({
        title: "Saved to favorites!",
        description: `${meal.meal} added to your favorites`
      });
    } catch (error: any) {
      console.error("Error saving favorite:", error);
      toast({
        title: "Error",
        description: "Failed to save favorite",
        variant: "destructive"
      });
    }
  };

  const todayMeals = meals;

  const dailyTarget = {
    calories: currentDietPlan?.dailyTargets?.calories || 2000,
    protein: currentDietPlan?.dailyTargets?.protein || 150,
    carbs: currentDietPlan?.dailyTargets?.carbs || 250,
    fat: currentDietPlan?.dailyTargets?.fat || 65,
  };

  const consumed = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <PageTransition>
      <div>
        <div>
            <h1>NutriSnap & Diet Planner</h1>
            <p className="text-muted-foreground mt-1">
              Track your nutrition and get personalized diet plans
            </p>
          </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5 mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="log" className="gap-2">
              <Utensils className="h-4 w-4" />
              Log Meal
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-2">
              <PieChart className="h-4 w-4" />
              Diet Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-5">
            <Card className="card-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg md:text-xl">Today's Nutrition</CardTitle>
                    <CardDescription className="mt-1">Track your daily macros and calories</CardDescription>
                  </div>
                  <Button onClick={() => setShowMealDialog(true)} className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Log Meal
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Calories</span>
                      <span className="font-semibold">{consumed.calories} / {dailyTarget.calories}</span>
                    </div>
                    <Progress value={(consumed.calories / dailyTarget.calories) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Protein</span>
                      <span className="font-semibold">{consumed.protein}g / {dailyTarget.protein}g</span>
                    </div>
                    <Progress value={(consumed.protein / dailyTarget.protein) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Carbs</span>
                      <span className="font-semibold">{consumed.carbs}g / {dailyTarget.carbs}g</span>
                    </div>
                    <Progress value={(consumed.carbs / dailyTarget.carbs) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Fat</span>
                      <span className="font-semibold">{consumed.fat}g / {dailyTarget.fat}g</span>
                    </div>
                    <Progress value={(consumed.fat / dailyTarget.fat) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Today's Meals</CardTitle>
                <CardDescription>Your logged meals for today</CardDescription>
              </CardHeader>
              <CardContent>
                {todayMeals.length > 0 ? (
                  <div className="space-y-3">
                    {todayMeals.map((meal) => (
                      <div key={meal.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 smooth-transition">
                        {meal.photo_url && (
                          <img
                            src={meal.photo_url}
                            alt={meal.name}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <div className="min-w-0">
                              <h4 className="font-medium text-sm truncate">{meal.name}</h4>
                              <p className="text-xs text-muted-foreground capitalize">{meal.meal_type}</p>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0">
                              <p className="font-semibold text-sm">{meal.calories} cal</p>
                              <p className="text-xs text-muted-foreground">
                                P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Utensils className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No meals logged yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plan" className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              <Card className="card-shadow bg-gradient-to-br from-secondary/20 to-secondary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <PieChart className="h-5 w-5 text-secondary" />
                    AI Diet Plan Generator
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Generate a personalized 7-day diet plan based on your health profile, preferences, and goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full gap-2 shadow-md hover:shadow-lg smooth-transition" onClick={() => setShowDietGenerator(true)}>
                    <TrendingUp className="h-5 w-5" />
                    Generate Your Diet Plan
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg md:text-xl">Your Current Plan</CardTitle>
                  <CardDescription className="mt-1">
                    {currentDietPlan ? "Active diet plan" : "No active diet plan"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentDietPlan ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Daily Calories:</span>
                        <span className="font-semibold">{currentDietPlan.dailyTargets?.calories || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Protein:</span>
                        <span className="font-semibold">{currentDietPlan.dailyTargets?.protein || "N/A"}g</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Carbs:</span>
                        <span className="font-semibold">{currentDietPlan.dailyTargets?.carbs || "N/A"}g</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fat:</span>
                        <span className="font-semibold">{currentDietPlan.dailyTargets?.fat || "N/A"}g</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <PieChart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Generate your first diet plan to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <WeeklyNutritionChart />

            {currentDietPlan?.weekPlan && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Your 7-Day Meal Plan</h3>
                {Object.keys(currentDietPlan.weekPlan).map((day) => (
                  <Card key={day} className="card-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{day}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDay(day)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Day
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {["breakfast", "lunch", "dinner", "snack1", "snack2"].map((mealType) => {
                        const meal = currentDietPlan.weekPlan[day][mealType];
                        if (!meal) return null;
                        
                        return (
                          <div key={mealType} className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm capitalize mb-1">
                                  {mealType.replace(/(\d+)/, " $1")}
                                </h4>
                                <p className="text-sm">{meal.meal}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveFavoriteMeal(meal, day, mealType)}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>{meal.calories} cal</span>
                              <span>P: {meal.protein}g</span>
                              <span>C: {meal.carbs}g</span>
                              <span>F: {meal.fat}g</span>
                            </div>
                            {meal.ingredients && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {meal.ingredients.slice(0, 3).join(", ")}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {currentDietPlan?.tips && (
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Personalized Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentDietPlan.tips.map((tip: string, idx: number) => (
                      <li key={idx} className="text-sm flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <NutritionChatbot />
          </TabsContent>
        </Tabs>

        <EnhancedMealDialog 
          open={showMealDialog} 
          onOpenChange={setShowMealDialog} 
          onSuccess={fetchMeals} 
        />

        <DietPlanGenerator
          open={showDietGenerator}
          onOpenChange={setShowDietGenerator}
          onPlanGenerated={(plan) => {
            setCurrentDietPlan(plan);
            fetchDietPlan();
          }}
        />

        {showDayEditor && selectedDay && currentDietPlan?.weekPlan?.[selectedDay] && (
          <DietDayEditor
            open={showDayEditor}
            onOpenChange={setShowDayEditor}
            day={selectedDay}
            currentDayPlan={currentDietPlan.weekPlan[selectedDay]}
            userPreferences={userPreferences}
            onDayRegenerated={fetchDietPlan}
          />
        )}

        <DietPlanChatbot />
      </div>
      </PageTransition>
  );
};

export default Nutrition;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const WeeklyNutritionChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("consumed_at", sevenDaysAgo.toISOString())
        .order("consumed_at", { ascending: true });

      if (error) throw error;

      // Group by day
      const groupedData: any = {};
      (data || []).forEach((meal) => {
        const date = new Date(meal.consumed_at).toLocaleDateString('en-US', { weekday: 'short' });
        if (!groupedData[date]) {
          groupedData[date] = { day: date, calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        groupedData[date].calories += meal.calories || 0;
        groupedData[date].protein += meal.protein || 0;
        groupedData[date].carbs += meal.carbs || 0;
        groupedData[date].fat += meal.fat || 0;
      });

      setChartData(Object.values(groupedData));
    } catch (error) {
      console.error("Error fetching weekly data:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Nutrition Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="calories" fill="hsl(var(--primary))" name="Calories" />
            <Bar dataKey="protein" fill="hsl(var(--secondary))" name="Protein (g)" />
            <Bar dataKey="carbs" fill="hsl(var(--accent))" name="Carbs (g)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default WeeklyNutritionChart;

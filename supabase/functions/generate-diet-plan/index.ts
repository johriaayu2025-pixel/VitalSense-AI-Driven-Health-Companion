import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are a professional nutritionist creating a personalized 7-day diet plan.

USER PROFILE:
${JSON.stringify(preferences, null, 2)}

REQUIREMENTS:
1. Calculate precise daily calorie target based on:
   - Age, gender, weight, height
   - Activity level (sedentary/light/moderate/active/very active)
   - Goal (weight loss: -500 cal deficit, weight gain: +500 cal surplus, maintenance: TDEE)

2. Macro distribution:
   - Weight loss: High protein (30%), moderate carbs (35%), moderate fat (35%)
   - Weight gain: High protein (25%), high carbs (50%), moderate fat (25%)
   - Maintenance: Balanced (25% protein, 45% carbs, 30% fat)

3. Create a 7-day meal plan with:
   - Breakfast, Lunch, Dinner, 2 Snacks per day
   - Each meal includes: name, calories, protein (g), carbs (g), fat (g), ingredients
   - Variety across the week (no repeated exact meals)
   - Consider dietary restrictions and preferences
   - Consider budget constraints
   - Include both Indian and international options if no preference specified
   - Easy-to-prepare meals

4. Include:
   - Daily calorie and macro targets
   - 5 personalized nutrition tips based on the user's goals
   - Shopping list for the week

Format as JSON:
{
  "weekPlan": {
    "Monday": {
      "breakfast": { "meal": "...", "ingredients": ["..."], "calories": 400, "protein": 25, "carbs": 45, "fat": 12 },
      "lunch": { "meal": "...", "ingredients": ["..."], "calories": 500, "protein": 35, "carbs": 50, "fat": 18 },
      "dinner": { "meal": "...", "ingredients": ["..."], "calories": 450, "protein": 30, "carbs": 40, "fat": 15 },
      "snack1": { "meal": "...", "ingredients": ["..."], "calories": 150, "protein": 10, "carbs": 15, "fat": 5 },
      "snack2": { "meal": "...", "ingredients": ["..."], "calories": 150, "protein": 8, "carbs": 18, "fat": 4 }
    },
    ... (all 7 days)
  },
  "dailyTargets": { "calories": 2000, "protein": 150, "carbs": 200, "fat": 65 },
  "tips": ["Personalized tip 1", "Personalized tip 2", "Personalized tip 3", "Personalized tip 4", "Personalized tip 5"],
  "shoppingList": ["ingredient1", "ingredient2", ...]
}

Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. Generate personalized, balanced diet plans in valid JSON format only. No markdown, no explanation, just valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let dietPlan = data.choices?.[0]?.message?.content;

    console.log("Raw AI response:", dietPlan);

    // Clean up markdown code blocks if present
    dietPlan = dietPlan.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Try to parse, if it fails, ask AI to fix it
    let parsedPlan;
    try {
      parsedPlan = JSON.parse(dietPlan);
    } catch (parseError) {
      console.error("JSON parse error, attempting to extract valid JSON:", parseError);
      
      // Try to extract JSON from the response
      const jsonMatch = dietPlan.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedPlan = JSON.parse(jsonMatch[0]);
        } catch (secondError) {
          console.error("Second parse attempt failed:", secondError);
          throw new Error("AI returned invalid JSON format");
        }
      } else {
        throw new Error("No valid JSON found in AI response");
      }
    }

    return new Response(
      JSON.stringify({ plan: parsedPlan }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-diet-plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are a nutrition database expert. Search for foods matching: "${query}"

Return 5-8 relevant food items with accurate nutritional information. Include both Indian and international foods.

Format as JSON array:
[
  {
    "name": "Food name",
    "portion": "Standard serving size (e.g., '1 cup', '100g', '1 medium', '2 pieces')",
    "calories": 250,
    "protein": 15,
    "carbs": 30,
    "fat": 8
  }
]

Include common variations and popular dishes. Return ONLY valid JSON array.`;

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
            content: "You are a comprehensive nutrition database. Provide accurate, searchable food data in JSON format.",
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
    let foodsText = data.choices?.[0]?.message?.content;

    // Clean up markdown if present
    foodsText = foodsText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const foods = JSON.parse(foodsText);

    return new Response(
      JSON.stringify({ foods }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in search-foods:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

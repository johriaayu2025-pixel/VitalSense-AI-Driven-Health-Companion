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

    const prompt = `You are a professional nutritionist. Analyze the nutritional content for: "${query}"

Consider:
- Standard portion sizes for the given measurement
- Indian and international food items
- Common cooking methods
- Typical ingredient compositions

Provide accurate nutritional information in JSON format with these fields:
- foodName (string - identified food name)
- calories (number - total calories)
- protein (number in grams)
- carbs (number in grams)
- fat (number in grams)
- fiber (number in grams)
- sugar (number in grams)
- sodium (number in mg)
- vitamins (array of objects with name and amount, e.g., [{name: "Vitamin C", amount: "15mg"}])
- minerals (array of objects with name and amount, e.g., [{name: "Iron", amount: "2mg"}])
- portionSize (string description of the analyzed portion)
- confidence (string - "high", "medium", or "low" based on food recognition)

Return ONLY valid JSON, no markdown, no explanation.`;

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
            content: "You are a nutrition expert. Provide accurate nutritional data in valid JSON format only.",
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
    let nutritionText = data.choices?.[0]?.message?.content;

    // Clean up markdown if present
    nutritionText = nutritionText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const nutritionData = JSON.parse(nutritionText);

    return new Response(
      JSON.stringify(nutritionData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-nutrition:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

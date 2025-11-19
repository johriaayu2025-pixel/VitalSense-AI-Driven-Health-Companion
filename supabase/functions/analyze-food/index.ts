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
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
            content: "You are a nutrition AI expert. Analyze food images and provide detailed nutritional information in JSON format.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a professional nutritionist. Analyze this food image and provide detailed nutritional information.

Identify the food items, estimate portion size, and calculate nutrition values.

Return JSON with:
{
  "foodName": "identified food name",
  "calories": 450,
  "protein": 25,
  "carbs": 50,
  "fat": 15,
  "fiber": 5,
  "sugar": 8,
  "sodium": 400,
  "vitamins": [{"name": "Vitamin C", "amount": "20mg"}],
  "minerals": [{"name": "Iron", "amount": "3mg"}],
  "portionSize": "estimated portion description",
  "confidence": "high/medium/low",
  "ingredients": ["ingredient1", "ingredient2"]
}

Be accurate based on visual information. Return ONLY valid JSON.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                },
              },
            ],
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
    const content = data.choices?.[0]?.message?.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse nutrition data from AI response");
    }
    
    const nutritionData = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(nutritionData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-food:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

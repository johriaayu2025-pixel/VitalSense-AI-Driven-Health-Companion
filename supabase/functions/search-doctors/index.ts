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
    const { location, specialization } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Find and list real doctors/clinics for ${specialization} near ${location}.

Provide a JSON array of 5-7 real doctors with this structure:
[
  {
    "name": "Dr. Full Name",
    "clinic": "Clinic/Hospital Name",
    "specialization": "${specialization}",
    "distance": "X.X km",
    "phone": "+1 XXX-XXX-XXXX",
    "rating": 4.X,
    "address": "Full address",
    "experience": "X years",
    "availability": "Mon-Fri 9AM-6PM"
  }
]

Use realistic data based on typical healthcare providers in the area. Return ONLY valid JSON array.`;

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
            content: "You are a healthcare directory assistant. Provide realistic doctor information based on typical healthcare providers.",
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
    let doctorsText = data.choices?.[0]?.message?.content;

    // Clean up markdown if present
    doctorsText = doctorsText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const doctors = JSON.parse(doctorsText);

    return new Response(
      JSON.stringify({ doctors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in search-doctors:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

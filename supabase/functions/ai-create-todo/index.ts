import "@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = new Date();

    const systemPrompt = `
    You convert natural language todo requests into structured JSON.

Current date: ${now.toISOString()}
Current day of week: ${now.getDay()}

Your job:
Interpret the user's intent and rewrite it into a clean, useful todo entry like a real task manager would.

Output fields:
- title: Short, clear, action-oriented task (max 100 chars). Start with a verb (Prepare, Finish, Buy, Call, Study, Create, etc).
- description: A natural sentence explaining what needs to be done (max 500 chars). Do NOT leave empty.
- priority: "low", "medium", or "high"
- due_date: ISO 8601 UTC datetime string or null

Priority rules:
- "high" if the user implies urgency, pressure, risk, or importance (exam, fail, deadline, must, asap, important, critical, etc)
- "low" if the user implies low urgency (someday, optional, whenever, not important, if possible)
- otherwise "medium"

Date rules:
- Convert relative dates (today, tomorrow, Friday, next month, in 2 weeks, end of year) into absolute ISO UTC dates using the current date.
- If time is mentioned without hour, use 23:59:59 UTC.
- If no date mentioned, set due_date to null.

Language rules:
- Rewrite vague inputs into meaningful tasks.
- Never copy the input directly if it is too short or unclear.
- Improve grammar and clarity.
- Description must add useful context beyond the title.

Output rules:
- Output ONLY raw JSON object.
- Do NOT use markdown
- Do NOT explain
- Do NOT add extra fields
- Do NOT add comments

Input: "${prompt}"
`;

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 200,
          },
        }),
      },
    );

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No model output");

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

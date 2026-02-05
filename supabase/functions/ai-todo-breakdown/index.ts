import "@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

Deno.serve(async (req) => {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (prompt.length > 800) {
      return new Response(JSON.stringify({ error: "prompt too long" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = new Date();

    const systemPrompt = `
You are a task planner that breaks down a user goal into small actionable todo items.

Current date: ${now.toISOString()}

Your job:
- Read the user's input.
- Identify distinct actions that must be done.
- Split them into clear, practical todos.

Each todo must:
- Represent ONE action.
- Be something a human can actually do.
- Not be vague.
- Not be micro-steps.

Output format:
An array of JSON objects with this structure:
- title: Short, action-oriented task (start with a verb, max 100 chars)
- description: A clear explanation of what needs to be done (max 500 chars)
- priority: "low", "medium", or "high"
- due_date: ISO 8601 UTC string or null

Rules:
- Do NOT include markdown.
- Do NOT wrap in \`\`\`json.
- Do NOT explain anything.
- Return ONLY the JSON array.
- Minimum 1 item, maximum 5 items.

Priority rules:
- "high" if the task involves deadlines, risk, or urgency.
- "low" if it is optional or casual.
- otherwise "medium".

Date rules:
- If the user mentions any date, apply it logically to relevant tasks.
- If no date is mentioned, use null.

Rewrite vague ideas into real tasks.
Improve grammar and clarity.

Input:
"${prompt}"
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
            maxOutputTokens: 700,
          },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: "AI request failed", raw: errText }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(JSON.stringify({ error: "No AI output" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "AI returned invalid JSON", raw: cleaned }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!Array.isArray(parsed)) {
      return new Response(
        JSON.stringify({ error: "AI did not return an array", raw: parsed }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

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

import { NextRequest, NextResponse } from "next/server";

/* ─── Types ──────────────────────────────────────────────── */
export type AiCoachRequest = {
  level: string;
  goal: string;
  equipment: string;
  duration: number;
  question?: string;
};

export type AiCoachResponse = {
  workoutPlan: string;
  nutritionAdvice: string;
  safetyNote: string;
  explanation: string;
};

/* ─── Groq config ────────────────────────────────────────── */
const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/* ─── Build the structured prompt ────────────────────────── */
function buildPrompt(body: AiCoachRequest): string {
  const userQuestion = body.question?.trim()
    ? `\n\nUser's specific question: "${body.question.trim()}"`
    : "";

  return `You are a professional fitness coach and certified nutritionist.
A user is asking for personalized fitness guidance.
Do NOT give medical diagnoses or replace professional medical advice.

User profile:
- Fitness level: ${body.level}
- Primary goal: ${body.goal}
- Available equipment: ${body.equipment}
- Preferred session duration: ${body.duration} minutes${userQuestion}

Respond ONLY with a valid JSON object (no markdown, no code fences, no extra text) with exactly these four fields:

{
  "workoutPlan": "A specific, actionable workout suggestion for today or this week. Include exercise names, sets/reps or duration, and how it fits their goal. 3-5 sentences.",
  "nutritionAdvice": "Practical nutrition tips that support their goal. Include macro guidance, meal timing, or specific food suggestions. 2-4 sentences.",
  "safetyNote": "One important safety or recovery tip relevant to their level and goal. Keep it concise (1-2 sentences).",
  "explanation": "A short motivational explanation of why this plan suits their profile. 1-3 sentences."
}

Keep the tone energetic, encouraging, and professional. Use plain language — no jargon.`;
}

function cleanModelJson(rawText: string) {
  return rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function isAiCoachResponse(value: unknown): value is AiCoachResponse {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Record<keyof AiCoachResponse, unknown>>;
  return (
    typeof candidate.workoutPlan === "string" &&
    typeof candidate.nutritionAdvice === "string" &&
    typeof candidate.safetyNote === "string" &&
    typeof candidate.explanation === "string" &&
    candidate.workoutPlan.trim().length > 0 &&
    candidate.nutritionAdvice.trim().length > 0 &&
    candidate.safetyNote.trim().length > 0 &&
    candidate.explanation.trim().length > 0
  );
}

async function parseGroqError(response: Response) {
  const fallback = "Unknown Groq API error";

  try {
    const data = await response.json();
    return data?.error?.message ?? data?.message ?? fallback;
  } catch {
    return response.text().catch(() => fallback);
  }
}

/* ─── POST /api/ai-coach ─────────────────────────────────── */
export async function POST(req: NextRequest) {
  /* 1 — Check API key ────────────────────────────────────── */
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI Coach is not configured yet. Please add GROQ_API_KEY to your .env file.",
      },
      { status: 503 },
    );
  }

  /* 2 — Parse & validate body ────────────────────────────── */
  let body: AiCoachRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.level || !body.goal || !body.equipment || !body.duration) {
    return NextResponse.json(
      { error: "Missing required fields: level, goal, equipment, duration." },
      { status: 400 },
    );
  }

  /* 3 — Call Groq ────────────────────────────────────────── */
  let apiResponse: Response;
  try {
    apiResponse = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are Social Gym's AI Fitness Coach. Return only valid JSON for the requested schema.",
          },
          {
            role: "user",
            content: buildPrompt(body),
          },
        ],
        temperature: 0.65,
        max_completion_tokens: 700,
        response_format: { type: "json_object" },
      }),
    });
  } catch (err) {
    console.error("[ai-coach] Network error calling Groq:", err);
    return NextResponse.json(
      { error: "Could not reach the AI service. Please check your connection and try again." },
      { status: 502 },
    );
  }

  /* 4 — Handle HTTP-level errors ─────────────────────────── */
  if (!apiResponse.ok) {
    const errorText = await parseGroqError(apiResponse);
    console.error("[ai-coach] Groq API error:", apiResponse.status, errorText);

    if (apiResponse.status === 401) {
      return NextResponse.json(
        { error: "Invalid Groq API key. Please check your GROQ_API_KEY in .env." },
        { status: 401 },
      );
    }
    if (apiResponse.status === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 },
      );
    }
    if (apiResponse.status === 400) {
      return NextResponse.json(
        { error: "The AI could not process this request. Please try rephrasing your question." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "The AI service returned an error. Please try again shortly." },
      { status: 502 },
    );
  }

  /* 5 — Extract text from OpenAI-compatible response ─────── */
  const data = await apiResponse.json();
  const rawText: string = data?.choices?.[0]?.message?.content ?? "";

  if (!rawText) {
    console.error("[ai-coach] Unexpected Groq response shape:", JSON.stringify(data));
    return NextResponse.json(
      { error: "The AI returned an empty response. Please try again." },
      { status: 502 },
    );
  }

  /* 6 — Parse JSON from the model output ─────────────────── */
  let parsed: AiCoachResponse;
  try {
    parsed = JSON.parse(cleanModelJson(rawText));
  } catch {
    console.error("[ai-coach] Failed to parse model JSON output:", rawText);
    return NextResponse.json(
      { error: "The AI response could not be parsed. Please try again." },
      { status: 502 },
    );
  }

  /* 7 — Validate required fields ─────────────────────────── */
  if (!isAiCoachResponse(parsed)) {
    console.error("[ai-coach] Incomplete fields in model response:", parsed);
    return NextResponse.json(
      { error: "The AI response was incomplete. Please try again." },
      { status: 502 },
    );
  }

  /* 8 — Return clean response ────────────────────────────── */
  return NextResponse.json({
    workoutPlan: parsed.workoutPlan.trim(),
    nutritionAdvice: parsed.nutritionAdvice.trim(),
    safetyNote: parsed.safetyNote.trim(),
    explanation: parsed.explanation.trim(),
  });
}

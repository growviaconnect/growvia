import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

function buildPrompt(fields: {
  nom: string;
  job_title: string;
  company: string;
  industry: string;
  years_experience: string;
  seniority: string;
  expertise: string[];
  help_with: string;
  languages: string[];
}): string {
  const parts = [
    `Name: ${fields.nom}`,
    `Job title: ${fields.job_title}`,
    fields.company ? `Company: ${fields.company}` : null,
    `Industry: ${fields.industry}`,
    `Years of experience: ${fields.years_experience}`,
    `Seniority: ${fields.seniority}`,
    `Areas of expertise: ${fields.expertise.join(", ")}`,
    `What they can help mentees with: ${fields.help_with}`,
    `Languages: ${fields.languages.join(", ")}`,
  ].filter(Boolean);

  return [
    "You are evaluating a mentor application for GrowVia, a professional mentoring platform.",
    "Based on the profile below, write a one-sentence public summary (max 20 words) that would appear on their mentor card.",
    "Then explain in one sentence why this mentor is valuable to mentees.",
    "Respond in this exact JSON format: { \"summary\": \"...\", \"value_prop\": \"...\" }",
    "",
    parts.join("\n"),
  ].join("\n");
}

export async function POST(req: NextRequest) {
  let body: {
    nom?: string;
    job_title?: string;
    company?: string;
    industry?: string;
    years_experience?: string;
    seniority?: string;
    expertise?: string[];
    help_with?: string;
    languages?: string[];
  };

  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields before touching the API — identifies the culprit clearly
  const required: [string, unknown][] = [
    ["nom", body.nom],
    ["job_title", body.job_title],
    ["industry", body.industry],
    ["years_experience", body.years_experience],
    ["seniority", body.seniority],
    ["help_with", body.help_with],
  ];
  for (const [name, val] of required) {
    if (!val || (typeof val === "string" && !val.trim())) {
      return NextResponse.json(
        { error: `Validation error: prompt variable '${name}' is empty or missing` },
        { status: 422 },
      );
    }
  }

  if (!body.expertise?.length) {
    return NextResponse.json(
      { error: "Validation error: prompt variable 'expertise' has no items selected" },
      { status: 422 },
    );
  }

  if (!body.languages?.length) {
    return NextResponse.json(
      { error: "Validation error: prompt variable 'languages' has no items selected" },
      { status: 422 },
    );
  }

  const prompt = buildPrompt({
    nom:              body.nom!.trim(),
    job_title:        body.job_title!.trim(),
    company:          (body.company ?? "").trim(),
    industry:         body.industry!,
    years_experience: body.years_experience!,
    seniority:        body.seniority!,
    expertise:        body.expertise,
    help_with:        body.help_with!.trim(),
    languages:        body.languages,
  });

  // Guard: filter out any message where content is empty or undefined
  const messages: Anthropic.MessageParam[] = (
    [{ role: "user" as const, content: prompt }] as Anthropic.MessageParam[]
  ).filter((m) => {
    const c = typeof m.content === "string" ? m.content : null;
    return c && c.trim() !== "";
  });

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "Validation error: all message content blocks are empty after filtering" },
      { status: 422 },
    );
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text" && !!b.text?.trim())
      .map((b) => b.text)
      .join("");

    let parsed: { summary?: string; value_prop?: string } = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]) as typeof parsed;
    } catch {
      // Non-JSON response — return raw text as summary
      parsed = { summary: text.slice(0, 120) };
    }

    return NextResponse.json({ summary: parsed.summary ?? null, value_prop: parsed.value_prop ?? null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown AI error";
    return NextResponse.json({ error: `AI API error: ${msg}` }, { status: 500 });
  }
}

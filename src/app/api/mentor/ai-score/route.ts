import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

function buildPrompt(fields: {
  nom: string;
  job_title: string;
  company: string;
  bio: string;
  sectors: string[];
  skills: string[];
  motivation: string;
  languages: string[];
}): string {
  const parts = [
    `Name: ${fields.nom}`,
    `Job title: ${fields.job_title}`,
    fields.company ? `Company: ${fields.company}` : null,
    fields.bio ? `Bio: ${fields.bio}` : null,
    fields.sectors.length ? `Sectors: ${fields.sectors.join(", ")}` : null,
    fields.skills.length ? `Skills: ${fields.skills.join(", ")}` : null,
    `Why they mentor: ${fields.motivation}`,
    `Languages: ${fields.languages.join(", ")}`,
  ].filter(Boolean);

  return [
    "You are evaluating a mentor application for GrowVia, a professional mentoring platform.",
    "Based on the profile below, write a one-sentence public summary (max 20 words) shown on their mentor card.",
    "Respond in this exact JSON format: { \"summary\": \"...\" }",
    "",
    parts.join("\n"),
  ].join("\n");
}

export async function POST(req: NextRequest) {
  let body: {
    nom?: string;
    job_title?: string;
    company?: string;
    bio?: string;
    sectors?: string[];
    skills?: string[];
    motivation?: string;
    languages?: string[];
  };

  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields before touching the API — names the empty variable clearly
  // so "messages: text content blocks must be non-empty" is never the error the caller sees.
  const required: [string, unknown][] = [
    ["nom",        body.nom],
    ["job_title",  body.job_title],
    ["motivation", body.motivation],
  ];
  for (const [name, val] of required) {
    if (!val || (typeof val === "string" && !val.trim())) {
      return NextResponse.json(
        { error: `Validation error: prompt variable '${name}' is empty or missing` },
        { status: 422 },
      );
    }
  }

  if (!body.languages?.length) {
    return NextResponse.json(
      { error: "Validation error: prompt variable 'languages' has no items selected" },
      { status: 422 },
    );
  }

  const prompt = buildPrompt({
    nom:        body.nom!.trim(),
    job_title:  body.job_title!.trim(),
    company:    (body.company ?? "").trim(),
    bio:        (body.bio ?? "").trim(),
    sectors:    body.sectors ?? [],
    skills:     body.skills ?? [],
    motivation: body.motivation!.trim(),
    languages:  body.languages,
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
      max_tokens: 128,
      messages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text" && !!b.text?.trim())
      .map((b) => b.text)
      .join("");

    let summary: string | null = null;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { summary?: string };
        summary = parsed.summary ?? null;
      }
    } catch {
      summary = text.slice(0, 120) || null;
    }

    return NextResponse.json({ summary });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown AI error";
    return NextResponse.json({ error: `AI API error: ${msg}` }, { status: 500 });
  }
}

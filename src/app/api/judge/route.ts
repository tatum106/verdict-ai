import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import type { VerdictResponse } from "@/types/debate";

const anthropic = new Anthropic();

function extractJson(text: string): VerdictResponse {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");
  return JSON.parse(jsonMatch[0]) as VerdictResponse;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const identifier = userId ?? req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "anonymous";
    const rateLimit = checkRateLimit(
      typeof identifier === "string" ? identifier : "anonymous",
      !!userId
    );

    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You've reached the hourly limit. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      );
    }

    const body = await req.json();
    const { topic, side_a, side_b, is_public = false } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }
    if (!side_a || typeof side_a !== "string") {
      return NextResponse.json(
        { error: "Side A argument is required" },
        { status: 400 }
      );
    }
    if (!side_b || typeof side_b !== "string") {
      return NextResponse.json(
        { error: "Side B argument is required" },
        { status: 400 }
      );
    }

    if (topic.length > 200) {
      return NextResponse.json(
        { error: "Topic must be 200 characters or less" },
        { status: 400 }
      );
    }
    if (side_a.length < 20 || side_a.length > 2000) {
      return NextResponse.json(
        { error: "Side A must be between 20 and 2000 characters" },
        { status: 400 }
      );
    }
    if (side_b.length < 20 || side_b.length > 2000) {
      return NextResponse.json(
        { error: "Side B must be between 20 and 2000 characters" },
        { status: 400 }
      );
    }

    if (side_a.trim().toLowerCase() === side_b.trim().toLowerCase()) {
      return NextResponse.json(
        { error: "Side A and Side B cannot be identical" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const systemPrompt = `You are an impartial AI judge tasked with evaluating two opposing arguments and determining which presents a stronger case.

Evaluate based on:
1. Logical coherence (25%)
2. Evidence quality (25%)
3. Addressing counterarguments (20%)
4. Clarity (15%)
5. Persuasiveness (15%)

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "winner": "A" or "B" or "TIE",
  "verdict_summary": "2-3 sentence summary",
  "side_a_analysis": {
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"]
  },
  "side_b_analysis": {
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"]
  },
  "detailed_reasoning": "3-4 paragraph analysis",
  "scores": {
    "side_a": 0-100,
    "side_b": 0-100
  }
}

Be objective, thorough, and fair. Focus on the quality of reasoning presented.`;

    const userPrompt = `TOPIC: ${topic}

SIDE A ARGUMENT:
${side_a}

SIDE B ARGUMENT:
${side_b}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      message.content[0].type === "text"
        ? message.content[0].text
        : "";
    const verdict = extractJson(text);

    let dbUserId: string | null = null;
    if (userId) {
      let user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });
      if (!user) {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ?? "";
        const baseUsername = clerkUser.username ?? email.split("@")[0];
        const username = baseUsername + "_" + userId.replace(/^user_/, "").slice(0, 8);
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            username,
            displayName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
            avatarUrl: clerkUser.imageUrl,
          },
        });
      }
      dbUserId = user.id;
    }

    const debate = await prisma.debate.create({
      data: {
        userId: dbUserId,
        topic: topic.trim(),
        sideAArgument: side_a,
        sideBArgument: side_b,
        winner: verdict.winner,
        verdictSummary: verdict.verdict_summary,
        sideAAnalysis: verdict.side_a_analysis,
        sideBAnalysis: verdict.side_b_analysis,
        detailedReasoning: verdict.detailed_reasoning,
        sideAScore: verdict.scores.side_a,
        sideBScore: verdict.scores.side_b,
        isPublic: !!is_public,
      },
    });

    return NextResponse.json({
      debate_id: debate.id,
      winner: verdict.winner,
      verdict_summary: verdict.verdict_summary,
      side_a_analysis: verdict.side_a_analysis,
      side_b_analysis: verdict.side_b_analysis,
      detailed_reasoning: verdict.detailed_reasoning,
      scores: verdict.scores,
      created_at: debate.createdAt,
    });
  } catch (error: unknown) {
    console.error("Judge API error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid AI response. Please try again." },
        { status: 500 }
      );
    }
    // Extract Anthropic API error message
    const err = error as { status?: number; error?: { message?: string }; message?: string };
    const message = err?.error?.message ?? err?.message ?? "";
    // Return the actual API error so user can see what's wrong
    const userMessage = message || "Unable to reach the judge. Please check your connection and retry.";
    return NextResponse.json(
      { error: userMessage },
      { status: 503 }
    );
  }
}

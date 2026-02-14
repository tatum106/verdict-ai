import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Trophy, Check, AlertTriangle, ChevronDown } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VerdictPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  const debate = await prisma.debate.findUnique({
    where: { id },
  });

  if (!debate) {
    notFound();
  }

  let isOwner = false;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    isOwner = user?.id === debate.userId;
  }

  const hasAccess = debate.isPublic || isOwner;

  if (!hasAccess) {
    notFound();
  }

  const sideAAnalysis = debate.sideAAnalysis as { strengths: string[]; weaknesses: string[] };
  const sideBAnalysis = debate.sideBAnalysis as { strengths: string[]; weaknesses: string[] };

  const winnerLabel =
    debate.winner === "A"
      ? "Side A Wins!"
      : debate.winner === "B"
        ? "Side B Wins!"
        : "It's a Tie!";

  const winnerColor =
    debate.winner === "A"
      ? "bg-sideA/10 text-sideA border-sideA/30"
      : debate.winner === "B"
        ? "bg-sideB/10 text-sideB border-sideB/30"
        : "bg-slate-100 text-slate-700 border-slate-300";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <nav className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Scale className="h-8 w-8 text-sideA" />
            Verdict.ai
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/debate/new">
              <Button>New Debate</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Winner announcement */}
        <div
          className={`mb-8 p-6 rounded-xl border-2 ${winnerColor} flex items-center gap-4 animate-fade-in`}
        >
          <Trophy className="h-12 w-12 shrink-0" />
          <div>
            <h1 className="text-2xl font-bold">{winnerLabel}</h1>
            <p className="text-lg opacity-90 mt-1">
              Side A: {debate.sideAScore}/100 | Side B: {debate.sideBScore}/100
            </p>
          </div>
        </div>

        {/* Topic */}
        <p className="text-lg font-medium text-slate-700 mb-6">
          Topic: {debate.topic}
        </p>

        {/* Verdict summary */}
        <Card className="mb-8 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Verdict Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-slate-700 italic border-l-4 border-sideA pl-4 py-2">
              {debate.verdictSummary}
            </blockquote>
          </CardContent>
        </Card>

        {/* Side-by-side analysis */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-l-4 border-l-sideA animate-slide-up">
            <CardHeader>
              <CardTitle className="text-sideA">Side A Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-slate-600 mb-2 flex items-center gap-1">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Strengths
                </h4>
                <ul className="space-y-1 list-disc list-inside text-slate-700">
                  {sideAAnalysis.strengths?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm text-slate-600 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Weaknesses
                </h4>
                <ul className="space-y-1 list-disc list-inside text-slate-700">
                  {sideAAnalysis.weaknesses?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-sideB animate-slide-up">
            <CardHeader>
              <CardTitle className="text-sideB">Side B Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-slate-600 mb-2 flex items-center gap-1">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Strengths
                </h4>
                <ul className="space-y-1 list-disc list-inside text-slate-700">
                  {sideBAnalysis.strengths?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm text-slate-600 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Weaknesses
                </h4>
                <ul className="space-y-1 list-disc list-inside text-slate-700">
                  {sideBAnalysis.weaknesses?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed reasoning - collapsible */}
        <details className="mb-8">
          <summary className="cursor-pointer flex items-center gap-2 text-lg font-medium text-slate-700 hover:text-slate-900 py-2">
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
            Detailed Reasoning
          </summary>
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap">
                {debate.detailedReasoning}
              </div>
            </CardContent>
          </Card>
        </details>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Link href="/debate/new">
            <Button size="lg">New Debate</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              View Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

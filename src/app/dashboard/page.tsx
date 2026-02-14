import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Plus, BarChart3 } from "lucide-react";

async function getStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (!user) return null;

  const debates = await prisma.debate.findMany({
    where: { userId: user.id },
    select: { winner: true },
  });

  const total = debates.length;
  const sideAWins = debates.filter((d) => d.winner === "A").length;
  const sideBWins = debates.filter((d) => d.winner === "B").length;
  const ties = debates.filter((d) => d.winner === "TIE").length;
  const winRate = total > 0 ? Math.round(((sideAWins + sideBWins) / total) * 10000) / 100 : 0;

  return { total, sideAWins, sideBWins, ties, winRate };
}

async function getRecentDebates(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (!user) return [];

  return prisma.debate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      topic: true,
      winner: true,
      sideAScore: true,
      sideBScore: true,
      createdAt: true,
    },
  });
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const [stats, debates] = await Promise.all([
    getStats(userId),
    getRecentDebates(userId),
  ]);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Debate
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Total Debates</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sideA mb-1">
                <span className="text-sm font-medium">Side A Wins</span>
              </div>
              <p className="text-2xl font-bold">{stats.sideAWins}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sideB mb-1">
                <span className="text-sm font-medium">Side B Wins</span>
              </div>
              <p className="text-2xl font-bold">{stats.sideBWins}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <span className="text-sm font-medium">Win Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.winRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Debates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Debates</CardTitle>
            <Link href="/debate/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Debate
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {debates.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                <p className="mb-4">No debates yet.</p>
                <Link href="/debate/new">
                  <Button>Start Your First Debate</Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {debates.map((d) => (
                  <li key={d.id} className="py-4 first:pt-0 last:pb-0">
                    <Link
                      href={`/debate/${d.id}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{d.topic}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(d.createdAt).toLocaleDateString()} • Side A:{" "}
                          {d.sideAScore}/100 | Side B: {d.sideBScore}/100
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
                          d.winner === "A"
                            ? "bg-sideA/10 text-sideA"
                            : d.winner === "B"
                              ? "bg-sideB/10 text-sideB"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {d.winner === "A"
                          ? "A Wins"
                          : d.winner === "B"
                            ? "B Wins"
                            : "Tie"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

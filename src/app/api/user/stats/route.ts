import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const debates = await prisma.debate.findMany({
      where: { userId: user.id },
      select: { winner: true },
    });

    const total = debates.length;
    const sideAWins = debates.filter((d) => d.winner === "A").length;
    const sideBWins = debates.filter((d) => d.winner === "B").length;
    const ties = debates.filter((d) => d.winner === "TIE").length;

    return NextResponse.json({
      total_debates: total,
      side_a_wins: sideAWins,
      side_b_wins: sideBWins,
      debates_tied: ties,
      win_rate: total > 0 ? Math.round(((sideAWins + sideBWins) / total) * 10000) / 100 : 0,
    });
  } catch (error) {
    console.error("User stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

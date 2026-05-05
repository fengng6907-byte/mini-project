import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, totalPnl: true, totalTrades: true, balance: true, goldHeld: true },
    orderBy: { totalPnl: "desc" },
    take: 20,
  });

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    name: u.name ?? u.email.split("@")[0],
    totalPnl: u.totalPnl,
    totalTrades: u.totalTrades,
    balance: u.balance,
  }));

  return NextResponse.json({ leaderboard });
}

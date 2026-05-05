import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, balance: user.balance, goldHeld: user.goldHeld, goldAvgCost: user.goldAvgCost, totalPnl: user.totalPnl, totalTrades: user.totalTrades },
  });
}

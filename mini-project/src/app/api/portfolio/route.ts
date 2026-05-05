import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getPortfolio } from "@/lib/trading-engine";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const price = parseFloat(url.searchParams.get("price") ?? "3320");
  const data = await getPortfolio(user.id, price);
  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { executeMarketOrder, placeLimitOrder } from "@/lib/trading-engine";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { side, goldQty, orderType, limitPrice, currentPrice } = await req.json();

    if (!["BUY", "SELL"].includes(side)) {
      return NextResponse.json({ error: "Invalid side" }, { status: 400 });
    }
    if (!goldQty || goldQty <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    if (orderType === "LIMIT") {
      if (!limitPrice || limitPrice <= 0) {
        return NextResponse.json({ error: "Limit price required" }, { status: 400 });
      }
      const order = await placeLimitOrder(user.id, side, goldQty, limitPrice);
      return NextResponse.json({ order });
    }

    if (!currentPrice || currentPrice <= 0) {
      return NextResponse.json({ error: "Current price required" }, { status: 400 });
    }
    const result = await executeMarketOrder(user.id, side, goldQty, currentPrice);
    return NextResponse.json({ trade: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Trade failed" }, { status: 400 });
  }
}

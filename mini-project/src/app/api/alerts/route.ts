import { NextResponse } from "next/server";

// In-memory store for demo - in production, use Supabase/Firebase
const alertSubscriptions: Map<string, { email: string; targetPrice: number; direction: "above" | "below" }> = new Map();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, targetPrice, direction, alertId } = body;

    if (!targetPrice || !direction) {
      return NextResponse.json(
        { error: "Missing required fields: targetPrice, direction" },
        { status: 400 }
      );
    }

    const id = alertId || Date.now().toString(36);
    alertSubscriptions.set(id, { email: email || "", targetPrice, direction });

    return NextResponse.json({
      success: true,
      alertId: id,
      message: `Alert set: notify when gold goes ${direction} $${targetPrice}`,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get("id");

    if (!alertId) {
      return NextResponse.json({ error: "Missing alert ID" }, { status: 400 });
    }

    alertSubscriptions.delete(alertId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}

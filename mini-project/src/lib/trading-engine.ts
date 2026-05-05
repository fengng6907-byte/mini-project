import { prisma } from "./prisma";

const FEE_RATE = 0.001; // 0.1%

export async function executeMarketOrder(
  userId: string,
  side: "BUY" | "SELL",
  goldQty: number,
  currentPrice: number
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const total = goldQty * currentPrice;
  const fee = total * FEE_RATE;
  let pnl = 0;

  if (side === "BUY") {
    const cost = total + fee;
    if (user.balance < cost) throw new Error("Insufficient balance");
    const newAvgCost =
      user.goldHeld > 0
        ? (user.goldAvgCost * user.goldHeld + currentPrice * goldQty) / (user.goldHeld + goldQty)
        : currentPrice;

    await prisma.$transaction([
      prisma.trade.create({
        data: { userId, side: "BUY", goldQty, price: currentPrice, total, fee, pnl: 0 },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: cost },
          goldHeld: { increment: goldQty },
          goldAvgCost: newAvgCost,
          totalTrades: { increment: 1 },
        },
      }),
    ]);
  } else {
    if (user.goldHeld < goldQty) throw new Error("Insufficient gold holdings");
    pnl = (currentPrice - user.goldAvgCost) * goldQty - fee;
    const proceeds = total - fee;

    await prisma.$transaction([
      prisma.trade.create({
        data: { userId, side: "SELL", goldQty, price: currentPrice, total, fee, pnl },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: proceeds },
          goldHeld: { decrement: goldQty },
          totalPnl: { increment: pnl },
          totalTrades: { increment: 1 },
        },
      }),
    ]);
  }

  return { side, goldQty, price: currentPrice, total, fee, pnl };
}

export async function placeLimitOrder(
  userId: string,
  side: "BUY" | "SELL",
  goldQty: number,
  limitPrice: number
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (side === "BUY") {
    const estimatedCost = goldQty * limitPrice * (1 + FEE_RATE);
    if (user.balance < estimatedCost) throw new Error("Insufficient balance for limit order");
  } else {
    if (user.goldHeld < goldQty) throw new Error("Insufficient gold for limit order");
  }

  return prisma.order.create({
    data: { userId, side, orderType: "LIMIT", goldQty, limitPrice, status: "OPEN" },
  });
}

export async function checkAndFillLimitOrders(currentPrice: number) {
  const openOrders = await prisma.order.findMany({ where: { status: "OPEN", orderType: "LIMIT" } });

  for (const order of openOrders) {
    const shouldFill =
      (order.side === "BUY" && currentPrice <= (order.limitPrice ?? Infinity)) ||
      (order.side === "SELL" && currentPrice >= (order.limitPrice ?? 0));

    if (!shouldFill) continue;

    try {
      await executeMarketOrder(order.userId, order.side as "BUY" | "SELL", order.goldQty, currentPrice);
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FILLED", filledAt: new Date(), filledPrice: currentPrice },
      });
    } catch {
      // Skip if user no longer meets conditions
    }
  }
}

export async function getPortfolio(userId: string, currentPrice: number) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const orders = await prisma.order.findMany({
    where: { userId, status: "OPEN" },
    orderBy: { createdAt: "desc" },
  });

  const goldValue = user.goldHeld * currentPrice;
  const unrealizedPnl = user.goldHeld > 0 ? (currentPrice - user.goldAvgCost) * user.goldHeld : 0;
  const totalValue = user.balance + goldValue;

  return { user, trades, orders, goldValue, unrealizedPnl, totalValue };
}

import { NextRequest, NextResponse } from "next/server";
import { getRevenueTransactionsByCreator } from "@/lib/indexer/supabase-storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get("creator");

    if (!creator) {
      return NextResponse.json(
        { error: "Creator address is required" },
        { status: 400 }
      );
    }

    const transactions = await getRevenueTransactionsByCreator(creator);

    // Sales와 Royalty 분리하여 계산
    let salesRevenue = 0;
    let royaltyRevenue = 0;

    for (const tx of transactions) {
      const amount = Number(tx.amount) / 1_000_000_000; // MIST -> SUI
      if (tx.revenue_type === "sales") {
        salesRevenue += amount;
      } else if (tx.revenue_type === "royalty") {
        royaltyRevenue += amount;
      }
    }

    return NextResponse.json({
      salesRevenue,
      royaltyRevenue,
      totalRevenue: salesRevenue + royaltyRevenue,
    });
  } catch (error) {
    console.error("Error fetching earnings stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

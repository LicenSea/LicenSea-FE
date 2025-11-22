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

    // 데이터 포맷팅
    const formattedTransactions = transactions.map((tx: any) => ({
      id: tx.id,
      workId: tx.work_id,
      workTitle: tx.works?.title || "Unknown",
      recipientAddress: tx.recipient_address,
      amount: Number(tx.amount) / 1_000_000_000, // MIST -> SUI
      revenueType: tx.revenue_type, // 'sales' 또는 'royalty'
      transactionDigest: tx.transaction_digest,
      createdAt: tx.created_at,
    }));

    return NextResponse.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

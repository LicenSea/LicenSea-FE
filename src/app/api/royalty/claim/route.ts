import { NextRequest, NextResponse } from "next/server";
import { claimRoyalty } from "@/lib/indexer/supabase-storage";

export async function POST(request: NextRequest) {
  try {
    const { workId, amount } = await request.json();

    if (!workId || amount === undefined) {
      return NextResponse.json(
        { error: "workId and amount are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "amount must be greater than 0" },
        { status: 400 }
      );
    }

    const result = await claimRoyalty(workId, amount);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

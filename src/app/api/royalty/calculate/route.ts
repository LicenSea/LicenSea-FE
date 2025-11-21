import { NextRequest, NextResponse } from "next/server";
import { calculateRoyalty } from "@/lib/indexer/supabase-storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workId = searchParams.get("workId");

    if (!workId) {
      return NextResponse.json(
        { error: "workId is required" },
        { status: 400 }
      );
    }

    const royalty = await calculateRoyalty(workId);

    return NextResponse.json(royalty);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

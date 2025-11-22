import { NextRequest, NextResponse } from "next/server";
import { distributeRoyalty } from "@/lib/indexer/royalty";

export async function POST(request: NextRequest) {
  try {
    const { workId, revenue } = await request.json();

    if (!workId || revenue === undefined) {
      return NextResponse.json(
        { error: "workId and revenue are required" },
        { status: 400 }
      );
    }

    if (revenue <= 0) {
      return NextResponse.json(
        { error: "revenue must be greater than 0" },
        { status: 400 }
      );
    }

    const distribution = await distributeRoyalty(workId, revenue);

    return NextResponse.json({
      success: true,
      distribution,
    });
  } catch (error) {
    console.error("Royalty distribution failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}

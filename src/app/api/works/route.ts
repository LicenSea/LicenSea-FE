import { NextRequest, NextResponse } from "next/server";
import { getAllWorks } from "@/lib/indexer/supabase-storage";

export async function GET(request: NextRequest) {
  try {
    const works = await getAllWorks();

    return NextResponse.json({ works });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

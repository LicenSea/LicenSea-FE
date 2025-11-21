import { NextRequest, NextResponse } from "next/server";
import { getWorkLineage } from "@/lib/indexer/supabase-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { workId: string } }
) {
  try {
    const { workId } = params;
    const lineage = await getWorkLineage(workId);

    return NextResponse.json(lineage);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

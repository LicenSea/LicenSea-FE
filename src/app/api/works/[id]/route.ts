import { NextRequest, NextResponse } from "next/server";
import { getWorkById } from "@/lib/indexer/supabase-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workId } = await params;

    if (!workId) {
      return NextResponse.json(
        { error: "Work ID is required" },
        { status: 400 }
      );
    }

    const work = await getWorkById(workId);

    if (!work) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }
    // Supabase 데이터를 Work 타입으로 변환
    const formattedWork = {
      id: work.work_id,
      creator: work.creator,
      parentId: work.parent_id ? [work.parent_id] : null,
      preview_uri: work.preview_uri || undefined,
      blob_uri: work.blob_id || "",
      metadata: {
        title: work.title,
        description: work.description,
        file_type: work.file_type,
        file_size: work.file_size,
        tags: Array.isArray(work.tags) ? work.tags : [],
        category: work.category,
        isAdult: false, // Supabase에 없으면 기본값
      },
      fee: work.fee / 1_000_000_000, // MIST -> SUI
      licenseOption: work.license_rule
        ? {
            rule: work.license_rule,
            royaltyRatio: Number(work.royalty_ratio) / 100 || 0, // 100 단위를 퍼센트로 변환 (1000 -> 10%)
          }
        : null,
      createdAt: work.created_at ? new Date(work.created_at) : undefined,
      revoked: work.revoked || false,
    };

    return NextResponse.json({ work: formattedWork });
  } catch (error) {
    console.error("Error fetching work:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getWorksByCreator } from "@/lib/indexer/supabase-storage";
import type { Work } from "@/types/work";

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

    const works = await getWorksByCreator(creator);

    // Supabase 데이터를 Work 타입으로 변환
    const formattedWorks: Work[] = works.map((work: any) => ({
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
      },
      fee: work.fee / 1_000_000_000, // MIST -> SUI
      licenseOption: work.license_rule
        ? {
            rule: work.license_rule,
            price: work.license_price ? work.license_price / 1_000_000_000 : 0,
            royaltyRatio: Number(work.royalty_ratio || 0) / 100,
          }
        : null,
      revoked: work.revoked || false,
      createdAt: work.created_at ? new Date(work.created_at) : undefined,
    }));

    return NextResponse.json({ works: formattedWorks });
  } catch (error) {
    console.error("Error fetching my works:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

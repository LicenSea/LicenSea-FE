import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { TESTNET_PACKAGE_ID } from "@/constants";
import { getWorkById } from "@/lib/indexer/supabase-storage";
import type { Work } from "@/types/work";

const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");

    if (!owner) {
      return NextResponse.json(
        { error: "Owner address is required" },
        { status: 400 }
      );
    }

    // 사용자가 소유한 View 객체들 조회
    const ownedObjects = await suiClient.getOwnedObjects({
      owner: owner,
      options: { showContent: true, showType: true },
      filter: {
        StructType: `${TESTNET_PACKAGE_ID}::work::View`,
      },
    });

    // View 객체에서 work_id 추출
    const workIds: string[] = [];
    for (const obj of ownedObjects.data) {
      if (obj.data?.content && "fields" in obj.data.content) {
        const fields = obj.data.content.fields as any;
        if (fields.work_id) {
          workIds.push(fields.work_id);
        }
      }
    }

    // 각 work_id에 대해 Supabase에서 작품 정보 조회
    const purchasedWorks: Work[] = [];
    for (const workId of workIds) {
      try {
        const work = await getWorkById(workId);
        if (work) {
          purchasedWorks.push({
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
                  price: work.license_price
                    ? work.license_price / 1_000_000_000
                    : 0,
                  royaltyRatio: Number(work.royalty_ratio || 0) / 100,
                }
              : null,
            revoked: work.revoked || false,
            createdAt: work.created_at ? new Date(work.created_at) : undefined,
          });
        }
      } catch (error) {
        console.error(`Error fetching work ${workId}:`, error);
        // 개별 작품 조회 실패해도 계속 진행
      }
    }

    return NextResponse.json({ works: purchasedWorks });
  } catch (error) {
    console.error("Error fetching purchased works:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

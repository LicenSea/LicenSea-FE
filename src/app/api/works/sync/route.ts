import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { saveWorkToIndexer } from "@/lib/indexer/supabase-storage";
import { TESTNET_PACKAGE_ID } from "@/constants";

const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

export async function POST(request: NextRequest) {
  try {
    const packageId = TESTNET_PACKAGE_ID;

    // GraphQL로 모든 Work 객체 조회
    const query = `
      query {
        objects(
          filter: {
            type: "${packageId}::work::Work"
          }
        ) {
          nodes {
            address
            digest
            asMoveObject {
              contents {
                json
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://graphql.testnet.sui.io/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sui-rpc-show-usage": "true",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    const works = result.data?.objects?.nodes ?? [];

    const synced = [];
    const errors = [];

    // 각 Work 객체를 Supabase에 저장
    for (const work of works) {
      try {
        const workId = work.address;
        const content = work.asMoveObject?.contents?.json;

        if (!content) {
          errors.push({ workId, error: "No content found" });
          continue;
        }

        console.log(content);

        // Move 객체에서 데이터 추출
        const metadata = content.metadata || {};
        const licenseOptions = content.licenseOptions || null;

        // Cap ID는 별도로 조회 필요 (또는 트랜잭션에서 찾기)
        // 일단 workId만으로 저장하고, capId는 null로 설정
        await saveWorkToIndexer({
          workId: workId,
          //   capId: "", // Cap ID는 나중에 업데이트 가능
          creator: content.creator || "",
          parentId: content.parentId || null,
          blobId: "", // blobId는 publish 트랜잭션에서 업데이트
          transactionDigest: work.digest || "",
          timestamp: new Date(), // 정확한 시간은 트랜잭션에서 가져와야 함
          metadata: {
            title: metadata.title || "",
            description: metadata.description || "",
            file_type: metadata.file_type || "",
            file_size: Number(metadata.file_size || 0),
            tags: metadata.tags || [],
            category: metadata.category || "",
          },
          fee: Number(content.fee || 0),
          licenseOptions: licenseOptions
            ? {
                rule: licenseOptions.rule || "",
                price: Number(licenseOptions.price || 0),
                royaltyRatio: Number(licenseOptions.royaltyRatio || 0),
              }
            : null,
        });

        synced.push(workId);
      } catch (error) {
        errors.push({
          workId: work.address,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      synced: synced.length,
      errors: errors.length,
      details: {
        synced,
        errors,
      },
    });
  } catch (error) {
    console.error("Sync failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}

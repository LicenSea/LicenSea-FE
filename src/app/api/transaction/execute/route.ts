import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import {
  saveWorkToIndexer,
  updateWorkBlobId,
} from "@/lib/indexer/supabase-storage";

const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signedTransaction, transactionType, metadata } = body;

    // 서명된 트랜잭션 실행
    const result = await suiClient.executeTransactionBlock({
      transactionBlock: signedTransaction.bytes,
      signature: signedTransaction.signature,
      options: {
        showRawEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });

    // Indexer에 저장
    if (
      transactionType === "create_work" ||
      transactionType === "create_work_with_parent"
    ) {
      const createdObjects = result.objectChanges?.filter(
        (change) => change.type === "created"
      );

      const workObject = createdObjects?.find((c) =>
        c.objectType.endsWith("::work::Work")
      );
      const capObject = createdObjects?.find((c) =>
        c.objectType.endsWith("::work::Cap")
      );

      if (workObject && capObject) {
        // Move 객체에서 데이터 추출 시도
        try {
          const workData = await suiClient.getObject({
            id: workObject.objectId,
            options: { showContent: true },
          });

          const workContent = workData?.data?.content;
          if (workContent && "fields" in workContent) {
            const fields = workContent.fields as any;

            // Move 구조체에서 데이터 매핑
            await saveWorkToIndexer({
              workId: workObject.objectId,
              // capId: capObject.objectId,
              creator: fields.creator || metadata.creator,
              parentId: fields.parentId || metadata.parentId || null,
              transactionDigest: result.digest,
              timestamp: new Date(),
              metadata: {
                title: fields.metadata?.title || metadata.metadata.title,
                description:
                  fields.metadata?.description || metadata.metadata.description,
                file_type:
                  fields.metadata?.file_type || metadata.metadata.file_type,
                file_size: Number(
                  fields.metadata?.file_size || metadata.metadata.file_size
                ),
                tags: fields.metadata?.tags || metadata.metadata.tags || [],
                category:
                  fields.metadata?.category || metadata.metadata.category,
              },
              fee: Number(fields.fee || metadata.fee || 0),
              licenseOptions: fields.licenseOptions
                ? {
                    rule: fields.licenseOptions.rule || "",
                    price: Number(fields.licenseOptions.price || 0),
                    royaltyRatio: Number(
                      fields.licenseOptions.royaltyRatio || 0
                    ),
                  }
                : null,
            });
          } else {
            // 온체인 데이터 추출 실패 시 metadata 사용
            await saveWorkToIndexer({
              workId: workObject.objectId,
              // capId: capObject.objectId,
              creator: metadata.creator,
              parentId: metadata.parentId || null,
              transactionDigest: result.digest,
              timestamp: new Date(),
              metadata: metadata.metadata,
              fee: metadata.fee,
              licenseOptions: metadata.licenseOptions,
            });
          }
        } catch (error) {
          console.error("Error extracting work data from chain:", error);
          // 실패해도 metadata로 저장 시도
          await saveWorkToIndexer({
            workId: workObject.objectId,
            // capId: capObject.objectId,
            creator: metadata.creator,
            parentId: metadata.parentId || null,
            transactionDigest: result.digest,
            timestamp: new Date(),
            metadata: metadata.metadata,
            fee: metadata.fee,
            licenseOptions: metadata.licenseOptions,
          });
        }
      }
    }

    // Publish 트랜잭션
    if (transactionType === "publish") {
      await updateWorkBlobId(metadata.workId, metadata.blobId);
    }

    return NextResponse.json({
      success: true,
      digest: result.digest,
      objectChanges: result.objectChanges,
    });
  } catch (error) {
    console.error("Transaction execution failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import {
  saveWorkToIndexer,
  updateWorkBlobId,
  saveRevenueTransaction,
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
                    royaltyRatio:
                      Number(fields.licenseOptions.royaltyRatio || 0) * 100,
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
              licenseOptions: metadata.licenseOptions
                ? {
                    rule: metadata.licenseOptions.rule || "",
                    price: Number(metadata.licenseOptions.price || 0),
                    royaltyRatio:
                      Number(metadata.licenseOptions.royaltyRatio || 0) * 100,
                  }
                : null,
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
            licenseOptions: metadata.licenseOptions
              ? {
                  ...metadata.licenseOptions,
                  royaltyRatio: metadata.licenseOptions.royaltyRatio * 100, // 퍼센트를 100 단위로 변환 (1% → 100)
                }
              : null,
          });
        }
      }
    }

    // Pay 트랜잭션 분석 및 저장
    if (transactionType === "pay") {
      try {
        const workId = metadata.workId;
        console.log("[Pay Transaction] Processing pay for workId:", workId);

        // Work 객체 조회하여 creator 확인
        const workData = await suiClient.getObject({
          id: workId,
          options: { showContent: true },
        });

        let workCreator: string | null = null;
        if (workData?.data?.content && "fields" in workData.data.content) {
          workCreator = (workData.data.content.fields as any).creator;
        }
        console.log("[Pay Transaction] Work creator:", workCreator);

        // 트랜잭션 effects 확인
        const effects = result.effects;
        console.log(
          "[Pay Transaction] Effects:",
          JSON.stringify(effects, null, 2)
        );

        if (
          effects &&
          "status" in effects &&
          effects.status.status === "success"
        ) {
          // balanceChanges는 result에 직접 있음 (effects가 아님)
          const balanceChanges = result.balanceChanges || [];
          console.log("[Pay Transaction] Balance changes:", balanceChanges);

          if (balanceChanges.length === 0) {
            console.warn("[Pay Transaction] No balance changes found");
            // balanceChanges가 없으면 objectChanges에서 확인 시도
            const objectChanges = result.objectChanges || [];
            console.log("[Pay Transaction] Object changes:", objectChanges);
          }

          let savedCount = 0;
          for (const change of balanceChanges) {
            if (
              change.owner &&
              typeof change.owner === "object" &&
              "AddressOwner" in change.owner
            ) {
              const recipientAddress = change.owner.AddressOwner;
              const amount = BigInt(change.amount || "0");

              console.log("[Pay Transaction] Processing change:", {
                recipientAddress,
                amount: amount.toString(),
              });

              if (amount > 0 && recipientAddress) {
                const revenueType =
                  recipientAddress === workCreator ? "sales" : "royalty";

                let targetWorkId = workId;

                // 로열티인 경우, Supabase에서 lineage를 조회하여 부모 작품 찾기
                if (revenueType === "royalty") {
                  try {
                    const { getWorkById } = await import(
                      "@/lib/indexer/supabase-storage"
                    );
                    const soldWork = await getWorkById(workId);

                    if (soldWork?.parent_id) {
                      // 부모 작품 체인에서 조회하여 creator 확인
                      const parentWorkData = await suiClient.getObject({
                        id: soldWork.parent_id,
                        options: { showContent: true },
                      });

                      if (
                        parentWorkData?.data?.content &&
                        "fields" in parentWorkData.data.content
                      ) {
                        const parentFields = parentWorkData.data.content
                          .fields as any;
                        const parentCreator = parentFields.creator;

                        // 로열티를 받은 사람이 부모 작품의 creator인 경우
                        if (recipientAddress === parentCreator) {
                          targetWorkId = soldWork.parent_id;
                        } else {
                          // 더 상위 부모일 수도 있으므로, lineage를 재귀적으로 확인
                          let currentParentId = soldWork.parent_id;
                          let found = false;

                          // 최대 3 depth까지 확인 (Move 컨트랙트와 동일)
                          for (
                            let depth = 0;
                            depth < 3 && currentParentId && !found;
                            depth++
                          ) {
                            const parentWork = await getWorkById(
                              currentParentId
                            );
                            if (
                              parentWork &&
                              parentWork.creator === recipientAddress
                            ) {
                              targetWorkId = currentParentId;
                              found = true;
                              break;
                            }
                            currentParentId = parentWork?.parent_id || null;
                          }
                        }
                      }
                    }
                  } catch (lineageError) {
                    console.error(
                      "Error finding parent work for royalty:",
                      lineageError
                    );
                    // 실패해도 원래 workId 사용
                  }
                }

                console.log("[Pay Transaction] Saving revenue transaction:", {
                  workId: targetWorkId,
                  recipientAddress,
                  amount: Number(amount),
                  revenueType,
                  transactionDigest: result.digest,
                });

                await saveRevenueTransaction({
                  workId: targetWorkId,
                  recipientAddress: recipientAddress,
                  amount: Number(amount),
                  revenueType: revenueType,
                  transactionDigest: result.digest,
                });

                savedCount++;
                console.log(
                  "[Pay Transaction] Successfully saved revenue transaction"
                );
              } else {
                console.log(
                  "[Pay Transaction] Skipping change (amount <= 0 or no recipient)"
                );
              }
            } else {
              console.log(
                "[Pay Transaction] Skipping change (not AddressOwner):",
                change.owner
              );
            }
          }

          console.log(
            `[Pay Transaction] Total saved: ${savedCount} revenue transactions`
          );
        } else {
          console.error(
            "[Pay Transaction] Transaction not successful:",
            effects
          );
        }
      } catch (error) {
        console.error("Error saving revenue transactions:", error);
        // 에러가 발생해도 트랜잭션은 성공했으므로 에러를 throw하지 않음
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

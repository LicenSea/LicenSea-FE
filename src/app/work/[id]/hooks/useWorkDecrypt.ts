import { useState } from "react";
import {
  useSignTransaction,
  useSuiClient,
  useCurrentAccount,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/networkConfig";
import { payView } from "@/lib/payView";
import type { Work } from "@/types/work";
import { useViewObject } from "./useViewObject";
import {
  SealClient,
  SessionKey,
  NoAccessError,
  EncryptedObject,
} from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex, SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { useEffect, useCallback, useMemo } from "react";
import { useDownloadBlob } from "./useDownloadBlob";

const TTL_MIN = 10;
const SEAL_SERVER_OBJECT_IDS = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

// seal_approve
function constructWorkMoveCall(
  packageId: string,
  workId: string,
  viewObjectId: string
) {
  return (tx: Transaction, id: string) => {
    tx.moveCall({
      target: `${packageId}::work::seal_approve`,
      arguments: [
        tx.pure.vector("u8", fromHex(id)),
        tx.object(viewObjectId),
        tx.object(workId),
      ],
    });
  };
}

async function decryptBlob(
  encryptedData: ArrayBuffer,
  viewObjectId: string,
  workId: string,
  workFileType: string,
  sessionKey: SessionKey,
  suiClient: any,
  sealClient: SealClient,
  packageId: string
): Promise<string> {
  // EncryptedObject에서 ID 추출
  const fullId = EncryptedObject.parse(new Uint8Array(encryptedData)).id;

  // moveCall 생성
  const moveCallConstructor = constructWorkMoveCall(
    packageId,
    workId,
    viewObjectId
  );
  const tx = new Transaction();
  moveCallConstructor(tx, fullId);
  const txBytes = await tx.build({
    client: suiClient,
    onlyTransactionKind: true,
  });

  // 4. 복호화 키 가져오기
  try {
    await sealClient.fetchKeys({
      ids: [fullId],
      txBytes,
      sessionKey,
      threshold: 2,
    });
  } catch (err) {
    const errorMsg =
      err instanceof NoAccessError
        ? "No access to decryption keys"
        : "Unable to fetch decryption keys";
    throw new Error(errorMsg);
  }

  // 5. 복호화
  const decryptedFile = await sealClient.decrypt({
    data: new Uint8Array(encryptedData),
    sessionKey,
    txBytes,
  });

  // 6. Blob URL 생성
  const blob = new Blob([new Uint8Array(decryptedFile)], {
    type: workFileType,
  });
  return URL.createObjectURL(blob);
}

/**
 * 작품 복호화/결제 처리를 위한 hook
 */
export const useWorkDecrypt = (work: Work | null) => {
  const [hasPaid, setHasPaid] = useState(false);
  const [hasViewObject, setHasViewObject] = useState(false);
  const [decryptedImageUri, setDecryptedImageUri] = useState<string | null>(
    null
  );
  const [isDecrypting, setIsDecrypting] = useState(false);
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { checkViewObject } = useViewObject();
  const { download, isDownloading: isBlobDownloading } = useDownloadBlob();

  // useMemo를 사용하여 sealClient가 렌더링마다 재생성되는 것을 방지
  const sealClient = useMemo(
    () =>
      new SealClient({
        suiClient,
        serverConfigs: SEAL_SERVER_OBJECT_IDS.map((id) => ({
          objectId: id,
          weight: 1,
        })),
        verifyKeyServers: false,
      }),
    [suiClient]
  );

  const handleDecrypt = useCallback(async (): Promise<void> => {
    setIsDecrypting(true);

    const MAX_RETRIES = 3; // 총 2번 시도 (최초 1번 + 재시도 1번)
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // --- 재시도 로직 시작 ---
        let sessionKey: SessionKey | null = null;

        if (!currentAccount) {
          throw new Error("No account connected");
        }

        if (!work) {
          throw new Error("Work data is not loaded");
        }
        // 1. View object ID가 인자로 넘어오지 않은 경우에만 확인
        let viewId = await checkViewObject(work);
        console.log(`[Attempt ${attempt}] 1. work`, work, "viewId", viewId);

        if (!viewId) {
          // View object가 없으면 결제 트랜잭션 실행
          const feeInMist = BigInt(Math.floor(work.fee * 1_000_000_000));
          const payTx = payView(packageId, "work", work.id, feeInMist);
          const signedPayTx = await signTransaction({ transaction: payTx });

          const payResponse = await fetch("/api/transaction/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              signedTransaction: {
                bytes: signedPayTx.bytes,
                signature: signedPayTx.signature,
              },
              transactionType: "pay",
              metadata: {
                workId: work.id,
                fee: work.fee,
              },
            }),
          });

          const payResult = await payResponse.json();

          if (!payResult.success) {
            throw new Error(payResult.error || "Pay transaction failed");
          }

          // 2. View object ID 추출
          const createdObjects = payResult.objectChanges?.filter(
            (change: any) => change.type === "created"
          );
          const viewObject = createdObjects?.find((c: any) =>
            c.objectType.endsWith("::work::View")
          );

          if (!viewObject) {
            throw new Error("View object not found in transaction result");
          }

          viewId = viewObject.objectId;

          // 3. 로열티 정산 (결제한 경우에만)
          try {
            await fetch("/api/royalty/distribute", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                workId: work.id,
                revenue: work.fee,
              }),
            });
          } catch (royaltyError) {
            console.error("Royalty distribution failed:", royaltyError);
            // 로열티 정산 실패해도 계속 진행
          }
        }

        // 4. SessionKey 생성 또는 재사용
        const shouldCreateNewSessionKey = (
          key: SessionKey | null
        ): key is null => {
          return (
            !key ||
            key.isExpired() ||
            key.getAddress() !== currentAccount.address
          );
        };

        if (shouldCreateNewSessionKey(sessionKey)) {
          const newSessionKey = await SessionKey.create({
            address: currentAccount.address,
            packageId,
            ttlMin: TTL_MIN,
            suiClient,
          });

          // Personal message 서명
          const signature = await signPersonalMessage({
            message: newSessionKey.getPersonalMessage(),
          });
          await newSessionKey.setPersonalMessageSignature(signature.signature);
          sessionKey = newSessionKey;
          console.log(`[Attempt ${attempt}] 4. newSessionKey`, newSessionKey);
        }

        // 5. Walrus에서 blob 다운로드
        const encryptedData = await download(work.blob_uri);
        if (!encryptedData) {
          throw new Error("Failed to download blob from Walrus.");
        }
        console.log(`[Attempt ${attempt}] 5. encryptedData`, encryptedData);

        // 6. Seal SDK로 복호화
        const decryptedUri = await decryptBlob(
          encryptedData,
          viewId!,
          work.id,
          work.metadata.file_type,
          sessionKey!,
          suiClient,
          sealClient,
          packageId
        );

        setDecryptedImageUri(decryptedUri);
        setHasPaid(true);
        setHasViewObject(true);

        // 성공 시 루프 종료
        setIsDecrypting(false);
        return;
        // --- 재시도 로직 종료 ---
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Decrypt attempt ${attempt} failed:`, lastError.message);

        if (attempt < MAX_RETRIES) {
          await new Promise((res) => setTimeout(res, 1000)); // 1초 후 재시도
        }
      }
    }

    // 모든 재시도가 실패한 경우
    if (lastError) {
      console.error(
        "Decrypt process failed after all retries:",
        lastError.message
      );
      setIsDecrypting(false);
      throw lastError; // 최종 에러를 던져서 UI 등에 알릴 수 있도록 함
    }
  }, [
    work,
    currentAccount,
    checkViewObject,
    packageId,
    signTransaction,
    signPersonalMessage,
    suiClient,
    sealClient,
    download,
  ]);

  // work 데이터가 로드되면 구매 여부를 확인하고, 이미 구매했다면 자동으로 복호화
  useEffect(() => {
    if (!work || !currentAccount) {
      return;
    }

    // 이미 복호화가 완료되었거나 진행 중이면 실행하지 않음
    if (hasPaid || hasViewObject || isDecrypting || decryptedImageUri) {
      return;
    }

    // 무료 작품 처리
    if (work.fee === 0) {
      setHasPaid(true);
      return;
    }

    const checkForViewObject = async () => {
      const viewObjectId = await checkViewObject(work);
      if (viewObjectId) {
        setHasViewObject(true);
        setHasPaid(true);
        await handleDecrypt(); // 자동으로 복호화 실행
      }
    };

    checkForViewObject();
  }, [work, currentAccount, checkViewObject, handleDecrypt]);

  return {
    isDecrypting: isDecrypting || isBlobDownloading,
    handleDecrypt,
    hasPaid,
    hasViewObject,
    decryptedImageUri,
  };
};

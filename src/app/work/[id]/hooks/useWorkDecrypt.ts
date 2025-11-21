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

const TTL_MIN = 10;
// Seal 서버 object IDs (decrypt.tsx에서 가져온 값)
const SEAL_SERVER_OBJECT_IDS = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

const WALRUS_AGGREGATORS = [
  "aggregator1",
  "aggregator2",
  "aggregator3",
  "aggregator4",
  "aggregator5",
  "aggregator6",
];

/**
 * blob_uri에서 blob ID 추출
 * blob_uri 형식에 따라 수정 필요
 */
function extractBlobId(blobUri: string): string {
  // blob_uri가 URL 형식이면 마지막 경로에서 추출
  // 예: "https://.../blobs/0x123..." 또는 "/aggregator1/v1/blobs/0x123..."
  const match = blobUri.match(/\/blobs\/([a-fA-F0-9]+)/);
  if (match) {
    return match[1];
  }
  // 이미 blob ID인 경우
  if (blobUri.startsWith("0x")) {
    return blobUri;
  }
  throw new Error("Invalid blob_uri format");
}

/**
 * Walrus에서 blob 다운로드
 */
async function downloadBlob(blobId: string): Promise<ArrayBuffer | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const randomAggregator =
      WALRUS_AGGREGATORS[Math.floor(Math.random() * WALRUS_AGGREGATORS.length)];
    const aggregatorUrl = `/${randomAggregator}/v1/blobs/${blobId}`;
    const response = await fetch(aggregatorUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return null;
    }
    return await response.arrayBuffer();
  } catch (err) {
    console.error(`Blob ${blobId} cannot be retrieved from Walrus`, err);
    return null;
  }
}

/**
 * work::seal_approve moveCall 생성
 */
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
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });
  };
}

/**
 * Seal SDK를 사용하여 blob 복호화
 */
async function decryptBlob(
  blobId: string,
  viewObjectId: string,
  workId: string,
  workFileType: string,
  sessionKey: SessionKey,
  suiClient: any,
  sealClient: SealClient,
  packageId: string
): Promise<string> {
  // 1. Walrus에서 blob 다운로드
  const encryptedData = await downloadBlob(blobId);
  if (!encryptedData) {
    throw new Error("Failed to download blob from Walrus");
  }

  // 2. EncryptedObject에서 ID 추출
  const fullId = EncryptedObject.parse(new Uint8Array(encryptedData)).id;

  // 3. moveCall 생성
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
  const blob = new Blob([decryptedFile], { type: workFileType });
  return URL.createObjectURL(blob);
}

/**
 * 작품 복호화/결제 처리를 위한 hook
 */
export const useWorkDecrypt = () => {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [viewObjectId, setViewObjectId] = useState<string | null>(null);
  const [currentSessionKey, setCurrentSessionKey] = useState<SessionKey | null>(
    null
  );
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { checkViewObject } = useViewObject();

  // SealClient 초기화
  const sealClient = new SealClient({
    suiClient,
    serverConfigs: SEAL_SERVER_OBJECT_IDS.map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  });

  const handleDecrypt = async (
    work: Work,
    onSuccess: (decryptedUri: string) => void,
    onError?: (error: string) => void
  ) => {
    setIsDecrypting(true);

    try {
      if (!currentAccount) {
        throw new Error("No account connected");
      }

      let viewId: string | null = null;

      // 1. View object가 이미 있는지 확인
      const existingViewId = await checkViewObject(work);

      if (existingViewId) {
        // View object가 이미 있으면 결제 없이 바로 복호화
        viewId = existingViewId;
      } else {
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

      setViewObjectId(viewId);

      // 4. SessionKey 생성 또는 재사용
      let sessionKey = currentSessionKey;
      if (
        !sessionKey ||
        sessionKey.isExpired() ||
        sessionKey.getAddress() !== currentAccount.address
      ) {
        sessionKey = await SessionKey.create({
          address: currentAccount.address,
          packageId,
          ttlMin: TTL_MIN,
          suiClient,
        });

        // Personal message 서명
        const signature = await signPersonalMessage({
          message: sessionKey.getPersonalMessage(),
        });
        await sessionKey.setPersonalMessageSignature(signature.signature);
        setCurrentSessionKey(sessionKey);
      }

      // 5. blob_uri에서 blob ID 추출
      const blobId = extractBlobId(work.blob_uri);

      // 6. Seal SDK로 복호화
      const decryptedUri = await decryptBlob(
        blobId,
        viewId!,
        work.id,
        work.metadata.file_type,
        sessionKey,
        suiClient,
        sealClient,
        packageId
      );

      onSuccess(decryptedUri);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Decrypt process failed:", errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  return {
    isDecrypting,
    viewObjectId,
    handleDecrypt,
  };
};

import { useState, useCallback } from "react";

// Walrus Aggregator URL 목록 (Testnet 기준)
const WALRUS_AGGREGATORS = [
  "https://aggregator.walrus-testnet.walrus.space",
  "https://walrus-testnet-aggregator.staketab.org",
  "https://walrus-testnet-aggregator.nodes.guru",
];

export const useDownloadBlob = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(
    async (blobUri: string): Promise<ArrayBuffer | null> => {
      setIsDownloading(true);
      setError(null);

      const blobId = blobUri;
      // Fisher-Yates shuffle 알고리즘으로 애그리게이터 목록을 섞습니다.
      const shuffledAggregators = [...WALRUS_AGGREGATORS];
      for (let i = shuffledAggregators.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledAggregators[i], shuffledAggregators[j]] = [
          shuffledAggregators[j],
          shuffledAggregators[i],
        ];
      }

      for (const aggregatorBaseUrl of shuffledAggregators) {
        try {
          const aggregatorUrl = `${aggregatorBaseUrl}/v1/blobs/${blobId}`;
          console.log(`Attempting to download from: ${aggregatorUrl}`);

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

          const response = await fetch(aggregatorUrl, {
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (response.ok) {
            setIsDownloading(false);
            return await response.arrayBuffer(); // 성공 시 즉시 반환
          }
          // response.ok가 false인 경우 다음 애그리게이터로 넘어갑니다.
        } catch (err) {
          console.error(`Failed to fetch from ${aggregatorBaseUrl}`, err);
          // 에러 발생 시 다음 애그리게이터로 계속 진행합니다.
        }
      }

      // 모든 애그리게이터 시도가 실패한 경우
      const errorMessage = "All aggregators failed to retrieve the blob.";
      console.error(
        `Blob ${blobId} cannot be retrieved from Walrus.`,
        errorMessage
      );
      setError(errorMessage);
      setIsDownloading(false);
      return null;
    },
    []
  );

  return { isDownloading, error, download };
};

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
      try {
        const blobId = blobUri;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const randomAggregatorUrl =
          WALRUS_AGGREGATORS[
            Math.floor(Math.random() * WALRUS_AGGREGATORS.length)
          ];
        const aggregatorUrl = `${randomAggregatorUrl}/v1/blobs/${blobId}`;

        const response = await fetch(aggregatorUrl, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.statusText}`);
        }
        return await response.arrayBuffer();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown download error";
        console.error(`Blob ${blobUri} cannot be retrieved from Walrus`, err);
        setError(errorMessage);
        return null;
      } finally {
        setIsDownloading(false);
      }
    },
    []
  );

  return { isDownloading, error, download };
};

import { useMemo } from "react";
import type { Work } from "@/types/work";

/**
 * API에서 받은 데이터를 Work 타입으로 변환하는 hook
 */
export const useWorksTransform = (fetchedWorks: any[]) => {
  return useMemo(() => {
    const transformedWorks = fetchedWorks
      .map((work: any): Work | null => {
        if (!work) return null;

        return {
          id: work.work_id,
          creator: work.creator,
          fee: Number(work.fee) / 1_000_000_000, // MIST to SUI
          metadata: {
            title: work.title,
            description: work.description,
            file_type: work.file_type,
            file_size: work.file_size,
            tags: work.tags || [],
            category: work.category,
            isAdult: false, // Supabase에 없으면 기본값
          },
          preview_uri: work.preview_uri,
          licenseOption: work.license_rule
            ? {
                rule: work.license_rule,
                price: Number(work.license_price || 0) / 1_000_000_000,
                royaltyRatio: Number(work.royalty_ratio || 0),
              }
            : null,
          parentId: work.parent_id ? [work.parent_id] : null,
          blob_uri: work.blob_id || "",
        };
      })
      .filter((work): work is Work => work !== null);

    return transformedWorks;
  }, [fetchedWorks]);
};

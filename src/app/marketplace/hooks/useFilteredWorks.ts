import { useMemo } from "react";
import type { Work } from "@/types/work";
import type { FilterOptions } from "@/types/work";

type SortOption = "relevance" | "price-low-high" | "price-high-low" | "name";

interface UseFilteredWorksProps {
  works: Work[];
  filters: FilterOptions;
  sortBy: SortOption;
}

/**
 * 작품 목록을 필터링하고 정렬하는 hook
 */
export const useFilteredWorks = ({
  works,
  filters,
  sortBy,
}: UseFilteredWorksProps) => {
  return useMemo(() => {
    let result = [...works];

    // 카테고리 필터
    if (filters.categories.length > 0) {
      result = result.filter((product) =>
        filters.categories.includes(product.metadata.category)
      );
    }

    // 태그 필터
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((product) =>
        filters.tags!.some((tag) => product.metadata.tags?.includes(tag))
      );
    }

    // 가격 범위 필터
    result = result.filter(
      (product) =>
        product.fee >= filters.feeRange[0] && product.fee <= filters.feeRange[1]
    );

    // 크리에이터 필터
    if (filters.creator) {
      const creatorLower = filters.creator.toLowerCase();
      result = result.filter((product) =>
        product.creator.toLowerCase().includes(creatorLower)
      );
    }

    // 제목 필터
    if (filters.title) {
      const titleLower = filters.title.toLowerCase();
      result = result.filter((product) =>
        product.metadata.title.toLowerCase().includes(titleLower)
      );
    }

    // 성인 콘텐츠 필터
    if (filters.isAdult !== null && filters.isAdult !== undefined) {
      result = result.filter(
        (product) => product.metadata.isAdult === filters.isAdult
      );
    }

    // 라이선스 옵션 필터
    if (
      filters.hasLicenseOptions !== null &&
      filters.hasLicenseOptions !== undefined
    ) {
      result = result.filter((product) => {
        const hasLicense =
          product.licenseOption && product.licenseOption.rule !== "";
        return hasLicense === filters.hasLicenseOptions;
      });
    }

    // 정렬
    switch (sortBy) {
      case "price-low-high":
        result.sort((a, b) => a.fee - b.fee);
        break;
      case "price-high-low":
        result.sort((a, b) => b.fee - a.fee);
        break;
      case "name":
        result.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
        break;
      default:
        // relevance - keep original order
        break;
    }

    return result;
  }, [works, filters, sortBy]);
};

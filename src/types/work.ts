export type LicenseOption = {
  id: string;
  rule: string; // e.g. only use for Fanart
  price: number;
  royaltyRatio: number; // ex: 20 (내가 20, 라이센스 구매자가 80)
};

export type Work = {
  id: string;
  creator: string; // address
  parentId: string[];
  blob_uri: string;
  metadata: {
    title: string;
    desc: string;
    tags: string[];
  };
  view_price: number;
  licenseOptions: LicenseOption[];
  // 추가 필드 (정렬, 필터링용)
  createdAt?: Date;
  // viewCount?: number;
  derivativeCount?: number;
  // category?: string;
};

export type SortOption = "latest" | "popular" | "derivatives";

export type FilterOptions = {
  // category?: string;
  tags: string[];
  viewType?: "free" | "paid" | "all";
  licenseType?: string;
  searchQuery?: string;
};

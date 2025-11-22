export type LicenseOption = {
  rule: string; // e.g. only use for Fanart
  price: number;
  royaltyRatio: number; // ex: 20 (내가 20, 라이센스 구매자가 80)
};

export type Work = {
  id: string;
  creator: string; // address
  parentId: string[] | null;
  preview_uri?: string;
  blob_uri: string;
  metadata: {
    title: string;
    description: string;
    file_type: string;
    file_size: number;
    tags: string[];
    category: string;
    isAdult?: boolean;
  };
  fee: number;
  licenseOption: LicenseOption | null;
  revoked?: boolean;

  // 추가 필드 (정렬, 필터링용)
  createdAt?: Date;
  // viewCount?: number;
  derivativeCount?: number;
};

export type SortOption = "latest" | "popular" | "derivatives";

export type FilterOptions = {
  categories: string[];
  tags: string[];
  feeRange: [number, number];
  // viewType?: "free" | "paid" | "all";
  licenseType?: string;
  creator?: string;
  title?: string;
  isAdult?: boolean | null;
  hasLicenseOptions?: boolean | null;
};

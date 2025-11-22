export interface MoveWork {
  id: string; // UID -> objectId
  creator: string; // address
  parentId: string | null; // Option<ID>
  metadata: {
    title: string;
    description: string;
    file_type: string;
    file_size: number; // u64
    tags: string[]; // vector<String>
    category: string;
  };
  fee: number; // u64 (MIST 단위)
  licenseOptions: {
    rule: string;
    price: number; // u64 (MIST 단위)
    royaltyRatio: number; // u64
  } | null;
}

export interface WorkIndexerData {
  workId: string;
  // capId: string;
  creator: string;
  parentId: string | null; // Move의 Option<ID>
  blobId?: string;
  previewUri?: string;
  transactionDigest: string;
  timestamp: Date;
  metadata: MoveWork["metadata"];
  fee: number; // MIST 단위
  licenseOptions: MoveWork["licenseOptions"];
}

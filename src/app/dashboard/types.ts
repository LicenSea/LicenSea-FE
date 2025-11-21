export type TabType =
  | "overview"
  | "my-works"
  | "purchased"
  | "derivatives"
  | "earnings";

export type TreeNode = {
  work: {
    id: string;
    title: string;
    creator: string;
    preview_uri?: string;
    created_at?: string;
  };
  children: TreeNode[];
};

export type ClaimTransaction = {
  date: string;
  type: string;
  workTitle: string;
  workPreview?: string;
  amount: number;
  status: "completed" | "pending" | "failed";
};

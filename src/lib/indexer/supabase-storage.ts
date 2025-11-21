import { createClient } from "@supabase/supabase-js";
import type { WorkIndexerData } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials not found. Indexer features will be disabled."
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Work를 Indexer에 저장
 */
export async function saveWorkToIndexer(data: WorkIndexerData) {
  if (!supabase) {
    console.warn("Supabase not configured. Skipping indexer save.");
    return;
  }

  const { error } = await supabase.from("works").upsert(
    {
      work_id: data.workId,
      // cap_id: data.capId,
      creator: data.creator,
      parent_id: data.parentId,
      blob_id: data.blobId || null,
      transaction_digest: data.transactionDigest,
      created_at: data.timestamp.toISOString(),

      // Metadata
      title: data.metadata.title,
      description: data.metadata.description,
      file_type: data.metadata.file_type,
      file_size: data.metadata.file_size,
      tags: data.metadata.tags,
      category: data.metadata.category,

      // Work fields
      fee: data.fee,

      // LicenseOption
      license_rule: data.licenseOptions?.rule || null,
      license_price: data.licenseOptions?.price || null,
      royalty_ratio: data.licenseOptions?.royaltyRatio || 0,

      // Preview URI
      preview_uri: data.previewUri || null,
    },
    {
      onConflict: "work_id",
    }
  );

  if (error) {
    console.error("Error saving work to indexer:", error);
    throw error;
  }

  // parentId가 있으면 lineage에도 저장
  if (data.parentId) {
    const { error: lineageError } = await supabase.from("lineage").upsert(
      {
        child_id: data.workId,
        parent_id: data.parentId,
      },
      {
        onConflict: "child_id,parent_id",
      }
    );

    if (lineageError) {
      console.error("Error saving lineage:", lineageError);
      // lineage 에러는 치명적이지 않으므로 throw하지 않음
    }
  }
}

/**
 * Supabase Storage에 thumbnail 업로드
 */
export async function uploadThumbnailToStorage(
  file: File,
  workId: string
): Promise<string | null> {
  if (!supabase) {
    console.warn("Supabase not configured. Skipping thumbnail upload.");
    return null;
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${workId}.${fileExt}`;
  const filePath = `thumbnails/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("thumbnails")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading thumbnail:", uploadError);
    return null;
  }

  // Public URL 반환
  const { data } = supabase.storage.from("thumbnails").getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Work의 preview_uri 업데이트
 */
export async function updateWorkPreviewUri(
  workId: string,
  previewUri: string
): Promise<void> {
  if (!supabase) {
    console.warn("Supabase not configured. Skipping preview URI update.");
    return;
  }

  const { error } = await supabase
    .from("works")
    .update({ preview_uri: previewUri })
    .eq("work_id", workId);

  if (error) {
    console.error("Error updating preview URI:", error);
    throw error;
  }
}

/**
 * Work의 부모/자식 관계 조회
 */
export async function getWorkLineage(workId: string) {
  if (!supabase) {
    console.warn("Supabase not configured. Returning empty lineage.");
    return { children: [], parents: [] };
  }

  // 자식들 조회
  const { data: childrenData, error: childrenError } = await supabase
    .from("lineage")
    .select(
      `
      child_id,
      works!lineage_child_id_fkey (
        work_id,
        title,
        creator,
        created_at
      )
    `
    )
    .eq("parent_id", workId);

  if (childrenError) {
    console.error("Error fetching children:", childrenError);
  }

  // 부모들 조회
  const { data: parentsData, error: parentsError } = await supabase
    .from("lineage")
    .select(
      `
      parent_id,
      works!lineage_parent_id_fkey (
        work_id,
        title,
        creator,
        created_at
      )
    `
    )
    .eq("child_id", workId);

  if (parentsError) {
    console.error("Error fetching parents:", parentsError);
  }

  return {
    children: (childrenData?.map((c: any) => c.works).filter(Boolean) ||
      []) as any[],
    parents: (parentsData?.map((p: any) => p.works).filter(Boolean) ||
      []) as any[],
  };
}

/**
 * Work의 blobId 업데이트 (publish 트랜잭션 후)
 */
export async function updateWorkBlobId(workId: string, blobId: string) {
  if (!supabase) {
    console.warn("Supabase not configured. Skipping blobId update.");
    return;
  }

  const { error } = await supabase
    .from("works")
    .update({ blob_id: blobId })
    .eq("work_id", workId);

  if (error) {
    console.error("Error updating blob_id:", error);
    throw error;
  }
}

/**
 * 정산 계산 (로열티) - 누적 보상 조회
 * Nested/Cascading 방식으로 이미 분배된 royalty_earned를 조회
 */
export async function calculateRoyalty(workId: string) {
  if (!supabase) {
    console.warn("Supabase not configured. Returning empty royalty.");
    return { totalRoyalty: 0, breakdown: [] };
  }

  // 해당 work의 누적 보상 조회
  const { earned, claimed, claimable } = await getRoyaltyEarned(workId);

  // 자식들의 수익 정보도 함께 조회 (선택적)
  const { data: children } = await supabase
    .from("lineage")
    .select(
      `
      child_id,
      works!lineage_child_id_fkey (
        work_id,
        title,
        fee
      )
    `
    )
    .eq("parent_id", workId);

  const breakdown = (children || []).map((c: any) => ({
    childWorkId: c.child_id,
    childTitle: c.works?.title || "",
    childFee: Number(c.works?.fee || 0) / 1_000_000_000, // MIST to SUI
  }));

  return {
    totalRoyalty: claimable, // 인출 가능한 금액
    earned, // 총 누적 보상
    claimed, // 인출한 금액
    claimable, // 인출 가능한 금액
    breakdown,
  };
}

/**
 * 모든 Works 조회 (Marketplace용)
 */
export async function getAllWorks() {
  if (!supabase) {
    console.warn("Supabase not configured. Returning empty works.");
    return [];
  }

  const { data, error } = await supabase
    .from("works")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching works:", error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 Work 조회
 */
export async function getWorkById(workId: string) {
  if (!supabase) {
    console.warn("Supabase not configured. Returning null.");
    return null;
  }

  const { data, error } = await supabase
    .from("works")
    .select("*")
    .eq("work_id", workId)
    .single();

  if (error) {
    console.error("Error fetching work:", error);
    throw error;
  }

  return data;
}

/**
 * Work의 누적 보상 조회
 */
export async function getRoyaltyEarned(workId: string) {
  if (!supabase) {
    console.warn("Supabase not configured. Returning empty royalty.");
    return { earned: 0, claimed: 0, claimable: 0 };
  }

  const { data, error } = await supabase
    .from("works")
    .select("royalty_earned, royalty_claimed")
    .eq("work_id", workId)
    .single();

  if (error) {
    console.error("Error fetching royalty:", error);
    throw error;
  }

  const earned = Number(data?.royalty_earned || 0);
  const claimed = Number(data?.royalty_claimed || 0);
  const claimable = earned - claimed;

  return { earned, claimed, claimable };
}

/**
 * Royalty Claim (보상 인출)
 */
export async function claimRoyalty(workId: string, amount: number) {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  // 현재 claimable 금액 확인
  const { earned, claimed } = await getRoyaltyEarned(workId);
  const claimable = earned - claimed;

  if (amount > claimable) {
    throw new Error(`Cannot claim ${amount}. Available: ${claimable}`);
  }

  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  // claimed 금액 업데이트
  const currentClaimed = Number(claimed || 0);
  const { error } = await supabase
    .from("works")
    .update({
      royalty_claimed: currentClaimed + amount,
    })
    .eq("work_id", workId);

  if (error) {
    console.error("Error claiming royalty:", error);
    throw error;
  }

  return { success: true, claimed: amount, remaining: claimable - amount };
}

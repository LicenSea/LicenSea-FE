import { supabase } from "./supabase-storage";

/**
 * 수익 발생 시 재귀적으로 부모들에게 royalty 분배 (Nested/Cascading 방식)
 * 각 레벨에서 받은 금액의 일정 비율을 위로 올려보내고, 실제 보유 금액을 계산
 *
 * 예시: A (20%) → B (30%) → C
 * C가 100 SUI 수익 발생:
 * - C: 100 - 30 = 70 SUI 보유
 * - B: 30 - 6 = 24 SUI 보유
 * - A: 6 SUI 보유
 *
 * @param childWorkId 수익이 발생한 work (자식)
 * @param revenue 발생한 수익 금액 (MIST 단위)
 * @returns 각 레벨에서 실제로 받은 금액
 */
export async function distributeRoyalty(
  childWorkId: string,
  revenue: number
): Promise<{ [workId: string]: number }> {
  if (!supabase) {
    console.warn("Supabase not configured. Skipping royalty distribution.");
    return {};
  }

  const distribution: { [workId: string]: number } = {};

  // 재귀적으로 부모 체인을 타고 올라가며 royalty 분배
  await distributeToParents(childWorkId, revenue, distribution);

  // 각 work의 royalty_earned 업데이트
  for (const [workId, amount] of Object.entries(distribution)) {
    if (amount > 0 && supabase) {
      // 현재 royalty_earned 조회
      const { data: current, error: fetchError } = await supabase
        .from("works")
        .select("royalty_earned")
        .eq("work_id", workId)
        .single();

      if (fetchError) {
        console.error(
          `Error fetching current royalty for ${workId}:`,
          fetchError
        );
        continue;
      }

      const currentEarned = Number(current?.royalty_earned || 0);

      // royalty_earned 업데이트
      const { error: updateError } = await supabase
        .from("works")
        .update({ royalty_earned: currentEarned + amount })
        .eq("work_id", workId);

      if (updateError) {
        console.error(
          `Error updating royalty_earned for ${workId}:`,
          updateError
        );
      }
    }
  }

  return distribution;
}

/**
 * 재귀적으로 부모들에게 royalty 분배
 * @param childId 현재 work ID
 * @param receivedAmount 이 레벨에서 받은 금액
 * @param distribution 각 work가 실제로 받은 금액을 저장할 객체
 */
async function distributeToParents(
  childId: string,
  receivedAmount: number,
  distribution: { [workId: string]: number }
): Promise<void> {
  if (receivedAmount <= 0 || !supabase) return;

  // 현재 work의 부모 찾기
  const { data: lineageData, error } = await supabase
    .from("lineage")
    .select("parent_id, works!lineage_parent_id_fkey(*)")
    .eq("child_id", childId)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching parent for ${childId}:`, error);
    // 에러가 나도 현재 work는 받은 금액을 가짐
    distribution[childId] = (distribution[childId] || 0) + receivedAmount;
    return;
  }

  if (!lineageData || !lineageData.parent_id) {
    // 더 이상 부모가 없으면 현재 work가 모두 가짐
    distribution[childId] = (distribution[childId] || 0) + receivedAmount;
    return;
  }

  const parent = lineageData.works as any;

  // 부모의 royalty_ratio가 0이거나 없으면 현재 work가 모두 가짐
  if (!parent.royalty_ratio || parent.royalty_ratio === 0) {
    distribution[childId] = (distribution[childId] || 0) + receivedAmount;
    return;
  }

  // 부모가 받을 금액 계산 (받은 금액의 royalty_ratio%)
  const parentRoyalty = Math.floor(
    (receivedAmount * Number(parent.royalty_ratio)) / 100
  );

  // 현재 work가 실제로 보유하는 금액 (위로 올려보낸 금액 제외)
  const childKeeps = receivedAmount - parentRoyalty;
  distribution[childId] = (distribution[childId] || 0) + childKeeps;

  // 부모가 받을 금액을 distribution에 추가 (나중에 royalty_earned 업데이트용)
  if (parentRoyalty > 0) {
    distribution[parent.work_id] =
      (distribution[parent.work_id] || 0) + parentRoyalty;

    // 부모의 부모에게도 재귀적으로 분배
    // 부모가 받은 금액에서 다시 royalty_ratio만큼 위로 전달
    await distributeToParents(parent.work_id, parentRoyalty, distribution);
  }
}

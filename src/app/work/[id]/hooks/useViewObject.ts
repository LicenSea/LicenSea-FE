import { useCallback } from "react";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/networkConfig";
import type { Work } from "@/types/work";

/**
 * View object를 확인하는 hook
 */
export const useViewObject = () => {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const currentAccount = useCurrentAccount();

  const checkViewObject = useCallback(
    async (work: Work | null) => {
      if (!currentAccount || !work) return null;

      try {
        const ownedObjects = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          options: { showContent: true, showType: true },
          filter: {
            StructType: `${packageId}::work::View`,
          },
        });

        // 현재 work에 대한 View object 찾기
        const viewObject = ownedObjects.data.find((obj) => {
          if (obj.data?.content && "fields" in obj.data.content) {
            const fields = obj.data.content.fields as any;
            return fields.work_id === work.id;
          }
          return false;
        });

        return viewObject?.data?.objectId || null;
      } catch (error) {
        console.error("Error checking view object:", error);
        return null;
      }
    },
    [currentAccount, suiClient, packageId]
  );

  return {
    checkViewObject,
  };
};

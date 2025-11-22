import { useState, useEffect } from "react";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/networkConfig";

/**
 * 사용자가 소유한 Cap 객체들을 조회하는 hook
 * Cap 객체의 work_id를 Map으로 반환 (workId -> capId)
 */
export const useOwnedCaps = () => {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");
  const [capMap, setCapMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCaps() {
      if (!currentAccount) {
        setCapMap(new Map());
        return;
      }

      setLoading(true);
      try {
        const ownedObjects = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          options: { showContent: true, showType: true },
          filter: {
            StructType: `${packageId}::work::Cap`,
          },
        });

        const newCapMap = new Map<string, string>();

        for (const obj of ownedObjects.data) {
          if (obj.data?.content && "fields" in obj.data.content) {
            const fields = obj.data.content.fields as any;
            const workId = fields.work_id;
            const capId = obj.data.objectId;

            if (workId && capId) {
              newCapMap.set(workId, capId);
            }
          }
        }

        setCapMap(newCapMap);
      } catch (error) {
        console.error("Error fetching owned Caps:", error);
        setCapMap(new Map());
      } finally {
        setLoading(false);
      }
    }

    fetchCaps();
  }, [currentAccount, suiClient, packageId]);

  return {
    capMap,
    loading,
    getCapId: (workId: string) => capMap.get(workId),
    hasCap: (workId: string) => capMap.has(workId),
  };
};

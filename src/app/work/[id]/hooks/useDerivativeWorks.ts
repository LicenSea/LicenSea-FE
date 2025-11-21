import { useState, useEffect } from "react";
import type { Work } from "@/types/work";

/**
 * 파생 작품 목록을 조회하는 hook
 */
export const useDerivativeWorks = (workId: string | null) => {
  const [derivativeWorks, setDerivativeWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDerivatives() {
      if (!workId) {
        setDerivativeWorks([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/works");
        const data = await response.json();
        const derivatives = (data.works || []).filter(
          (w: Work) => w.parentId && w.parentId.includes(workId)
        );
        setDerivativeWorks(derivatives);
      } catch (error) {
        console.error("Error loading derivative works:", error);
        setDerivativeWorks([]);
      } finally {
        setLoading(false);
      }
    }

    loadDerivatives();
  }, [workId]);

  return {
    derivativeWorks,
    loading,
  };
};

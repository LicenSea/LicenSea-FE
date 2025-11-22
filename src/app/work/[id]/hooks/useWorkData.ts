import { useState, useEffect } from "react";
import type { Work } from "@/types/work";

/**
 * 작품 데이터를 로딩하는 hook
 */
export const useWorkData = (id: string | undefined) => {
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWork() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/works/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setWork(null);
            setLoading(false);
            return;
          }
          throw new Error("Failed to fetch work");
        }

        const data = await response.json();
        setWork(data.work);
      } catch (error) {
        console.error("Error loading work:", error);
        setWork(null);
      } finally {
        setLoading(false);
      }
    }

    loadWork();
  }, [id]);

  return {
    work,
    loading,
  };
};

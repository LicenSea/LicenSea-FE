import { useState, useEffect } from "react";
import type { Work } from "@/types/work";
import { useViewObject } from "./useViewObject";
import { useWorkDecrypt } from "./useWorkDecrypt";

/**
 * 작품 데이터를 로딩하는 hook
 */
export const useWorkData = (id: string | undefined) => {
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [decryptedImageUri, setDecryptedImageUri] = useState<string | null>(
    null
  );
  const [hasViewObject, setHasViewObject] = useState(false);
  const { checkViewObject } = useViewObject();
  const { handleDecrypt } = useWorkDecrypt();

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

        // 무료 작품은 이미 결제된 것으로 간주
        if (data.work.fee === 0) {
          setHasPaid(true);
        } else {
          // 유료 작품인 경우 View object 확인
          const viewObjectId = await checkViewObject(data.work);
          if (viewObjectId) {
            setHasViewObject(true);
            setHasPaid(true);
            // View object가 있으면 자동으로 복호화
            try {
              await handleDecrypt(
                data.work,
                (decryptedUri) => {
                  setDecryptedImageUri(decryptedUri);
                },
                (error) => {
                  console.error("Auto-decrypt failed:", error);
                }
              );
            } catch (error) {
              console.error("Error auto-decrypting:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading work:", error);
        setWork(null);
      } finally {
        setLoading(false);
      }
    }

    loadWork();
  }, [id, checkViewObject, handleDecrypt]);

  return {
    work,
    loading,
    hasPaid,
    setHasPaid,
    hasViewObject,
    decryptedImageUri,
    setDecryptedImageUri,
  };
};

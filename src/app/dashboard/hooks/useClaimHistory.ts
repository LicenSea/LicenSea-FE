import { useState } from "react";
import type { ClaimTransaction } from "../types";

export const useClaimHistory = () => {
  const [claimHistory, setClaimHistory] = useState<ClaimTransaction[]>([]);

  // TODO: 실제 claim 이력 데이터 API 연동
  // useEffect(() => {
  //   const fetchClaimHistory = async () => {
  //     try {
  //       const response = await fetch("/api/royalty/claim/history");
  //       const data = await response.json();
  //       setClaimHistory(data);
  //     } catch (error) {
  //       console.error("Error fetching claim history:", error);
  //     }
  //   };
  //   fetchClaimHistory();
  // }, []);

  return {
    claimHistory,
    setClaimHistory,
  };
};

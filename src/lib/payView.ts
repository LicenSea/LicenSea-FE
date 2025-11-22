import { Transaction } from "@mysten/sui/transactions";
import { REGISTRY_OBJECT_ID } from "@/constants";

export const payView = (
  packageId: string,
  moduleName: string,
  workId: string,
  fee: bigint
): Transaction => {
  const tx = new Transaction();

  // Coin을 생성하고 work.creator에게 전송
  const coin = tx.splitCoins(tx.gas, [fee]);

  tx.moveCall({
    target: `${packageId}::${moduleName}::pay`,
    arguments: [
      tx.object(REGISTRY_OBJECT_ID), // registry 추가
      coin,
      tx.object(workId),
    ],
  });

  return tx;
};

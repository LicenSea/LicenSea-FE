import { Transaction } from "@mysten/sui/transactions";

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
    arguments: [coin, tx.object(workId)],
  });

  return tx;
};

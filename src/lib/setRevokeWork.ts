import { Transaction } from "@mysten/sui/transactions";

export const setRevokeWork = (
  packageId: string,
  moduleName: string,
  workId: string,
  capId: string
): Transaction => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::${moduleName}::set_revoke_work`,
    arguments: [tx.object(workId), tx.object(capId)],
  });
  return tx;
};

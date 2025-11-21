import type { LicenseOption } from "@/types/work";

interface LicenseOptionCardProps {
  licenseOption: LicenseOption;
}

export const LicenseOptionCard = ({
  licenseOption,
}: LicenseOptionCardProps) => {
  return (
    <div className="border rounded-[4px] p-4 bg-[#ffcccc]/70">
      <h3 className="font-semibold mb-2">UseRight Option</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Rule: </span>
          <span>{licenseOption.rule}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Royalty Ratio: </span>
          <span>
            {licenseOption.royaltyRatio}% (Creator) /{" "}
            {100 - licenseOption.royaltyRatio}% (You)
          </span>
        </div>
      </div>
    </div>
  );
};

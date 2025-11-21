import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LicenseOptionCard } from "./LicenseOptionCard";
import type { Work } from "@/types/work";

interface WorkActionsProps {
  work: Work;
  hasPaid: boolean;
  isDecrypting: boolean;
  onDecrypt: () => void;
}

export const WorkActions = ({
  work,
  hasPaid,
  isDecrypting,
  onDecrypt,
}: WorkActionsProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 pt-4">
      {/* VIEW 버튼 */}
      <Button
        variant="outline"
        size="lg"
        className="w-full mb-5"
        disabled={hasPaid || isDecrypting}
        onClick={onDecrypt}
      >
        {isDecrypting ? (
          "Decrypting..."
        ) : hasPaid ? (
          <>
            <Eye className="mr-2 h-4 w-4" />
            VIEWED
          </>
        ) : (
          <>
            <Eye className="mr-2 h-4 w-4" />
            VIEW {work.fee > 0 ? `${work.fee} SUI` : "FREE"}
          </>
        )}
      </Button>

      {/* 파생 작품 생성 버튼 */}
      {work.licenseOption && (
        <Button
          variant="outline"
          size="lg"
          className="w-full bg-[#ffcccc] hover:bg-[#ffcccc]/70"
          disabled={!hasPaid}
          onClick={() => router.push(`/upload/${work.id}`)}
        >
          MAKE NEW DERIVATIVE
        </Button>
      )}

      {/* 라이선스 옵션 카드 */}
      {work.licenseOption && (
        <LicenseOptionCard licenseOption={work.licenseOption} />
      )}
    </div>
  );
};

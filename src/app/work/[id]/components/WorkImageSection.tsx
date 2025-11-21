import { Card, CardContent } from "@/components/ui/card";
import type { Work } from "@/types/work";

interface WorkImageSectionProps {
  work: Work;
  hasPaid: boolean;
  hasViewObject?: boolean;
  decryptedImageUri?: string | null;
}

export const WorkImageSection = ({
  work,
  hasPaid,
  hasViewObject = false,
  decryptedImageUri = null,
}: WorkImageSectionProps) => {
  const getImageUri = () => {
    // fee가 0이면 바로 blob_uri 표시
    if (work.fee === 0 && work.blob_uri) {
      // TODO: walrus 에 원본 파일 요청
      return work.blob_uri;
    }
    // fee가 0 이상이고 View object가 있으면 복호화된 URI 표시
    if (work.fee > 0 && hasViewObject && decryptedImageUri) {
      return decryptedImageUri;
    }
    // 그 외의 경우 preview_uri 표시
    return work.preview_uri || null;
  };

  const imageUri = getImageUri();

  return (
    <div className="w-full">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full bg-black flex items-center justify-center">
            {imageUri ? (
              <img
                src={imageUri}
                alt={work.metadata.title}
                className={`w-full h-full object-contain ${
                  work.metadata.isAdult && !hasPaid ? "blur-md" : ""
                }`}
              />
            ) : (
              <div className="text-white">No Preview Available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

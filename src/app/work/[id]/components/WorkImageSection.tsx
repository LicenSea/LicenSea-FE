import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Work } from "@/types/work";
import { useDownloadBlob } from "../hooks/useDownloadBlob";
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
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const { download, isDownloading } = useDownloadBlob();

  useEffect(() => {
    let objectUrl: string | null = null;

    const determineImageSource = async () => {
      // free
      if (work.fee === 0 && work.blob_uri) {
        const arrayBuffer = await download(work.blob_uri);
        if (arrayBuffer) {
          const blob = new Blob([arrayBuffer]);
          objectUrl = URL.createObjectURL(blob);
          setImageSrc(objectUrl);
        }
        return;
      }

      // paid & has view object
      if (work.fee > 0 && hasViewObject && decryptedImageUri) {
        setImageSrc(decryptedImageUri);
        return;
      }

      // others
      setImageSrc(work.preview_uri || null);
    };

    determineImageSource();

    // 컴포넌트가 언마운트될 때 생성된 Object URL을 메모리에서 해제
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [
    work.fee,
    work.blob_uri,
    work.preview_uri,
    hasViewObject,
    decryptedImageUri,
  ]);

  return (
    <div className="w-full">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full bg-black flex items-center justify-center">
            {isDownloading ? (
              <div className="text-white">Loading...</div>
            ) : imageSrc ? (
              <img
                src={imageSrc}
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

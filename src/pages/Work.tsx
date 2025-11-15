import { Navbar } from "@/components/Navbar/Navbar";
import { useState, useMemo } from "react";
import { useParams } from "react-router";
import { mockWorks } from "@/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/Marketplace/ProductCard";
import { categories } from "@/data";
import { Copy, Eye } from "lucide-react";

const Work = () => {
  const { id } = useParams<{ id: string }>();
  const [hasPaid, setHasPaid] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Find work by id
  const work = useMemo(() => {
    return mockWorks.find((w) => w.id === id);
  }, [id]);

  // Find derivative works (2차 창작물)
  const derivativeWorks = useMemo(() => {
    if (!work) return [];
    return mockWorks.filter((w) => w.parentId && w.parentId.includes(work.id));
  }, [work]);

  // Handle decrypting blob_uri
  const handleDecrypt = async () => {
    if (!work || hasPaid) return;

    setIsDecrypting(true);
    // TODO: 실제로는 서버에 사용자 계정과 매핑된 seal 복호화 키를 사용하여 blob_uri를 복호화
    // 여기서는 시뮬레이션을 위해 약간의 딜레이 후 hasPaid를 true로 설정
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setHasPaid(true);
    setIsDecrypting(false);
  };

  // Get image URI based on payment status
  const getImageUri = () => {
    if (!work) return null;
    if (hasPaid && work.blob_uri) {
      // TODO: 실제로는 복호화된 blob_uri를 사용
      return work.blob_uri;
    }
    return work.preview_uri || null;
  };

  if (!work) {
    return (
      <div className="min-w-screen min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Work not found</p>
        </div>
      </div>
    );
  }

  const categoryLabel =
    categories.find((c) => c.id === work.metadata.category)?.label ||
    work.metadata.category;

  const shortenAddress = (address: string, start = 8, end = 6): string => {
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  const imageUri = getImageUri();

  return (
    <div className="min-w-screen min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Main Content - Split into two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Image Preview */}
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

          {/* Right Column - Details and Purchase */}
          <div className="flex flex-col gap-6">
            {/* Title and Creator */}
            <div className="">
              <div className="flex gap-4 items-center mb-4">
                <h1 className="text-3xl font-bold">{work.metadata.title}</h1>
                {work.metadata.isAdult && (
                  <div className="">
                    <Badge variant="destructive">18+</Badge>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Creator: </span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-mono">
                    {shortenAddress(work.creator)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => {
                      navigator.clipboard.writeText(work.creator);
                    }}
                    title="Copy address"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Category and Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{categoryLabel}</Badge>
              {work.metadata.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Description */}
            {work.metadata.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {work.metadata.description}
                </p>
              </div>
            )}

            {/* File Info */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Type:</span>
                <span className="font-medium">{work.metadata.file_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Size:</span>
                <span className="font-medium">
                  {(work.metadata.file_size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">
                  {work.fee > 0 ? `${work.fee} SUI` : "FREE"}
                </span>
              </div>
            </div>

            {/* License Option Info */}
            {work.licenseOption && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">License Option</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rule: </span>
                    <span>{work.licenseOption.rule}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price: </span>
                    <span className="font-medium">
                      {work.licenseOption.price} ETH
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Royalty Ratio:{" "}
                    </span>
                    <span>
                      {work.licenseOption.royaltyRatio}% (Creator) /{" "}
                      {100 - work.licenseOption.royaltyRatio}% (License Buyer)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              {/* VIEW Button */}
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                disabled={hasPaid || isDecrypting}
                onClick={handleDecrypt}
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

              {/* BUY LICENSE NFT Button */}
              {work.licenseOption && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full bg-[#ffcccc] hover:bg-[#ffcccc]/70"
                  disabled={hasPaid}
                >
                  BUY LICENSE NFT ({work.licenseOption.price} ETH)
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Derivative Works Section */}
        {derivativeWorks.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold mb-6">
              Derivative Works ({derivativeWorks.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {derivativeWorks.map((derivative) => (
                <ProductCard key={derivative.id} product={derivative} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Work;

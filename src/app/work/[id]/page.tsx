"use client";

import { Navbar } from "@/components/Navbar/Navbar";
import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockWorks } from "@/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/Marketplace/ProductCard";
import { categories } from "@/data";
import { Copy, Eye } from "lucide-react";
import { Work } from "@/types/work";

export default function WorkPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [work, setWork] = useState<Work | null>(null);
  const [derivativeWorks, setDerivativeWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // const work = useMemo(() => {
  //   return mockWorks.find((w) => w.id === id);
  // }, [id]);

  // const derivativeWorks = useMemo(() => {
  //   if (!work) return [];
  //   return mockWorks.filter((w) => w.parentId && w.parentId.includes(work.id));
  // }, [work]);

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

        // Derivative works 조회 (parentId가 현재 work의 id인 것들)
        if (data.work) {
          const derivativesResponse = await fetch("/api/works");
          const derivativesData = await derivativesResponse.json();
          const derivatives = (derivativesData.works || []).filter(
            (w: Work) => w.parentId && w.parentId.includes(data.work.id)
          );
          setDerivativeWorks(derivatives);
        }
      } catch (error) {
        console.error("Error loading work:", error);
        setWork(null);
      } finally {
        setLoading(false);
      }
    }

    loadWork();
  }, [id]);

  const handleDecrypt = async () => {
    if (!work || hasPaid) return;

    setIsDecrypting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setHasPaid(true);
    setIsDecrypting(false);
  };

  const getImageUri = () => {
    if (!work) return null;
    if (hasPaid && work.blob_uri) {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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

          <div className="flex flex-col gap-6">
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

            <div className="flex flex-wrap items-center gap-2">
              <Badge>{categoryLabel}</Badge>
              {work.metadata.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {work.metadata.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {work.metadata.description}
                </p>
              </div>
            )}

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

            <div className="flex flex-col gap-3 pt-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full mb-5"
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

              {work.licenseOption && (
                <div className="border rounded-[4px] p-4 bg-[#ffcccc]/70">
                  <h3 className="font-semibold mb-2">UseRight Option</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Rule: </span>
                      <span>{work.licenseOption.rule}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Royalty Ratio:{" "}
                      </span>
                      <span>
                        {work.licenseOption.royaltyRatio}% (Creator) /{" "}
                        {100 - work.licenseOption.royaltyRatio}% (You)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
}

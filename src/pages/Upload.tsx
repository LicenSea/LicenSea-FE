import { Navbar } from "@/components/Navbar/Navbar";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LicenseOption } from "@/types/work";
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";
import {
  sealEncrypt,
  uploadToWalrus,
  walrusServices,
  setSelectedWalrusService,
  createWorkObjectTx,
} from "../lib/encrypt-upload";
import { categories } from "@/data";
import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
import { Transaction } from "@mysten/sui/transactions";

const Upload = () => {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId"); // 이 훅이 있다고 가정
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showRawEffects: true, showObjectChanges: true },
      }),
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  const [isDraggingOriginal, setIsDraggingOriginal] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const originalInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    thumbnailFile: null as File | null,
    thumbnailPreview: null as string | null,
    originalFile: null as File | null,
    originalPreview: null as string | null,
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
    tagInput: "",
    originWorks: [] as string[], // 선택된 licenseNFT ID들
    viewType: "free" as "free" | "paid",
    fee: "",
    hasLicenseOption: false,
    licenseOption: null as LicenseOption | null,
    isAdult: false,
  });
  const [selectedWalrus, setSelectedWalrus] = useState(walrusServices[0].id);

  // TODO: 나중에 API로 licenseNFT 목록 불러오기
  const [availableLicenseNFTs, setAvailableLicenseNFTs] = useState<
    Array<{ id: string; title: string; thumbnail?: string }>
  >([]);

  const [licenseForm, setLicenseForm] = useState({
    rule: "",
    price: "",
    royaltyRatio: "",
  });

  // licenseNFT 목록 불러오기
  useEffect(() => {
    // TODO: 실제 API 호출로 교체
    const fetchLicenseNFTs = async () => {
      try {
        // TODO: 실제 API 엔드포인트로 교체
        // const response = await fetch('/api/license-nfts');
        // const data = await response.json();
        // setAvailableLicenseNFTs(data);

        // 임시: 빈 배열 유지 (나중에 API 연동)
        setAvailableLicenseNFTs([]);
      } catch (error) {
        console.error("Failed to fetch license NFTs:", error);
        setAvailableLicenseNFTs([]);
      }
    };
    fetchLicenseNFTs();
  }, []);

  const handleThumbnailSelect = (file: File) => {
    if (file) {
      setFormData({ ...formData, thumbnailFile: file });
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          thumbnailPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOriginalSelect = (file: File) => {
    if (file) {
      setFormData({ ...formData, originalFile: file });
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          originalPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleThumbnailSelect(e.target.files[0]);
    }
  };

  const handleOriginalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleOriginalSelect(e.target.files[0]);
    }
  };

  const handleThumbnailDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumbnail(true);
  }, []);

  const handleThumbnailDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
  }, []);

  const handleThumbnailDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingThumbnail(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleThumbnailSelect(e.dataTransfer.files[0]);
      }
    },
    [formData]
  );

  const handleOriginalDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOriginal(true);
  }, []);

  const handleOriginalDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOriginal(false);
  }, []);

  const handleOriginalDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOriginal(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleOriginalSelect(e.dataTransfer.files[0]);
      }
    },
    [formData]
  );

  const handleRemoveThumbnail = () => {
    setFormData({
      ...formData,
      thumbnailFile: null,
      thumbnailPreview: null,
    });
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleRemoveOriginal = () => {
    setFormData({
      ...formData,
      originalFile: null,
      originalPreview: null,
    });
    if (originalInputRef.current) {
      originalInputRef.current.value = "";
    }
  };

  const handleAddTag = () => {
    if (
      formData.tagInput.trim() &&
      !formData.tags.includes(formData.tagInput.trim())
    ) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: "",
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleToggleOriginWork = (nftId: string) => {
    setFormData({
      ...formData,
      originWorks: formData.originWorks.includes(nftId)
        ? formData.originWorks.filter((id) => id !== nftId)
        : [...formData.originWorks, nftId],
    });
  };

  const handleRemoveOriginWork = (nftId: string) => {
    setFormData({
      ...formData,
      originWorks: formData.originWorks.filter((id) => id !== nftId),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.originalFile) {
      alert("Original file is required.");
      return;
    }

    if (formData.hasLicenseOption) {
      formData.licenseOption = {
        rule: licenseForm.rule,
        price: Number(licenseForm.price),
        royaltyRatio: Number(licenseForm.royaltyRatio),
      };
    }

    setIsUploading(true);

    const moduleName = "work";

    try {
      // --- 1. create Work without originalFile ---
      console.log("Step 1: Creating initial Work object...");
      const createTx = createWorkObjectTx(packageId, moduleName, formData);

      const createResult = await signAndExecute({ transaction: createTx });
      console.log("Work creation transaction successful:", createResult);

      // extract workObjectId and capId from transaction result
      const createdObjects = createResult.objectChanges?.filter(
        (change) => change.type === "created"
      );
      if (!createdObjects || createdObjects.length < 2) {
        throw new Error("Failed to create Work and Cap objects.");
      }
      const workObjectId = createdObjects.find((c) =>
        c.objectType.endsWith("::work::Work")
      )?.objectId;
      const capId = createdObjects.find((c) =>
        c.objectType.endsWith("::work::Cap")
      )?.objectId;

      if (!workObjectId || !capId) {
        throw new Error("Could not find Work or Cap ID in transaction result.");
      }
      console.log(`Work object created: ${workObjectId}`);
      console.log(`Cap object created: ${capId}`);

      // --- 2. encrypt & upload originalFile to Walrus ---
      console.log("Step 2: Encrypting and uploading file...");
      console.log("original file:", formData.originalFile);
      const encryptedData = await sealEncrypt(
        suiClient,
        formData.originalFile,
        packageId,
        workObjectId
      );
      console.log("Encryption complete.");
      console.log("Encrypted data:", encryptedData);

      console.log("Uploading to Walrus...");
      // ===============Need to check=============
      const walrusResponse = await uploadToWalrus(encryptedData);

      // Walrus 응답에서 blobId 추출 (응답 구조에 따라 달라질 수 있음)
      let blobId;
      if (walrusResponse?.info?.newlyCreated?.blobObject?.blobId) {
        blobId = walrusResponse.info.newlyCreated.blobObject.blobId;
      } else if (walrusResponse?.info?.alreadyCertified?.blobId) {
        blobId = walrusResponse.info.alreadyCertified.blobId;
      } else {
        throw new Error("Could not extract blobId from Walrus response.");
      }
      console.log("Upload complete. Blob ID:", blobId);

      // --- 3단계: Work 객체에 blobId 연결 ---
      console.log("Step 3: Associating blobId to Work object...");
      const associateTx = associateBlobIdTx(
        packageId,
        moduleName,
        workObjectId,
        capId,
        blobId
      );

      const associateResult = await signAndExecute({
        transaction: associateTx,
      });
      console.log("Association successful:", associateResult);
      alert(`Upload process complete! Digest: ${associateResult.digest}`);
    } catch (error) {
      console.error("Upload process failed:", error);
      alert(
        `An error occurred: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const renderStepContent = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 왼쪽: 미리보기 영역 */}
        <div className="space-y-6">
          <div className="bg-white rounded-sm border border-gray-300 overflow-hidden">
            <div className="p-4 border-b border-gray-300 bg-gray-50">
              <h2 className="font-galmuri text-base text-gray-900">
                THUMBNAIL
              </h2>
            </div>
            <div className="p-6">
              {formData.thumbnailPreview ? (
                <div className="relative group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    {formData.thumbnailFile?.type.startsWith("image/") ? (
                      <img
                        src={formData.thumbnailPreview}
                        alt="thumbnailPreview"
                        className="w-full h-full object-cover"
                      />
                    ) : formData.thumbnailFile?.type.startsWith("video/") ? (
                      <video
                        src={formData.thumbnailPreview}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`aspect-square rounded-xl border-2 border-dashed transition-colors ${
                    isDraggingThumbnail
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleThumbnailDragOver}
                  onDragLeave={handleThumbnailDragLeave}
                  onDrop={handleThumbnailDrop}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer">
                    <div
                      className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      <UploadIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Drag or click to upload thumbnail
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, GIF, WEBP, MP4, MP3, PDF. max 100MB
                    </p>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      onChange={handleThumbnailChange}
                      accept="image/*,video/*,audio/*,.pdf"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      Select Thumbnail
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-sm border border-gray-300 overflow-hidden">
            <div className="p-4 border-b border-gray-300 bg-gray-50">
              <h2 className="font-galmuri text-base text-gray-900">
                ORIGINAL FILE *
              </h2>
            </div>
            <div className="p-6">
              {formData.originalPreview ? (
                <div className="relative group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    {formData.originalFile?.type.startsWith("image/") ? (
                      <img
                        src={formData.originalPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : formData.originalFile?.type.startsWith("video/") ? (
                      <video
                        src={formData.originalPreview}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveOriginal}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`aspect-square rounded-xl border-2 border-dashed transition-colors ${
                    isDraggingOriginal
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleOriginalDragOver}
                  onDragLeave={handleOriginalDragLeave}
                  onDrop={handleOriginalDrop}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer">
                    <div
                      className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"
                      onClick={() => originalInputRef.current?.click()}
                    >
                      <UploadIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Drag or click to upload original file
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, GIF, WEBP, MP4, MP3, PDF. max 100MB
                    </p>
                    <input
                      ref={originalInputRef}
                      type="file"
                      onChange={handleOriginalChange}
                      accept="image/*,video/*,audio/*,.pdf"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => originalInputRef.current?.click()}
                    >
                      Select Original File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 폼 영역 */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-sm border border-gray-300 overflow-hidden">
              {/* 원본 */}
              <div className="p-4 border-b border-gray-300 bg-gray-50">
                <Label className="font-galmuri text-base">ORIGIN WORK</Label>
              </div>
              <div className="p-4 space-y-3">
                {availableLicenseNFTs.length === 0 ? (
                  <div className="text-sm text-gray-500 py-4 text-center">
                    {/* TODO: API로 licenseNFT 목록 불러오기 */}
                    No license NFTs available.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableLicenseNFTs.map((nft) => (
                      <label
                        key={nft.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <Checkbox
                          checked={formData.originWorks.includes(nft.id)}
                          onCheckedChange={() => handleToggleOriginWork(nft.id)}
                        />
                        {nft.thumbnail && (
                          <img
                            src={nft.thumbnail}
                            alt={nft.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <span className="text-sm text-gray-900 flex-1">
                          {nft.title}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {formData.originWorks.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">
                      Selected ({formData.originWorks.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.originWorks.map((nftId) => {
                        const nft = availableLicenseNFTs.find(
                          (n) => n.id === nftId
                        );
                        return (
                          <span
                            key={nftId}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors"
                          >
                            {nft?.title || nftId}
                            <button
                              type="button"
                              onClick={() => handleRemoveOriginWork(nftId)}
                              className="hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {/* 제목 */}
              <div className="p-4 border-b border-t border-gray-300 bg-gray-50">
                <Label htmlFor="title" className="font-galmuri text-base">
                  TITLE *
                </Label>
              </div>
              <div className="p-4">
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter the title of your work"
                  required
                  className="border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              {/* 설명 */}
              <div className="p-4 border-b border-t border-gray-300 bg-gray-50">
                <Label htmlFor="description" className="text-base font-galmuri">
                  DESCRIPTION *
                </Label>
              </div>
              <div className="p-4">
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter a description of your work"
                  rows={6}
                  required
                  className="border-gray-300 resize-none"
                />
              </div>
              {/* 카테고리 */}
              <div className="p-4 border-b border-t border-gray-300 bg-gray-50">
                <Label htmlFor="category" className="text-base font-galmuri">
                  CATEGORY
                </Label>
              </div>
              <div className="p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="font-medium w-full justify-between border-gray-300 focus:border-primary focus:border-1 hover:bg-white"
                    >
                      {formData.category
                        ? categories.find((c) => c.id === formData.category)
                            ?.label || "Select category"
                        : "Select category"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full bg-white border-gray-300">
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            category: category.id,
                          })
                        }
                        className="hover:!bg-[#a3f9d8]/50"
                      >
                        {category.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* 태그 */}
              <div className="p-4 border-b border-t border-gray-300 bg-gray-50">
                <Label htmlFor="tags" className="text-base font-galmuri">
                  TAG
                </Label>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={formData.tagInput}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tagInput: e.target.value,
                      })
                    }
                    placeholder="Enter a tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="border-gray-300 focus:border-primary"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                    className="border-gray-300 bg-gray-50"
                  >
                    ADD
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-300 overflow-hidden">
              {/* 공개 유형 */}
              <div className="p-4 border-b border-gray-300 bg-gray-50">
                <Label className="text-base font-galmuri">
                  VISIBILITY TYPE
                </Label>
              </div>
              <div className="p-4">
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="viewType"
                      value="free"
                      checked={formData.viewType === "free"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          viewType: e.target.value as "free" | "paid",
                          fee: "0",
                        })
                      }
                      className="w-4 h-4 appearance-none border border-gray-300 rounded-full bg-white checked:border-primary checked:bg-primary relative cursor-pointer transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      free
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="viewType"
                      value="paid"
                      checked={formData.viewType === "paid"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          viewType: e.target.value as "free" | "paid",
                        })
                      }
                      className="w-4 h-4 appearance-none border border-gray-300 rounded-full bg-white checked:border-primary checked:bg-primary relative cursor-pointer transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      paid
                    </span>
                    {formData.viewType === "paid" && (
                      <div className="ml-4 flex gap-2 items-center">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.fee}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fee: e.target.value,
                            })
                          }
                          className="border-gray-300 focus:border-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-600">SUI</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* 라이센스 옵션 */}
            <div className="bg-white rounded-md border border-gray-300 overflow-hidden">
              <div className="p-4 border-b border-gray-300 bg-gray-50">
                <Label className="text-base font-galmuri">LICENSE OPTION</Label>
              </div>
              <div className="p-4 space-y-4">
                {/* 라이선스 옵션 유무 선택 */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="hasLicenseOption"
                      value="false"
                      checked={!formData.hasLicenseOption}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          hasLicenseOption: false,
                          licenseOptions: [], // 없음 선택 시 초기화
                        })
                      }
                      className="w-4 h-4 appearance-none border border-gray-300 rounded-full bg-white checked:border-primary checked:bg-primary relative cursor-pointer transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      None
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="hasLicenseOption"
                      value="true"
                      checked={formData.hasLicenseOption}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          hasLicenseOption: true,
                        })
                      }
                      className="w-4 h-4 appearance-none border border-gray-300 rounded-full bg-white checked:border-primary checked:bg-primary relative cursor-pointer transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Yes
                    </span>
                  </label>
                </div>

                {formData.hasLicenseOption && (
                  <div className="flex flex-col gap-3 text-sm">
                    <label>License rules:</label>
                    <Textarea
                      placeholder="ex. Only for fan art purpose"
                      value={licenseForm.rule}
                      onChange={(e) =>
                        setLicenseForm({
                          ...licenseForm,
                          rule: e.target.value,
                        })
                      }
                      className="border-gray-300 focus:border-primary focus:ring-primary resize-none"
                    />
                    <label>Price (SUI):</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={licenseForm.price}
                      onChange={(e) =>
                        setLicenseForm({
                          ...licenseForm,
                          price: e.target.value,
                        })
                      }
                      className="border-gray-300 focus:border-primary focus:ring-primary"
                    />
                    <label>Creator Royalty (%):</label>
                    <Input
                      type="number"
                      step="1"
                      placeholder="0"
                      value={licenseForm.royaltyRatio}
                      onChange={(e) =>
                        setLicenseForm({
                          ...licenseForm,
                          royaltyRatio: e.target.value,
                        })
                      }
                      className="border-gray-300 focus:border-primary focus:ring-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Adult content verification */}
            {/* <div className="flex items-center gap-3">
              <Label htmlFor="adult-content" className="text-sm font-medium">
                Is this work intended for adults (18+)?
              </Label>
              <Checkbox
                id="adult-content"
                checked={formData.isAdult === true}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAdult: checked === true })
                }
              />
              <span className="text-sm">Yes</span>
            </div> */}

            {/* 제출 버튼 */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-md"
              disabled={
                !formData.originalFile ||
                !formData.title.trim() ||
                !formData.description.trim() ||
                isUploading
              }
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> UPLOADING...
                </>
              ) : (
                "START UPLOAD"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-w-screen min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default Upload;

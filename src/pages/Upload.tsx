import { Navbar } from "@/components/Navbar/Navbar";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { LicenseOption } from "@/types/work";
import {
  Lock,
  Cloud,
  Link as LinkIcon,
  CheckCircle2,
  Loader2,
  Upload as UploadIcon,
  Image as ImageIcon,
  X,
} from "lucide-react";

type UploadStep = "form" | "encrypting" | "uploading" | "minting" | "complete";

const Upload = () => {
  const [currentStep, setCurrentStep] = useState<UploadStep>("form");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    file: null as File | null,
    preview: null as string | null,
    title: "",
    desc: "",
    tags: [] as string[],
    tagInput: "",
    originWorks: [] as string[], // 선택된 licenseNFT ID들
    viewType: "free" as "free" | "paid",
    price: "",
    hasLicenseOption: false,
    licenseOptions: [] as LicenseOption[],
  });

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

  const handleFileSelect = (file: File) => {
    if (file) {
      setFormData({ ...formData, file });
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, preview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [formData]
  );

  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      file: null,
      preview: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  // const handleAddLicense = () => {
  //   if (
  //     licenseForm.name &&
  //     licenseForm.price &&
  //     licenseForm.royaltyCreator &&
  //     licenseForm.royaltyPlatform
  //   ) {
  //     const newLicense: LicenseOption = {
  //       id: Date.now().toString(),
  //       name: licenseForm.name,
  //       price: parseFloat(licenseForm.price),
  //       royaltyRatio: [
  //         parseFloat(licenseForm.royaltyCreator),
  //         parseFloat(licenseForm.royaltyPlatform),
  //       ],
  //     };
  //     setFormData({
  //       ...formData,
  //       licenseOptions: [...formData.licenseOptions, newLicense],
  //     });
  //     setLicenseForm({
  //       name: "",
  //       price: "",
  //       royaltyCreator: "",
  //       royaltyPlatform: "",
  //     });
  //   }
  // };

  const handleRemoveLicense = (id: string) => {
    setFormData({
      ...formData,
      licenseOptions: formData.licenseOptions.filter((opt) => opt.id !== id),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: Seal 암호화
    setCurrentStep("encrypting");
    try {
      // TODO: Seal API 호출
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 2: Walrus 업로드
      setCurrentStep("uploading");
      // TODO: Walrus API 호출
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 3: Chain 업로드
      setCurrentStep("minting");
      // TODO: Chain API 호출
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setCurrentStep("complete");
    } catch (error) {
      console.error("Upload failed:", error);
      setCurrentStep("form");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "encrypting":
        return (
          <div className="text-center py-20">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="font-galmuri text-2xl font-semibold mb-2">
              Seal로 암호화 중...
            </h3>
            <p className="text-[#262d5c]/70">
              창작물을 안전하게 암호화하고 있습니다
            </p>
          </div>
        );
      case "uploading":
        return (
          <div className="text-center py-20">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="font-galmuri text-2xl font-semibold mb-2">
              Walrus에 업로드 중...
            </h3>
            <p className="text-[#262d5c]/70">
              암호화된 창작물을 Walrus에 저장하고 있습니다
            </p>
          </div>
        );
      case "minting":
        return (
          <div className="text-center py-20">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="font-galmuri text-2xl font-semibold mb-2">
              체인에 등록 중...
            </h3>
            <p className="text-[#262d5c]/70">
              블록체인에 창작물을 등록하고 있습니다
            </p>
          </div>
        );
      case "complete":
        return (
          <div className="text-center py-20">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="font-galmuri text-2xl font-semibold mb-2">
              업로드 완료!
            </h3>
            <p className="text-[#262d5c]/70 mb-6">
              창작물이 성공적으로 등록되었습니다
            </p>
            <Button
              onClick={() => {
                setCurrentStep("form");
                setFormData({
                  file: null,
                  preview: null,
                  title: "",
                  desc: "",
                  tags: [],
                  tagInput: "",
                  originWorks: [],
                  viewType: "free",
                  price: "",
                  hasLicenseOption: false,
                  licenseOptions: [],
                });
              }}
            >
              새 창작물 업로드
            </Button>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왼쪽: 미리보기 영역 */}
            <div className="space-y-6">
              <div className="bg-white rounded-sm border border-gray-300 overflow-hidden">
                <div className="p-4 border-b border-gray-300 bg-gray-50">
                  <h2 className="font-galmuri text-base text-gray-900">
                    PREVIEW
                  </h2>
                </div>
                <div className="p-6">
                  {formData.preview ? (
                    <div className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        {formData.file?.type.startsWith("image/") ? (
                          <img
                            src={formData.preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : formData.file?.type.startsWith("video/") ? (
                          <video
                            src={formData.preview}
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
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`aspect-square rounded-xl border-2 border-dashed transition-colors ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer">
                        <div
                          className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <UploadIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Drag or click to upload your file
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          PNG, GIF, WEBP, MP4, MP3, PDF. max 100MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*,video/*,audio/*,.pdf"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Select File
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
                    <Label className="font-galmuri text-base">
                      ORIGIN WORK
                    </Label>
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
                              onCheckedChange={() =>
                                handleToggleOriginWork(nft.id)
                              }
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
                    <Label htmlFor="desc" className="text-base font-galmuri">
                      DESCRIPTION *
                    </Label>
                  </div>
                  <div className="p-4">
                    <Textarea
                      id="desc"
                      value={formData.desc}
                      onChange={(e) =>
                        setFormData({ ...formData, desc: e.target.value })
                      }
                      placeholder="Enter a description of your work"
                      rows={6}
                      required
                      className="border-gray-300 resize-none"
                    />
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
                              price: "0",
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
                              value={formData.price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  price: e.target.value,
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
                    <Label className="text-base font-galmuri">
                      LICENSE OPTION
                    </Label>
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

                {/* 제출 버튼 */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-md"
                  disabled={!formData.file || !formData.title || !formData.desc}
                >
                  START UPLOAD
                </Button>
              </form>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-w-screen min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 단계 표시 */}
          {currentStep !== "form" && currentStep !== "complete" && (
            <div className="mb-8 bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center justify-center gap-6">
                <div
                  className={`flex items-center gap-2 ${
                    currentStep === "encrypting"
                      ? "text-primary"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === "encrypting"
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">암호화</span>
                </div>
                <div className="w-16 h-0.5 bg-gray-200" />
                <div
                  className={`flex items-center gap-2 ${
                    currentStep === "uploading"
                      ? "text-primary"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === "uploading"
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Cloud className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">Walrus 업로드</span>
                </div>
                <div className="w-16 h-0.5 bg-gray-200" />
                <div
                  className={`flex items-center gap-2 ${
                    currentStep === "minting" ? "text-primary" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === "minting"
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">체인 등록</span>
                </div>
              </div>
            </div>
          )}

          {/* 메인 컨텐츠 */}
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default Upload;

import type { Work } from "@/types/work";

// 카테고리 옵션
export const categories = [
  { id: "art", label: "Art" },
  { id: "toon", label: "Toon" },
  { id: "photography", label: "Photography" },
  { id: "music", label: "Music" },
  { id: "video", label: "Video" },
  { id: "writing", label: "Writing" },
  { id: "other", label: "Other" },
];

// Mock work data
export const mockWorks: Work[] = [
  {
    id: "1",
    creator:
      "0xded158cc74a375be0a0e4506d18801bb2355abb38a7d0b4168452a20a32b96d9",
    parentId: null,
    blob_uri:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop",
    metadata: {
      title: "Title",
      description: "desc",
      file_type: "jpeg",
      file_size: 0,
      tags: ["art", "character"],
      category: "art",
      isAdult: false,
    },
    fee: 0,
    licenseOption: {
      work_id: "1",
      rule: "only use for Fanart",
      price: 2,
      royaltyRatio: 20, // ex: 20 (내가 20, 라이센스 구매자가 80)
    },
    derivativeCount: 2,
  },
  {
    id: "2",
    creator:
      "0xded158cc74a375be0a0e4506d18801bb2355abb38a7d0b4168452a20a32b96d9",
    parentId: ["1"],
    blob_uri:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop",
    metadata: {
      title: "Title",
      description:
        "defjaksldj;falksdjf;lkasdjf;asldkjf;aslkdfja;sdklfjsa;dlfkja;lksc",
      file_type: "jpeg",
      file_size: 0,
      tags: ["art", "character"],
      category: "art",
      isAdult: true,
    },
    fee: 0.1,
    licenseOption: null,
  },
  {
    id: "3",
    creator:
      "0xded158cc74a375be0a0e4506d18801bb2355abb38a7d0b4168452a20a32b96d9",
    parentId: ["1"],
    blob_uri: "",
    metadata: {
      title: "Title",
      description:
        "defjaksldj;falksdjf;lkasdjf;asldkjf;aslkdfja;sdklfjsa;dlfkja;lksc",
      file_type: "jpeg",
      file_size: 0,
      tags: ["art", "character"],
      category: "writing",
      isAdult: true,
    },
    fee: 2,
    licenseOption: null,
  },
];

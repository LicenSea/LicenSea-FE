import { SealClient } from "@mysten/seal";
import { SuiClient } from "@mysten/sui/client";
import { fromHex, toHex } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";

export const createWork = (
  packageId: string,
  moduleName: string,
  formData: any
): Transaction => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::${moduleName}::create_work_entry`,
    arguments: [
      // metadata field
      tx.pure.string(formData.title),
      tx.pure.string(formData.description),
      tx.pure.string(formData.originalFile?.type || ""), // file_type
      tx.pure.u64(formData.originalFile?.size || 0), // file_size
      tx.pure.vector("string", formData.tags), // tags
      tx.pure.string(formData.category), // category

      // licenseOptions field
      tx.pure.string(formData.licenseOption?.rule || ""), // rule
      tx.pure.u64(Number(formData.licenseOption?.price || 0) * 1_000_000_000), // price (SUI to MIST)
      tx.pure.u64(formData.licenseOption?.royaltyRatio || 0), // royaltyRatio

      // other fields
      tx.pure.u64(
        (formData.viewType === "paid" ? Number(formData.fee) : 0) *
          1_000_000_000
      ), // fee (SUI to MIST)
    ],
  });
  return tx;
};

export const createWorkWithParent = (
  packageId: string,
  moduleName: string,
  formData: any
): Transaction => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::${moduleName}::create_work_with_parent_entry`,
    arguments: [
      tx.sharedObjectRef(formData.parentWork), // parent work id
      // metadata field
      tx.pure.string(formData.title),
      tx.pure.string(formData.description),
      tx.pure.string(formData.originalFile?.type || ""), // file_type
      tx.pure.u64(formData.originalFile?.size || 0), // file_size
      tx.pure.vector("string", formData.tags), // tags
      tx.pure.string(formData.category), // category

      // licenseOptions field
      tx.pure.string(formData.licenseOption?.rule || ""), // rule
      tx.pure.u64(Number(formData.licenseOption?.price || 0) * 1_000_000_000), // price (SUI to MIST)
      tx.pure.u64(formData.licenseOption?.royaltyRatio || 0), // royaltyRatio

      // other fields
      tx.pure.vector("address", formData.originWorks), // parentId

      // fee (작품 보기 수수료)
      tx.pure.u64(
        (formData.viewType === "paid" ? Number(formData.fee) : 0) *
          1_000_000_000
      ), // fee (SUI to MIST)
    ],
  });
  return tx;
};

// seal encrypt function
export const sealEncrypt = async (
  suiClient: SuiClient,
  file: File,
  packageId: string,
  policyObject: string
): Promise<Uint8Array> => {
  const serverObjectIds = [
    "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
    "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
  ];

  const client = new SealClient({
    suiClient,
    serverConfigs: serverObjectIds.map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  });

  // 파일을 ArrayBuffer로 변환
  const fileBuffer = await file.arrayBuffer();

  // 암호화에 사용할 고유 ID 생성
  const nonce = crypto.getRandomValues(new Uint8Array(5));
  const policyObjectBytes = fromHex(policyObject);
  const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));

  // 파일 암호화
  const { encryptedObject: encryptedBytes } = await client.encrypt({
    threshold: 2,
    packageId,
    id,
    data: new Uint8Array(fileBuffer),
  });

  return encryptedBytes;
};

export const handlePublish = (
  work_id: string,
  cap_id: string,
  packageId: string,
  moduleName: string,
  blobId: string
): Transaction => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::${moduleName}::publish`,
    arguments: [tx.object(work_id), tx.object(cap_id), tx.pure.string(blobId)],
  });

  return tx;
};

//
//
//
//====================Walrus 업로드 함수(백엔드로 이전 예정)====================//

// Walrus 서비스 목록 (실제 운영 URL로 교체해야 합니다)
export const walrusServices = [
  {
    id: "service1",
    name: "walrus.space",

    publisherUrl: "https://walrus.space",
  },
  {
    id: "service2",
    name: "staketab.org",
    publisherUrl: "https://sui.staketab.org/walrus",
  },
];

// 현재 선택된 Walrus 서비스 ID (여기서는 기본값으로 설정)
let selectedServiceId = "service1";

export const setSelectedWalrusService = (serviceId: string) => {
  selectedServiceId = serviceId;
};

const getPublisherUrl = (path: string): string => {
  const service = walrusServices.find((s) => s.id === selectedServiceId);
  if (!service) {
    throw new Error(`Walrus service with id "${selectedServiceId}" not found.`);
  }
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  const baseUrl = service.publisherUrl.endsWith("/")
    ? service.publisherUrl
    : `${service.publisherUrl}/`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * 암호화된 파일을 Walrus에 업로드합니다.
 * @param encryptedData - 암호화된 데이터 (Uint8Array)
 * @returns Walrus 업로드 결과 (blob ID 포함)
 */
export const uploadToWalrus = async (
  encryptedData: Uint8Array
): Promise<any> => {
  const NUM_EPOCH = 1; // TODO: 저장 기간(epoch) 설정
  const response = await fetch(
    getPublisherUrl(`/v1/blobs?epochs=${NUM_EPOCH}`),
    {
      method: "PUT",
      body: encryptedData,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error publishing the blob on Walrus: ${response.status} ${errorText}`
    );
  }

  return response.json();
};

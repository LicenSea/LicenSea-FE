import { SealClient } from "@mysten/seal";
import { SuiClient } from "@mysten/sui/client";
import { fromHex, toHex } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";

type WalrusService = {
  id: string;
  name: string;
  publisherUrl: string;
  aggregatorUrl: string;
};

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

const NUM_EPOCH = 1; // The number of epochs to store the file for

export const services: WalrusService[] = [
  {
    id: "service1",
    name: "walrus.space",
    publisherUrl: "/publisher1",
    aggregatorUrl: "/aggregator1",
  },
  {
    id: "service2",
    name: "staketab.org",
    publisherUrl: "/publisher2",
    aggregatorUrl: "/aggregator2",
  },
  {
    id: "service3",
    name: "redundex.com",
    publisherUrl: "/publisher3",
    aggregatorUrl: "/aggregator3",
  },
  {
    id: "service4",
    name: "nodes.guru",
    publisherUrl: "/publisher4",
    aggregatorUrl: "/aggregator4",
  },
  {
    id: "service5",
    name: "banansen.dev",
    publisherUrl: "/publisher5",
    aggregatorUrl: "/aggregator5",
  },
  {
    id: "service6",
    name: "everstake.one",
    publisherUrl: "/publisher6",
    aggregatorUrl: "/aggregator6",
  },
];

const selectedService = "service1"; // Default selected service

function getAggregatorUrl(path: string): string {
  const service = services.find((s) => s.id === selectedService);
  const cleanPath = path.replace(/^\/+/, "").replace(/^v1\//, "");
  return `${service?.aggregatorUrl}/v1/${cleanPath}`;
}

function getPublisherUrl(path: string): string {
  const service = services.find((s) => s.id === selectedService);
  const cleanPath = path.replace(/^\/+/, "").replace(/^v1\//, "");
  return `${service?.publisherUrl}/v1/${cleanPath}`;
}

/**
 * Encrypts a file using Seal and uploads it to Walrus.
 * @param suiClient - The SuiClient instance.
 * @param file - The file to encrypt and upload.
 * @param packageId - The Sui package ID.
 * @param policyObject - The policy object ID for Seal encryption.
 * @param serviceId - The ID of the Walrus service to use for the upload.
 * @returns The storage information from Walrus.
 */
export const sealAndUpload = async (
  suiClient: SuiClient,
  file: File,
  packageId: string,
  policyObject: string
): Promise<{ info: any }> => {
  // These are the Seal server object IDs on the Sui network.
  const serverObjectIds = [
    "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
    "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
  ];

  const sealClient = new SealClient({
    suiClient,
    serverConfigs: serverObjectIds.map((id) => ({ objectId: id, weight: 1 })),
    verifyKeyServers: false,
  });

  const fileBuffer = await file.arrayBuffer();
  const nonce = crypto.getRandomValues(new Uint8Array(5));
  const policyObjectBytes = fromHex(policyObject);
  const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));

  const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
    threshold: 2,
    packageId,
    id,
    data: new Uint8Array(fileBuffer),
  });

  const response = await fetch(
    `${getPublisherUrl(`/v1/blobs?epochs=${NUM_EPOCH}`)}`,
    {
      method: "PUT",
      body: encryptedBytes,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error publishing the blob on Walrus (status: ${response})`
    );
  }

  const info = await response.json();
  return { info };
};

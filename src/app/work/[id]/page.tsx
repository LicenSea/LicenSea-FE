"use client";

import { Navbar } from "@/components/Navbar/Navbar";
import { WorkImageSection } from "./components/WorkImageSection";
import { WorkDetailsSection } from "./components/WorkDetailsSection";
import { WorkActions } from "./components/WorkActions";
import { DerivativeWorksSection } from "./components/DerivativeWorksSection";
import { WorkNotFound } from "./components/WorkNotFound";
import { useWorkData } from "./hooks/useWorkData";
import { useDerivativeWorks } from "./hooks/useDerivativeWorks";
import { useWorkDecrypt } from "./hooks/useWorkDecrypt";
import { useParams } from "next/navigation";

export default function WorkPage() {
  const params = useParams();
  const id = params?.id as string;

  const { work, loading } = useWorkData(id);
  const { derivativeWorks } = useDerivativeWorks(work?.id || null);
  const {
    isDecrypting,
    handleDecrypt,
    hasPaid,
    hasViewObject,
    decryptedImageUri,
  } = useWorkDecrypt(work);

  if (loading) {
    return (
      <div className="min-w-screen min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return <WorkNotFound />;
  }

  return (
    <div className="min-w-screen min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <WorkImageSection
            work={work}
            hasPaid={hasPaid}
            hasViewObject={hasViewObject}
            decryptedImageUri={decryptedImageUri}
          />
          <div className="flex flex-col gap-6">
            <WorkDetailsSection work={work} />
            <WorkActions
              work={work}
              hasPaid={hasPaid}
              isDecrypting={isDecrypting}
              onDecrypt={handleDecrypt}
            />
          </div>
        </div>

        <DerivativeWorksSection derivativeWorks={derivativeWorks} />
      </div>
    </div>
  );
}

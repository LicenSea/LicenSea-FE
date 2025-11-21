import { ProductCard } from "@/components/Marketplace/ProductCard";
import type { Work } from "@/types/work";

interface DerivativeWorksSectionProps {
  derivativeWorks: Work[];
}

export const DerivativeWorksSection = ({
  derivativeWorks,
}: DerivativeWorksSectionProps) => {
  if (derivativeWorks.length === 0) {
    return null;
  }

  return (
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
  );
};

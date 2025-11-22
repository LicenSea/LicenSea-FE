import { ProductCard } from "@/components/Marketplace/ProductCard";
import type { Work } from "@/types/work";

interface WorksGridProps {
  works: Work[];
  viewMode?: "grid" | "list";
}

export const WorksGrid = ({ works, viewMode = "grid" }: WorksGridProps) => {
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          : "space-y-4"
      }
    >
      {works.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

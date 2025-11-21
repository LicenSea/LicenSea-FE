import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/Marketplace/ProductCard";
import type { Work } from "@/types/work";

interface PurchasedTabProps {
  purchasedWorks: Work[];
}

export const PurchasedTab = ({ purchasedWorks }: PurchasedTabProps) => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Purchased Works</h2>
        <p className="text-muted-foreground">
          {purchasedWorks.length}{" "}
          {purchasedWorks.length === 1 ? "work" : "works"} purchased
        </p>
      </div>

      {purchasedWorks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {purchasedWorks.map((work) => (
            <ProductCard key={work.id} product={work} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
            <p className="text-muted-foreground mb-6">
              Explore the marketplace and purchase works
            </p>
            <Button onClick={() => router.push("/marketplace")}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

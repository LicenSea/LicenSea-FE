import { Heart, Eye, Copy } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { useState } from "react";
import type { Work } from "@/types/work";
import { categories } from "@/data";
import { useNavigate } from "react-router";

interface ProductCardProps {
  product: Work;
  onViewDetails?: (productId: string) => void;
  onWishlistToggle?: (productId: string) => void;
}

// 주소를 축약해서 표시하는 함수
const shortenAddress = (address: string, start = 6, end = 4): string => {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export function ProductCard({
  product,
  onViewDetails,
  onWishlistToggle,
}: ProductCardProps) {
  const nav = useNavigate();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted);
    onWishlistToggle?.(product.id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(product.id);
  };

  const categoryLabel =
    categories.find((c) => c.id === product.metadata.category)?.label ||
    product.metadata.category;
  const hasLicense = product.licenseOption !== null;
  const isDerivative = product.parentId !== null && product.parentId.length > 0;

  return (
    <Card
      className={`py-0 rounded-sm relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
      // className={`py-0 rounded-sm group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      //   isHovered ? "scale-[1.01]" : ""
      // }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => nav(`/work/${product.id}`)}
    >
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-1 overflow-hidden">
          {product.preview_uri ? (
            <img
              src={product.preview_uri}
              alt={product.metadata.title}
              className={`w-full h-60 object-cover transition-transform duration-300${
                // product.metadata.isAdult ? " blur-md" : ""
                product.metadata.isAdult ? " " : ""
              }`}
            />
          ) : (
            <div className="w-full h-60 bg-black flex justify-center items-center text-white">
              No Preview Available
            </div>
          )}

          {/* 왼쪽 상단 */}
          <div className="absolute top-4 left-4 flex gap-2">
            {isDerivative ? (
              <Badge variant="secondary">Derivative</Badge>
            ) : (
              <>
                <Badge variant="secondary">
                  Origin{" "}
                  {product.derivativeCount &&
                    `- ${product.derivativeCount} Derivatives`}
                </Badge>
              </>
            )}
          </div>

          {/* Wishlist Button */}
          {/* <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 h-8 w-8 p-0 transition-all duration-200 ${
              isWishlisted
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-background/80 hover:bg-background"
            }`}
            onClick={handleWishlistClick}
          >
            <Heart
              className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
            />
          </Button> */}

          {/* 오른쪽 상단 */}
          <div className="absolute top-4 right-4 flex gap-2">
            {/* {product.metadata.isAdult && (
              <Badge variant="destructive">18+</Badge>
            )} */}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-2">
            {product.metadata.title}
          </h3>

          {/* Creator */}
          <div className="flex items-center gap-2 mb-4">
            {/* <span className="text-xs text-muted-foreground">by</span> */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono">
                {shortenAddress(product.creator)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(product.creator);
                }}
                title="Copy address"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="text-xs">{categoryLabel}</Badge>
            {product.metadata.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {product.metadata.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{product.metadata.tags.length - 2}
              </span>
            )}
          </div>

          {/* Description */}
          {product.metadata.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {product.metadata.description}
            </p>
          )}

          {/* Stats and Price */}
          <div className="font-galmuri flex items-center justify-between mt-3 pt-3 gap-2">
            {/* VIEW button */}
            <Button className="flex-1" variant="outline" type="button">
              <span>
                VIEW {product.fee > 0 ? `${product.fee} SUI` : "FREE"}
              </span>
            </Button>

            {/* BUY LICENSE NFT button */}
            {/* {hasLicense && (
              <Button
                variant="outline"
                className="flex-1 relative group bg-[#ffcccc] hover:bg-[#ffcccc]/70"
                type="button"
              >
                <span className="group-hover:opacity-0 group-hover:invisible transition-opacity duration-150">
                  BUY LICENSE NFT
                </span>
                <span className="absolute left-0 w-full flex justify-center items-center top-0 h-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150">
                  {product.licenseOption?.price !== undefined
                    ? `${product.licenseOption.price} SUI`
                    : ""}
                </span>
              </Button>
            )} */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

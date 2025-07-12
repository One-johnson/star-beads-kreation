import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/../convex/_generated/dataModel";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { WishlistButton } from "./WishlistButton";
import { Star, ShoppingCart, Heart } from "lucide-react";
import Image from "next/image";

export type ProductCardProps = {
  productId: Id<"products">;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
};

export function ProductCard({ 
  productId, 
  name, 
  description, 
  price, 
  imageUrl, 
  category, 
  rating, 
  reviewCount, 
  stock 
}: ProductCardProps) {
  const addToCart = useMutation(api.authMutations.addToCart);
  const [pending, setPending] = useState(false);
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please log in to add items to cart");
      return;
    }

    setPending(true);
    try {
      await addToCart({
        userId: user.userId,
        product: {
          productId,
          name,
          price,
          quantity: 1,
          imageUrl,
        },
      });
      toast.success(`${name} added to cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="border rounded-lg shadow-sm p-4 flex flex-col bg-white dark:bg-muted relative group">
      {/* Wishlist Button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <WishlistButton productId={productId} />
      </div>

      {/* Product Image */}
      <div className="relative mb-4">
        <Image src={imageUrl} alt={name} width={400} height={192} className="w-full h-48 object-cover rounded" />
        {stock !== undefined && stock <= 5 && stock > 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Only {stock} left!
          </Badge>
        )}
        {stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1">
        {category && (
          <Badge variant="outline" className="text-xs mb-2">
            {category}
          </Badge>
        )}
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{name}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{description}</p>
        
        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-2 mb-2">
            {renderStars(rating)}
            <span className="text-xs text-muted-foreground">
              ({reviewCount || 0})
            </span>
          </div>
        )}
        
        <div className="text-primary font-bold text-xl mb-4">${price.toFixed(2)}</div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={pending || !user || stock === 0}
          variant="default"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {pending ? "Adding..." : stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
} 
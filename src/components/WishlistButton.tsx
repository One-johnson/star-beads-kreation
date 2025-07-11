"use client";

import React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Id } from "@/../convex/_generated/dataModel";

interface WishlistButtonProps {
  productId: Id<"products">;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const { user } = useAuth();
  const isInWishlist = useQuery(api.wishlist.isInWishlist, {
    userId: user?.userId || "placeholder" as Id<"users">,
    productId,
  });
  const addToWishlist = useMutation(api.wishlist.addToWishlist);
  const removeFromWishlist = useMutation(api.wishlist.removeFromWishlist);

  if (!user) {
    return null;
  }

  const handleToggleWishlist = async () => {
    if (!user) return;

    try {
      if (isInWishlist) {
        await removeFromWishlist({
          userId: user.userId,
          productId,
        });
      } else {
        await addToWishlist({
          userId: user.userId,
          productId,
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleWishlist}
      className={className}
    >
      <Heart
        className={`w-4 h-4 ${
          isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"
        }`}
      />
    </Button>
  );
} 
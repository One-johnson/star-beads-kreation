"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReviewSection } from "@/components/ReviewSection";
import { WishlistButton } from "@/components/WishlistButton";
import { ProductGrid } from "@/components/ProductGrid";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import Link from "next/link";
import { Id } from "@/../convex/_generated/dataModel";
import Image from "next/image";

interface ProductPageProps {
  params: Promise<{
    productId: Id<"products">;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { user } = useAuth();
  const unwrappedParams = React.use(params);
  const product = useQuery(api.products.getProductById, { id: unwrappedParams.productId });
  const relatedProducts = useQuery(api.products.getRelatedProducts, { 
    productId: unwrappedParams.productId,
    limit: 4 
  });
  const addToCart = useMutation(api.authMutations.addToCart);

  const handleAddToCart = async () => {
    if (!user || !product) return;

    try {
      await addToCart({
        userId: user.userId,
        product: {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      });
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (product === undefined) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          Product not found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Back Button */}
      <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="relative">
          <Image src={product.imageUrl} alt={product.name} width={400} height={400} className="w-full h-auto object-cover rounded" />
          <div className="absolute top-4 right-4">
            <WishlistButton productId={product._id} />
          </div>
          {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
            <Badge variant="destructive" className="absolute top-4 left-4">
              Only {product.stock} left!
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="destructive" className="absolute top-4 left-4">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
            )}
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                {renderStars(product.rating)}
                <span className="text-muted-foreground">
                  {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            )}
            <p className="text-2xl font-bold text-primary mb-4">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock Status */}
          {product.stock !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Availability:</span>
              {product.stock > 0 ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  In Stock ({product.stock} available)
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!user || product.stock === 0}
              className="flex-1"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>

          {/* Product Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-12">
        <ReviewSection productId={product._id} />
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <ProductGrid products={relatedProducts.map(p => ({
            productId: p._id,
            name: p.name,
            description: p.description,
            price: p.price,
            imageUrl: p.imageUrl,
            category: p.category || undefined,
            rating: p.rating || undefined,
            reviewCount: p.reviewCount || undefined,
            stock: p.stock || undefined,
          }))} />
        </div>
      )}
    </div>
  );
}

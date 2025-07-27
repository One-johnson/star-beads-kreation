"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Upload, 
  Package,
  DollarSign,
  Tag,
  Hash,
  Save,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function EditProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  
  const product = useQuery(api.products.getProductById, { id: productId as any });
  const updateProduct = useMutation(api.products.updateProduct);
  const categories = useQuery(api.categories.getCategories, {});
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    stock: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Admin check
  if (user === undefined) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  // Load product data when available
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        imageUrl: product.imageUrl || "",
        category: product.category || "",
        stock: product.stock?.toString() || "",
        tags: product.tags || [],
      });
      setIsLoading(false);
    }
  }, [product]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.imageUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const stock = parseInt(formData.stock) || 0;
    if (stock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProduct({
        id: productId as any,
        name: formData.name,
        description: formData.description,
        price: price,
        imageUrl: formData.imageUrl,
        category: formData.category || undefined,
        stock: stock,
        tags: formData.tags,
      });

      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-muted-foreground">
          Product not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">
            Update product information and settings
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your product..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        placeholder="0.00"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => handleInputChange("stock", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image URL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Product Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL *</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                
                {formData.imageUrl && (
                  <div className="space-y-2">
                    <Label>Image Preview</Label>
                    <div className="border rounded-lg p-4">
                      <Image
                        src={formData.imageUrl}
                        alt="Product preview"
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover rounded-md"
                        unoptimized={true}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newTag">Add Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newTag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter a tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="space-y-2">
                    <Label>Current Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          <Hash className="w-3 h-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.length ? (
                      categories.map(cat => (
                        <SelectItem key={cat._id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="all" disabled>No categories found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card>
              <CardHeader>
                <CardTitle>Product Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product ID:</span>
                  <span className="font-mono" title={product._id}>
                    {product._id.length > 13 ? product._id.slice(0, 13) + '…' : product._id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Product
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push("/admin/products")}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Update stock levels regularly</p>
                <p>• Keep descriptions current</p>
                <p>• Use relevant tags for search</p>
                <p>• Ensure image URLs are valid</p>
                <p>• Review pricing periodically</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
} 
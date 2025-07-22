"use client";

import React, { useState } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
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
  Hash
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Id } from "@/../convex/_generated/dataModel";
import Image from "next/image";

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const createProduct = useMutation(api.products.createProduct);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const getStorageUrl = useMutation(api.products.getStorageUrl);
  const adminStoreImageFromUrl = useAction(api.products.adminStoreImageFromUrl);
  const deleteById = useMutation(api.products.deleteById);
  const categories = useQuery(api.categories.getCategories, {});
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    stock: "",
    tags: [] as string[],
    storageId: "" as string,
  });
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [storingFromUrl, setStoringFromUrl] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [imageWarning, setImageWarning] = useState("");

  // Admin check
  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "imageUrl") {
      setFormData(prev => ({ ...prev, [field]: value }));
      checkImageSize(value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // 1. Get upload URL from Convex
      const postUrl = await generateUploadUrl();
      // 2. POST file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      // 3. Get the proper URL using Convex storage.getUrl()
      const imageUrl = await getStorageUrl({ storageId });
      if (imageUrl) {
        setFormData(prev => ({ 
          ...prev, 
          imageUrl: imageUrl as string,
          storageId: storageId
        }));
        checkImageSize(imageUrl as string);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to get image URL");
      }
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleStoreFromUrl = async () => {
    if (!formData.imageUrl || !user) return;
    setStoringFromUrl(true);
    try {
      const storageId = await adminStoreImageFromUrl({ imageUrl: formData.imageUrl, adminId: user.userId });
      const imageUrl = await getStorageUrl({ storageId });
      if (imageUrl) {
        setFormData(prev => ({ 
          ...prev, 
          imageUrl: imageUrl as string,
          storageId: storageId
        }));
        checkImageSize(imageUrl as string);
        toast.success("Image stored from URL successfully!");
      } else {
        toast.error("Failed to get image URL");
      }
    } catch (err) {
      toast.error("Failed to store image from URL");
    } finally {
      setStoringFromUrl(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!formData.storageId || !user) return;
    setDeletingImage(true);
    try {
      await deleteById({ storageId: formData.storageId as Id<"_storage"> });
      setFormData(prev => ({ ...prev, imageUrl: "", storageId: "" }));
      setImageWarning("");
      toast.success("Image deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete image");
    } finally {
      setDeletingImage(false);
    }
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
      await createProduct({
        name: formData.name,
        description: formData.description,
        price: price,
        imageUrl: formData.imageUrl,
        category: formData.category || undefined,
        stock: stock,
        tags: formData.tags,
      });

      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Failed to create product");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkImageSize = (url: string) => {
    if (!url) {
      setImageWarning("");
      return;
    }
    const img = new window.Image();
    img.onload = function () {
      if (img.naturalWidth < 300 || img.naturalHeight < 300) {
        setImageWarning(
          `Warning: Image is small (${img.naturalWidth}x${img.naturalHeight}). For best results, use images at least 300x300px.`
        );
      } else {
        setImageWarning("");
      }
    };
    img.onerror = function () {
      setImageWarning("Could not load image to check size.");
    };
    img.src = url;
  };

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
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new bead product for your store
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

            {/* Image URL & Upload */}
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
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    {user?.role === "admin" && formData.imageUrl && /^https?:\/\//.test(formData.imageUrl) && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleStoreFromUrl}
                        disabled={storingFromUrl}
                      >
                        {storingFromUrl ? "Storing..." : "Store from URL"}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUpload">Or Upload Image</Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  {uploading && <div className="text-xs text-muted-foreground">Uploading...</div>}
                </div>
                {formData.imageUrl && (
                  <div className="space-y-2">
                    <Label>Image Preview</Label>
                    <div className="border rounded-lg p-4 relative">
                      <Image
                        src={formData.imageUrl}
                        alt="Product preview"
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover rounded-md"
                        unoptimized={true}
                      />
                     {user?.role === "admin" && formData.storageId && (
                       <Button
                         type="button"
                         size="sm"
                         variant="destructive"
                         className="absolute top-2 right-2"
                         onClick={handleDeleteImage}
                         disabled={deletingImage}
                       >
                         {deletingImage ? "Deleting..." : "Delete Image"}
                       </Button>
                     )}
                    </div>
                    {imageWarning && (
                      <div className="text-sm text-yellow-600 mt-2">{imageWarning}</div>
                    )}
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
                  {isSubmitting ? "Creating..." : "Create Product"}
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
                <p>• Use descriptive product names</p>
                <p>• Include detailed descriptions</p>
                <p>• Add relevant tags for search</p>
                <p>• Use high-quality images</p>
                <p>• Set appropriate stock levels</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
} 
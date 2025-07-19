"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Package,
  Save,
  Loader2,
  CheckSquare,
  Square,
  AlertTriangle,
  TrendingUp,
  Trash2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BulkOperationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const products = useQuery(api.products.listProducts);
  const bulkUpdateStock = useMutation(api.products.bulkUpdateStock);
  const bulkDeleteProducts = useMutation(api.products.bulkDeleteProducts);
  
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [operation, setOperation] = useState("stock");
  const [stockValue, setStockValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleSelectAll = () => {
    if (selectedProducts.length === products?.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products?.map(p => p._id) || []);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkUpdate = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    if (operation === "stock" && (!stockValue || isNaN(parseInt(stockValue)))) {
      toast.error("Please enter a valid stock value");
      return;
    }

    if (operation === "category" && !categoryValue) {
      toast.error("Please select a category");
      return;
    }

    if (operation === "delete") {
      setShowDeleteDialog(true);
      return;
    }

    setIsSubmitting(true);

    try {
      if (operation === "stock") {
        const updates = selectedProducts.map(id => ({
          id: id as any,
          stock: parseInt(stockValue)
        }));
        
        await bulkUpdateStock({ updates });
        toast.success(`Updated stock for ${selectedProducts.length} products`);
      }
      
      // Reset form
      setSelectedProducts([]);
      setStockValue("");
      setCategoryValue("");
      setOperation("stock");
      
    } catch (error) {
      toast.error("Failed to update products");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    setIsSubmitting(true);

    try {
      await bulkDeleteProducts({ productIds: selectedProducts as any });
      toast.success(`Deleted ${selectedProducts.length} products`);
      
      // Reset form
      setSelectedProducts([]);
      setShowDeleteDialog(false);
      
    } catch (error) {
      toast.error("Failed to delete products");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedCategories = [
    "Necklaces",
    "Bracelets", 
    "Earrings",
    "Rings",
    "Anklets",
    "Hair Accessories",
    "Keychains",
    "Wall Art",
    "Other"
  ];

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (stock <= 5) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Bulk Operations</h1>
          <p className="text-muted-foreground">
            Update multiple products at once
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Operations Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Operation Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Operation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Update Stock</SelectItem>
                  <SelectItem value="category">Update Category</SelectItem>
                  <SelectItem value="delete">Delete Products</SelectItem>
                </SelectContent>
              </Select>

              {operation === "stock" && (
                <div className="space-y-2">
                  <Label htmlFor="stockValue">New Stock Level</Label>
                  <Input
                    id="stockValue"
                    type="number"
                    min="0"
                    value={stockValue}
                    onChange={(e) => setStockValue(e.target.value)}
                    placeholder="Enter stock quantity"
                  />
                </div>
              )}

              {operation === "category" && (
                <div className="space-y-2">
                  <Label htmlFor="categoryValue">New Category</Label>
                  <Select value={categoryValue} onValueChange={setCategoryValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {operation === "delete" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-yellow-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>This action cannot be undone</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleBulkUpdate}
                className="w-full"
                disabled={isSubmitting || selectedProducts.length === 0}
                variant={operation === "delete" ? "destructive" : "default"}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {operation === "delete" ? "Deleting..." : "Updating..."}
                  </>
                ) : (
                  <>
                    {operation === "delete" ? (
                      <Trash2 className="w-4 h-4 mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {operation === "delete" 
                      ? `Delete ${selectedProducts.length} Products`
                      : `Update ${selectedProducts.length} Products`
                    }
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Selection Info */}
          <Card>
            <CardHeader>
              <CardTitle>Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Selected:</span>
                <span className="font-medium">{selectedProducts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-medium">{products?.length || 0}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
                className="w-full"
              >
                {selectedProducts.length === products?.length ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Products ({products?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products?.map((product) => {
                  const stockStatus = getStockStatus(product.stock || 0);
                  const isSelected = selectedProducts.includes(product._id);
                  
                  return (
                    <div 
                      key={product._id} 
                      className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectProduct(product._id)}
                    >
                      <Checkbox 
                        checked={isSelected}
                        onChange={() => handleSelectProduct(product._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-md object-cover"
                        unoptimized={true}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.category || "Uncategorized"}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">${product.price.toFixed(2)}</div>
                        <Badge variant={stockStatus.variant} className="text-xs">
                          {product.stock || 0} in stock
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                
                {(!products || products.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}? 
              This action cannot be undone and will permanently remove the selected products from your store.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
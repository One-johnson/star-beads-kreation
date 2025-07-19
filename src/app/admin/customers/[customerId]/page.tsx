"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  User,
  DollarSign,
  ShoppingCart,
  Calendar,
  Crown,
  Star,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CustomerDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;
  
  const customer = useQuery(api.customers.getCustomerById, { customerId: customerId as any });
  const customerOrders = useQuery(api.customers.getCustomerOrderHistory, { customerId: customerId as any });
  const updateCustomer = useMutation(api.customers.updateCustomer);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    contact: "",
    role: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

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

  if (!customer) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  const getCustomerSegment = (totalSpent: number, totalOrders: number) => {
    if (totalSpent >= 500) return { label: "VIP", variant: "default" as const, icon: Crown, color: "text-purple-600" };
    if (totalSpent >= 100) return { label: "Regular", variant: "secondary" as const, icon: Star, color: "text-blue-600" };
    if (totalOrders > 0) return { label: "New", variant: "outline" as const, icon: User, color: "text-green-600" };
    return { label: "Inactive", variant: "destructive" as const, icon: User, color: "text-red-600" };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
      processing: { label: "Processing", variant: "default" as const, icon: Package },
      shipped: { label: "Shipped", variant: "default" as const, icon: Truck },
      delivered: { label: "Delivered", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelled", variant: "destructive" as const, icon: AlertCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleUpdateCustomer = async () => {
    setIsUpdating(true);
    try {
      await updateCustomer({
        customerId: customer._id,
        name: editForm.name || undefined,
        email: editForm.email || undefined,
        contact: editForm.contact || undefined,
        role: editForm.role === "admin" || editForm.role === "customer" ? editForm.role as "admin" | "customer" : undefined,
      });
      toast.success("Customer updated successfully");
      setEditDialogOpen(false);
      setEditForm({ name: "", email: "", contact: "", role: "" });
    } catch (error) {
      toast.error("Failed to update customer");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditDialog = () => {
    setEditForm({
      name: customer.name,
      email: customer.email,
      contact: customer.contact || "",
      role: customer.role,
    });
    setEditDialogOpen(true);
  };

  const segment = getCustomerSegment(customer.analytics.totalSpent, customer.analytics.totalOrders);
  const Icon = segment.icon;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">
            Customer details and analytics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Customer Analytics</span>
                <Badge variant={segment.variant} className="flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  {segment.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{customer.analytics.totalOrders}</div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${customer.analytics.totalSpent.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">${customer.analytics.averageOrderValue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Average Order</div>
                </div>
              </div>
              
              {customer.analytics.lastOrderDate && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">Last Order</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(customer.analytics.lastOrderDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {customerOrders && customerOrders.length > 0 ? (
                <div className="space-y-4">
                  {customerOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">Order #{order._id.slice(-8)}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.length} items • {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${order.total.toFixed(2)}</div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No orders yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Customer Info</span>
                <Button variant="outline" size="sm" onClick={openEditDialog}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <div className="text-sm">{customer.name}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <div className="text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {customer.email}
                </div>
              </div>
              {customer.contact && (
                <div>
                  <Label className="text-sm font-medium">Contact</Label>
                  <div className="text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {customer.contact}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <Badge variant={customer.role === "admin" ? "default" : "secondary"}>
                  {customer.role}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Member Since</Label>
                <div className="text-sm">{new Date(customer.createdAt).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={openEditDialog}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Customer
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                asChild
              >
                <Link href={`/admin/orders?customer=${customer.email}`}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Orders
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.print()}
              >
                <Save className="w-4 h-4 mr-2" />
                Print Details
              </Button>
            </CardContent>
          </Card>

          {/* Customer Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer ID:</span>
                <span className="font-mono">{customer._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orders:</span>
                <span>{customer.analytics.totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Spent:</span>
                <span>${customer.analytics.totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Order:</span>
                <span>${customer.analytics.averageOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Segment:</span>
                <span>{segment.label}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information for {customer.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Customer email"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact</Label>
              <Input
                value={editForm.contact}
                onChange={(e) => setEditForm(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCustomer} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Customer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
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
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function OrderDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const order = useQuery(api.orders.getOrderById, { orderId: orderId as any });
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);
  const addTrackingNumber = useMutation(api.orders.addTrackingNumber);
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
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

  if (!order) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      processing: { label: "Processing", variant: "default" as const, icon: Package, color: "text-blue-600" },
      shipped: { label: "Shipped", variant: "default" as const, icon: Truck, color: "text-purple-600" },
      delivered: { label: "Delivered", variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      cancelled: { label: "Cancelled", variant: "destructive" as const, icon: AlertCircle, color: "text-red-600" },
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

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    
    setIsUpdating(true);
    try {
      await updateOrderStatus({
        orderId: order._id,
        status: newStatus as any,
      });
      toast.success("Order status updated successfully");
      setStatusDialogOpen(false);
      setNewStatus("");
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!trackingNumber) return;
    
    setIsUpdating(true);
    try {
      await addTrackingNumber({
        orderId: order._id,
        trackingNumber,
        carrier: carrier || undefined,
      });
      toast.success("Tracking number added successfully");
      setTrackingDialogOpen(false);
      setTrackingNumber("");
      setCarrier("");
    } catch (error) {
      toast.error("Failed to add tracking number");
    } finally {
      setIsUpdating(false);
    }
  };

  const carriers = [
    "USPS",
    "FedEx", 
    "UPS",
    "DHL",
    "Amazon Logistics",
    "Other"
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Order #{order._id.slice(-8)}</h1>
          <p className="text-muted-foreground">
            Order details and management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Status</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setStatusDialogOpen(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                  {order.status === "shipped" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setTrackingDialogOpen(true)}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Add Tracking
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {getStatusBadge(order.status)}
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              
              {order.trackingNumber && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">Tracking Information</div>
                  <div className="text-sm text-muted-foreground">
                    {order.carrier && `${order.carrier}: `}{order.trackingNumber}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-md object-cover"
                      unoptimized={true}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <div className="text-sm">{order.shippingInfo.fullName}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="text-sm flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {order.shippingInfo.email}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <div className="text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {order.shippingInfo.phone}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Country</Label>
                  <div className="text-sm">{order.shippingInfo.country}</div>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Address</Label>
                  <div className="text-sm">
                    {order.shippingInfo.address}<br />
                    {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Order ID</span>
                <span className="font-mono text-sm">#{order._id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Time</span>
                <span className="text-sm">{new Date(order.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Items</span>
                <span className="text-sm">{order.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-medium">${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.user ? (
                <>
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <div className="text-sm">{order.user.name}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="text-sm">{order.user.email}</div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Customer information not available
                </div>
              )}
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
                onClick={() => setStatusDialogOpen(true)}
              >
                <Package className="w-4 h-4 mr-2" />
                Update Status
              </Button>
              {order.status === "shipped" && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setTrackingDialogOpen(true)}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Add Tracking
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.print()}
              >
                <Save className="w-4 h-4 mr-2" />
                Print Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order #{order._id.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={!newStatus || isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tracking Number Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tracking Number</DialogTitle>
            <DialogDescription>
              Add tracking information for order #{order._id.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Carrier</Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map(carrierOption => (
                    <SelectItem key={carrierOption} value={carrierOption}>
                      {carrierOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tracking Number</Label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTrackingUpdate} disabled={!trackingNumber || isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Tracking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
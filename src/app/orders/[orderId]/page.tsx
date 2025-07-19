"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Truck } from "lucide-react";
import Link from "next/link";
import { Id } from "@/../convex/_generated/dataModel";
import Image from "next/image";

interface OrderPageProps {
  params: Promise<{
    orderId: Id<"orders">;
  }>;
}

export default function OrderPage({ params }: OrderPageProps) {
  const { user } = useAuth();
  
  const unwrappedParams = React.use(params);
  const order = useQuery(api.authQueries.getOrderById, { orderId: unwrappedParams.orderId });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          You must be logged in to view orders.
        </div>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          Order not found.
        </div>
      </div>
    );
  }

  // Verify the order belongs to the current user
  if (order.userId !== user.userId) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          You don&apos;t have permission to view this order.
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Package className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We&apos;ll send you updates as your order progresses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-mono">{order._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={getStatusColor(order.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="font-medium">{order.shippingInfo.fullName}</div>
            <div className="text-muted-foreground">{order.shippingInfo.email}</div>
            <div className="text-muted-foreground">{order.shippingInfo.phone}</div>
            <div className="text-muted-foreground">{order.shippingInfo.address}</div>
            <div className="text-muted-foreground">
              {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
            </div>
            <div className="text-muted-foreground">{order.shippingInfo.country}</div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item: { productId: string; name: string; price: number; quantity: number; imageUrl: string }) => (
              <div key={item.productId} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium text-lg">{item.name}</div>
                  <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                </div>
                <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mt-8">
        <Button asChild variant="outline">
          <Link href="/orders">
            View All Orders
          </Link>
        </Button>
        <Button asChild>
          <Link href="/products">
            Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  );
} 
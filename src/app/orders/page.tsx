"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function OrdersPage() {
  const { user } = useAuth();
  
  const orders = useQuery(
    api.authQueries.getUserOrders,
    user?.userId ? { userId: user.userId } : "skip"
  );

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          You must be logged in to view your orders.
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
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      
      {orders === undefined ? (
        <div className="text-center">Loading order history...</div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your order history here.
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order: {
            _id: string;
            createdAt: number;
            status: string;
            total: number;
            items: Array<{
              productId: string;
              name: string;
              price: number;
              quantity: number;
              imageUrl: string;
            }>;
            shippingInfo: {
              fullName: string;
              address: string;
              city: string;
              state: string;
              zipCode: string;
              country: string;
            };
          }) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </Badge>
                    <div className="text-right">
                      <div className="font-bold text-lg">${order.total.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="text-sm text-muted-foreground">
                      <div>{order.shippingInfo.fullName}</div>
                      <div>{order.shippingInfo.address}</div>
                      <div>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</div>
                      <div>{order.shippingInfo.country}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item: {
                        productId: string;
                        name: string;
                        price: number;
                        quantity: number;
                        imageUrl: string;
                      }, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Image src={item.imageUrl} alt={item.name} width={32} height={32} className="w-8 h-8 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.name}</div>
                            <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/orders/${order._id}`}>
                      View Order Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Package, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Id } from "@/../convex/_generated/dataModel";

export default function BulkOrderOperationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const orders = useQuery(api.orders.getAllOrdersWithUsers);
  const bulkUpdateOrderStatus = useMutation(api.orders.bulkUpdateOrderStatus);
  const bulkDeleteOrders = useMutation(api.orders.bulkDeleteOrders);

  const [selectedOrders, setSelectedOrders] = useState<Id<"orders">[]>([]);
  const [operation, setOperation] = useState("status");
  const [statusValue, setStatusValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

 const handleBulkUpdate = async () => {
   if (selectedOrders.length === 0 || !statusValue) return;
   setIsSubmitting(true);
   try {
     const validOrderIds = selectedOrders.filter(
       (orderId) => orderId !== undefined
     );
     if (validOrderIds.length === 0) {
       toast.error("No valid order IDs selected");
       return;
     }
     await bulkUpdateOrderStatus({
       orderIds: validOrderIds,
       status: statusValue as
         | "pending"
         | "processing"
         | "shipped"
         | "delivered"
         | "cancelled",
     });
     toast.success("Order status updated successfully");
     setSelectedOrders([]);
     setStatusValue("");
   } catch (error) {
     toast.error("Failed to update order status");
   } finally {
     setIsSubmitting(false);
   }
 };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    setIsSubmitting(true);
    try {
      await bulkDeleteOrders({ orderIds: selectedOrders });
      toast.success("Orders deleted successfully");
      setSelectedOrders([]);
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete orders");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>
      <div className="mt-4 mb-2">
        <h1 className="text-3xl font-bold">Bulk Order Operations</h1>
        <p className="text-muted-foreground">
          Select orders to update status or delete in bulk.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Update Status</SelectItem>
                <SelectItem value="delete">Delete Orders</SelectItem>
              </SelectContent>
            </Select>
            {operation === "status" && (
              <Select value={statusValue} onValueChange={setStatusValue}>
                <SelectTrigger className="w-40">
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
            )}
            <Button
              variant={operation === "delete" ? "destructive" : "default"}
              disabled={
                selectedOrders.length === 0 ||
                (operation === "status" && !statusValue) ||
                isSubmitting
              }
              onClick={
                operation === "delete"
                  ? () => setShowDeleteDialog(true)
                  : handleBulkUpdate
              }
            >
              {operation === "delete" ? (
                <Trash2 className="w-4 h-4 mr-2" />
              ) : (
                <Package className="w-4 h-4 mr-2" />
              )}
              {operation === "delete" ? "Delete Selected" : "Update Status"}
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order: any) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order._id)}
                        onCheckedChange={(checked) => {
                          setSelectedOrders((prev) =>
                            checked
                              ? [...prev, order._id]
                              : prev.filter((id) => id !== order._id)
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      #{order._id.slice(-8)}
                    </TableCell>
                    <TableCell>{order.shippingInfo.fullName}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>{order.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete {selectedOrders.length} selected
            orders? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isSubmitting}
            >
              Delete Orders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

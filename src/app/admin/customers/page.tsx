"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Eye,
  User,
  DollarSign,
  ShoppingCart,
  Calendar,
  Crown,
  Star,
  Users,
  TrendingUp,
  Filter,
  Mail,
  Phone,
  ArrowLeft,
  Plus,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function AdminCustomersPage() {
  const { user } = useAuth();
  const [showAdmins, setShowAdmins] = useState(false);
  const customers = useQuery(api.customers.getAllCustomersWithAnalytics, {
    includeAdmins: showAdmins,
  });
  const customerStats = useQuery(api.customers.getCustomerStats, {
    period: "month",
  });
  const updateCustomer = useMutation(api.customers.updateCustomer);
  const deleteCustomer = useMutation(api.customers.deleteCustomer);
 const createCustomer = useMutation(api.customers.createCustomer);

  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    contact: "",
    role: "",
  });

 

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    contact: "",
    role: "customer",
  });

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

  // Filter and sort customers
  const filteredCustomers =
    customers
      ?.filter((customer) => {
        const matchesSearch =
          searchQuery === "" ||
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer.contact &&
            customer.contact.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRole =
          roleFilter === "" ||
          roleFilter === "all" ||
          customer.role === roleFilter;

        const matchesSegment =
          segmentFilter === "" ||
          (() => {
            const totalSpent = customer.analytics.totalSpent;
            if (segmentFilter === "vip") return totalSpent >= 500;
            if (segmentFilter === "regular")
              return totalSpent >= 100 && totalSpent < 500;
            if (segmentFilter === "new")
              return customer.analytics.totalOrders > 0 && totalSpent < 100;
            if (segmentFilter === "inactive")
              return customer.analytics.totalOrders === 0;
            return true;
          })();

        return matchesSearch && matchesRole && matchesSegment;
      })
      .sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case "name":
            aValue = a.name;
            bValue = b.name;
            break;
          case "email":
            aValue = a.email;
            bValue = b.email;
            break;
          case "totalOrders":
            aValue = a.analytics.totalOrders;
            bValue = b.analytics.totalOrders;
            break;
          case "totalSpent":
            aValue = a.analytics.totalSpent;
            bValue = b.analytics.totalSpent;
            break;
          default:
            aValue = a.createdAt;
            bValue = b.createdAt;
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      }) || [];

  // Calculate stats
  const totalCustomers = customers?.length || 0;
  const customersWithOrders =
    customers?.filter((c) => c.analytics.totalOrders > 0).length || 0;
  const totalRevenue =
    customers?.reduce((sum, c) => sum + c.analytics.totalSpent, 0) || 0;
  const averageOrderValue =
    customersWithOrders > 0 ? totalRevenue / customersWithOrders : 0;

  const getCustomerSegment = (totalSpent: number, totalOrders: number) => {
    if (totalSpent >= 500)
      return { label: "VIP", variant: "default" as const, icon: Crown };
    if (totalSpent >= 100)
      return { label: "Regular", variant: "secondary" as const, icon: Star };
    if (totalOrders > 0)
      return { label: "New", variant: "outline" as const, icon: User };
    return { label: "Inactive", variant: "destructive" as const, icon: User };
  };

  const handleEditCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      await updateCustomer({
        customerId: selectedCustomer._id,
        name: editForm.name || undefined,
        email: editForm.email || undefined,
        contact: editForm.contact || undefined,
        role:
          editForm.role === "admin" || editForm.role === "customer"
            ? (editForm.role as "admin" | "customer")
            : undefined,
      });
      toast.success("Customer updated successfully");
      setEditDialogOpen(false);
      setSelectedCustomer(null);
      setEditForm({ name: "", email: "", contact: "", role: "" });
    } catch (error) {
      toast.error("Failed to update customer");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      await deleteCustomer({ customerId: selectedCustomer._id });
      toast.success("Customer deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast.error("Failed to delete customer");
    }
  };

  const openEditDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name,
      email: customer.email,
      contact: customer.contact || "",
      role: customer.role,
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Link href="/admin/customers/bulk">
              <Users className="w-4 h-4 mr-2" />
              Bulk Operations
            </Link>
          </Button>
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>
      <div className="mt-4 mb-2">
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <p className="text-muted-foreground">
          Manage your customers, segmentation, and analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {customerStats?.newCustomers || 0} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {customersWithOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCustomers > 0
                ? Math.round((customersWithOrders / totalCustomers) * 100)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              ${averageOrderValue.toFixed(2)} avg per customer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {customers?.filter((c) => c.analytics.totalSpent >= 500).length ||
                0}
            </div>
            <p className="text-xs text-muted-foreground">$500+ spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filters & Search</span>
            <div className="flex items-center gap-2">
              <Label htmlFor="show-admins" className="text-sm">
                Show Admins
              </Label>
              <input
                id="show-admins"
                type="checkbox"
                checked={showAdmins}
                onChange={(e) => setShowAdmins(e.target.checked)}
                className="rounded border-gray-300"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All {showAdmins ? "Users" : "Customers"}
                </SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                {showAdmins && <SelectItem value="admin">Admin</SelectItem>}
              </SelectContent>
            </Select>

            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Segments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="vip">VIP ($500+)</SelectItem>
                <SelectItem value="regular">Regular ($100-$499)</SelectItem>
                <SelectItem value="new">New ($1-$99)</SelectItem>
                <SelectItem value="inactive">Inactive (No Orders)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="totalSpent-desc">Highest Spent</SelectItem>
                <SelectItem value="totalOrders-desc">Most Orders</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setSegmentFilter("");
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {showAdmins ? "Users" : "Customers"} ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{showAdmins ? "User" : "Customer"}</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No {showAdmins ? "users" : "customers"} found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => {
                    const segment = getCustomerSegment(
                      customer.analytics.totalSpent,
                      customer.analytics.totalOrders
                    );
                    const Icon = segment.icon;

                    return (
                      <TableRow key={customer._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {customer.contact ? (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {customer.contact}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                No contact
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {customer.analytics.totalOrders}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${customer.analytics.averageOrderValue.toFixed(2)}{" "}
                            avg
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${customer.analytics.totalSpent.toFixed(2)}
                          </div>
                          {customer.analytics.lastOrderDate && (
                            <div className="text-sm text-muted-foreground">
                              Last:{" "}
                              {new Date(
                                customer.analytics.lastOrderDate
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={segment.variant}
                            className="flex items-center gap-1"
                          >
                            <Icon className="w-3 h-3" />
                            {segment.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {customer.role === "admin" ? (
                            <Badge variant="destructive" className="text-xs">
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Customer
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/customers/${customer._id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(customer)}
                              >
                                <User className="w-4 h-4 mr-2" />
                                Edit Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <User className="w-4 h-4 mr-2" />
                                Delete Customer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information for {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Customer email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact</label>
              <Input
                value={editForm.contact}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, contact: e.target.value }))
                }
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={editForm.role}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, role: value }))
                }
              >
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
            <Button onClick={handleEditCustomer}>Update Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCustomer?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCustomer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Customer name"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={addForm.email}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Customer email"
              />
            </div>

            <div className="space-y-2">
              <Label>Contact</Label>
              <Input
                value={addForm.contact}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, contact: e.target.value }))
                }
                placeholder="Phone number"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={addForm.role}
                onValueChange={(value) =>
                  setAddForm((prev) => ({ ...prev, role: value }))
                }
              >
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
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setIsCreating(true);
                try {
                  await createCustomer({
                    name: addForm.name,
                    email: addForm.email,
                    contact: addForm.contact,
                    role: addForm.role === "admin" ? "admin" : "customer",
                  });
                  toast.success("Customer added successfully");
                  setAddForm({
                    name: "",
                    email: "",
                    contact: "",
                    role: "customer",
                  });
                  setCreateDialogOpen(false);
                } catch (error) {
                  toast.error("Failed to add customer");
                } finally {
                  setIsCreating(false);
                }
              }}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

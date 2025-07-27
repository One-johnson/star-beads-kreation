"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const AddCustomer = ({ open, onClose }: Props) => {
  const createCustomer = useMutation(api.customers.createCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    role: "customer" as "customer" | "admin",
  });

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await createCustomer(form);
      toast.success("Customer created");
      onClose(); // close dialog
    } catch (error) {
      toast.error("Failed to create customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>Fill the form to add a customer</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label>Contact</Label>
            <Input
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="024 xxxx xxxx"
            />
          </div>
          <div>
            <Label>Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) => setForm({ ...form, role: value as "customer" | "admin" })}
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

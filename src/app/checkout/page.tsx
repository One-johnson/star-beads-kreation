"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Id } from "@/../convex/_generated/dataModel";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Ghana",
  });
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  // Get cart data
  const cart = useQuery(
    api.authMutations.getCart,
    user ? { userId: user.userId } : "skip"
  );

  // Mutations
  const createOrder = useMutation(api.authMutations.createOrder);
  const clearCart = useMutation(api.authMutations.clearCart);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          You must be logged in to checkout.
        </div>
      </div>
    );
  }

  if (cart === undefined) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">Loading checkout...</div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center text-muted-foreground">
          Your cart is empty.{" "}
          <Button variant="link" onClick={() => router.push("/products")}>
            Continue shopping
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 5.99; // Fixed shipping cost
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
  if (!PAYSTACK_PUBLIC_KEY) {
    toast.error("Paystack public key is not configured.");
    return null;
  }
  const handleCheckout = () => {
    // Validate required fields
    const requiredFields: (keyof ShippingInfo)[] = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zipCode",
    ];
    const missingFields = requiredFields.filter(
      (field) => !shippingInfo[field]
    );

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }
    setShowPaymentDialog(true);
  };

  const handlePayWithMomo = async () => {
    if (!paymentMethod || !mobileNumber) {
      toast.error(
        "Please select a mobile money provider and enter your number."
      );
      return;
    }
    setIsProcessing(true);

    // Ensure this runs only in the browser
    if (typeof window === "undefined") {
      toast.error("Payment can only be processed in the browser.");
      setIsProcessing(false);
      return;
    }

    try {
      // Wait for dialog to be open and DOM to be ready
      await new Promise((resolve) => setTimeout(resolve, 100)); // short delay

      const PaystackPop = (await import("@paystack/inline-js")).default;
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: shippingInfo.email,
        amount: total * 100,
        currency: "GHS",
        channels: ["mobile_money"],
        metadata: {
          custom_fields: [
            {
              display_name: "Mobile Money Number",
              variable_name: "mobile_number",
              value: mobileNumber,
            },
            {
              display_name: "Provider",
              variable_name: "provider",
              value: paymentMethod,
            },
          ],
        },
        onSuccess: async (transaction) => {
          try {
            const orderId = await createOrder({
              userId: user.userId,
              items: cart.items.map((item) => ({
                ...item,
                productId: item.productId as Id<"products">,
              })),
              total: total,
              shippingInfo: shippingInfo,
              paymentStatus: "paid",
              paymentMethod,
              transactionId: transaction.reference,
              mobileNumber,
            });
            await clearCart({ userId: user.userId });
            toast.success("Order placed successfully!");
            router.push(`/orders/${orderId}`);
          } catch (error) {
            toast.error("Failed to place order. Please try again.");
          } finally {
            setIsProcessing(false);
            setShowPaymentDialog(false);
          }
        },
        onCancel: () => {
          toast.error("Payment was not completed.");
          setIsProcessing(false);
          setShowPaymentDialog(false);
        },
      });
    } catch (err) {
      toast.error(
        "Payment initialization failed. Please refresh and try again."
      );
      setIsProcessing(false);
      setShowPaymentDialog(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={shippingInfo.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={shippingInfo.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={shippingInfo.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={shippingInfo.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={(e) =>
                      handleInputChange("zipCode", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={shippingInfo.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Dialog
                  open={showPaymentDialog}
                  onOpenChange={setShowPaymentDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing
                        ? "Processing..."
                        : `Pay with Mobile Money - GHS ${total.toFixed(2)}`}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <div className="space-y-4">
                      <DialogTitle className="text-xl font-bold">
                        Pay with Mobile Money
                      </DialogTitle>
                      <Select
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="mtn">MTN Momo</SelectItem>
                            <SelectItem value="airteltigo">
                              AirtelTigo Cash
                            </SelectItem>
                            <SelectItem value="vodafone">
                              Telecel Cash
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Input
                        id="mobileNumber"
                        type="tel"
                        placeholder="Mobile Money Number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                      />
                      <Button
                        onClick={handlePayWithMomo}
                        disabled={isProcessing}
                        className="w-full"
                        size="lg"
                      >
                        {isProcessing ? "Processing..." : "Pay Now"}
                      </Button>
                      <DialogClose asChild>
                        <Button variant="outline" className="w-full">
                          Cancel
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

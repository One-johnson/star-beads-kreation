"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Mail,
  Bell,
  CheckCircle,
  AlertCircle,
  Settings,
  TestTube
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EmailSettingsPage() {
  const { user } = useAuth();
  const sendTestEmail = useAction(api.emailActions.sendTestEmail);
  const testOrderCreation = useAction(api.emailActions.testOrderCreation);
  
  const [emailSettings, setEmailSettings] = useState({
    orderConfirmation: true,
    orderProcessing: true,
    orderShipped: true,
    orderDelivered: true,
    orderCancelled: true,
    testEmail: "",
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

  const handleSettingToggle = (setting: string) => {
    setEmailSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleTestEmail = async () => {
    if (!emailSettings.testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    try {
      await sendTestEmail({ to: emailSettings.testEmail });
      toast.success("Test email sent successfully!");
    } catch (error) {
      toast.error("Failed to send test email");
      console.error("Test email error:", error);
    }
  };

  const handleTestOrderEmail = async () => {
    if (!emailSettings.testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    try {
      await testOrderCreation({ customerEmail: emailSettings.testEmail });
      toast.success("Test order email sent successfully!");
    } catch (error) {
      toast.error("Failed to send test order email");
      console.error("Test order email error:", error);
    }
  };

  const emailTypes = [
    {
      key: "orderConfirmation",
      title: "Order Confirmation",
      description: "Sent when a new order is placed",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      key: "orderProcessing",
      title: "Order Processing",
      description: "Sent when order status changes to processing",
      icon: Settings,
      color: "text-blue-600"
    },
    {
      key: "orderShipped",
      title: "Order Shipped",
      description: "Sent when order is shipped with tracking info",
      icon: Bell,
      color: "text-purple-600"
    },
    {
      key: "orderDelivered",
      title: "Order Delivered",
      description: "Sent when order is marked as delivered",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      key: "orderCancelled",
      title: "Order Cancelled",
      description: "Sent when order is cancelled",
      icon: AlertCircle,
      color: "text-red-600"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Email Settings</h1>
          <p className="text-muted-foreground">
            Configure email notifications for order updates
          </p>
        </div>
      </div>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {emailTypes.map((emailType) => {
            const Icon = emailType.icon;
            const isEnabled = emailSettings[emailType.key as keyof typeof emailSettings] as boolean;
            
            return (
              <div key={emailType.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${emailType.color}`} />
                  <div>
                    <div className="font-medium">{emailType.title}</div>
                    <div className="text-sm text-muted-foreground">{emailType.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={isEnabled ? "default" : "secondary"}>
                    {isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleSettingToggle(emailType.key)}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Test Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="testEmail"
                type="email"
                placeholder="Enter email address to send test email"
                value={emailSettings.testEmail}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, testEmail: e.target.value }))}
              />
              <Button onClick={handleTestEmail} disabled={!emailSettings.testEmail}>
                Send Test
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleTestOrderEmail} 
                disabled={!emailSettings.testEmail}
                variant="outline"
                className="w-full"
              >
                Test Order Email
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Send a test email to verify your email configuration is working correctly.
          </p>
        </CardContent>
      </Card>

      {/* Email Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Email Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Email service is connected and ready</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Using Resend email service for reliable delivery
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 
"use client";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, CheckCircle, Bell, Star, ShoppingCart, User, Mail, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

const iconMap: Record<string, React.ReactNode> = {
  order: <ShoppingCart className="w-4 h-4 text-blue-600" />,
  "order-status": <CheckCircle className="w-4 h-4 text-green-600" />,
  review: <Star className="w-4 h-4 text-yellow-500" />,
  signup: <User className="w-4 h-4 text-purple-600" />,
  welcome: <Mail className="w-4 h-4 text-blue-600" />,
  message: <Mail className="w-4 h-4 text-blue-600" />,
  stock: <AlertCircle className="w-4 h-4 text-red-600" />,
};

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    user ? { userId: user.userId } : "skip"
  );
  const markRead = useMutation(api.notifications.markNotificationRead);
  const markAllRead = useMutation(api.notifications.markAllNotificationsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const deleteAllNotifications = useMutation(api.notifications.deleteAllNotifications);

  if (!user) {
    return <div className="max-w-2xl mx-auto p-8 text-center text-muted-foreground">Sign in to view your notifications.</div>;
  }

  const loading = notifications === undefined;
  const types = [
    { key: "all", label: "All" },
    { key: "order", label: "Orders" },
    { key: "order-status", label: "Order Status" },
    { key: "review", label: "Reviews" },
    { key: "signup", label: "Signups" },
    { key: "welcome", label: "Welcome" },
    { key: "message", label: "Messages" },
    { key: "stock", label: "Stock" },
  ];

  let filtered = notifications || [];
  if (filter !== "all") filtered = filtered.filter((n) => n.type === filter);
  if (readFilter !== "all") filtered = filtered.filter((n) => (readFilter === "read" ? n.read : !n.read));
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > paginated.length;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markAllRead({ userId: user.userId })}>
            Mark all as read
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              await deleteAllNotifications({ userId: user.userId });
              toast.success("All notifications deleted");
            }}
          >
            Delete all
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {types.map((t) => (
          <Button
            key={t.key}
            variant={filter === t.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </Button>
        ))}
        <Button
          variant={readFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setReadFilter("all")}
        >
          All
        </Button>
        <Button
          variant={readFilter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setReadFilter("unread")}
        >
          Unread
        </Button>
        <Button
          variant={readFilter === "read" ? "default" : "outline"}
          size="sm"
          onClick={() => setReadFilter("read")}
        >
          Read
        </Button>
      </div>
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No notifications found.</div>
        ) : (
          paginated.map((n) => (
            <div
              key={n._id}
              className={`flex items-start gap-3 p-4 rounded-lg border bg-background shadow-sm transition ${!n.read ? "bg-blue-50 border-blue-200" : ""}`}
            >
              <div className="pt-1">{iconMap[n.type] || <Bell className="w-4 h-4" />}</div>
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  {n.title}
                  {!n.read && <Badge variant="default">New</Badge>}
                </div>
                <div className="text-sm text-gray-700">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
                {n.link && (
                  <Link href={n.link} className="text-blue-600 underline text-sm mt-1 inline-block">
                    View
                  </Link>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">
                {!n.read && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => markRead({ notificationId: n._id })}
                    title="Mark as read"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    await deleteNotification({ notificationId: n._id });
                    toast.success("Notification deleted");
                  }}
                  title="Delete notification"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
} 
import React, { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, CheckCircle, AlertCircle, Mail, Star, ShoppingCart, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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

export function NotificationDropdown() {
  const { user } = useAuth();
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    user ? { userId: user.userId } : "skip"
  );
  const markRead = useMutation(api.notifications.markNotificationRead);
  const markAllRead = useMutation(api.notifications.markAllNotificationsRead);
  const prevIds = useRef<string[]>([]);

  // Toast for new notifications
  useEffect(() => {
    if (!notifications) return;
    const prev = prevIds.current;
    const newNotifs = notifications.filter(
      (n) => !n.read && !prev.includes(n._id)
    );
    if (newNotifs.length > 0) {
      newNotifs.forEach((n) => {
        toast(
          <div className="flex items-start gap-2">
            <span>{iconMap[n.type] || <Bell className="w-4 h-4" />}</span>
            <div>
              <div className="font-medium">{n.title}</div>
              <div className="text-sm text-gray-700">{n.message}</div>
            </div>
          </div>,
          {
            action: {
              label: n.link ? "View" : "Mark as read",
              onClick: async () => {
                await markRead({ notificationId: n._id });
                if (n.link) window.location.href = n.link;
              },
            },
            duration: 7000,
          }
        );
      });
    }
    prevIds.current = notifications.map((n) => n._id);
  }, [notifications, markRead]);

  if (!user) return null;

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;
  const loading = notifications === undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2" aria-label="Notifications">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-w-full">
        <div className="flex items-center justify-between px-2 py-2 border-b">
          <span className="font-semibold">Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await markAllRead({ userId: user.userId });
            }}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto divide-y">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n._id}
                className={`flex items-start gap-3 py-3 cursor-pointer transition ${!n.read ? "bg-blue-100 border-l-4 border-blue-500" : ""}`}
                onClick={async () => {
                  if (!n.read) await markRead({ notificationId: n._id });
                }}
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
                </div>
                {n.link && (
                  <Link href={n.link} className="ml-2 text-blue-600 underline" onClick={() => {}}>
                    View
                  </Link>
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuLabel className="text-center text-muted-foreground py-6">No notifications yet.</DropdownMenuLabel>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-2 text-center">
          <Link href="/notifications" className="text-blue-600 underline text-sm">
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
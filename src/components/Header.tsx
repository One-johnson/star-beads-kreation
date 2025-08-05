"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { NotificationDropdown } from "@/components/NotificationDropdown";

export function Header() {
  const { user, setSessionToken } = useAuth();
  
  // Get cart count for the current user
  const cartCount = useQuery(
    api.authQueries.getCartCount,
    user ? { userId: user.userId } : "skip"
  );

  // Get wishlist count for the current user
  const wishlistCount = useQuery(
    api.wishlist.getUserWishlist,
    user ? { userId: user.userId } : "skip"
  );

  const pathname = usePathname();

  const handleLogout = () => {
    setSessionToken(null);
  };

  return (
    <header className="w-full border-b bg-background/80 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          Star Beads Kreation
        </Link>
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/" className={pathname === "/" ? "font-bold text-primary underline underline-offset-4" : "hover:underline underline-offset-4"}>Home</Link>
          <Link href="/products" className={pathname.startsWith("/products") ? "font-bold text-primary underline underline-offset-4" : "hover:underline underline-offset-4"}>Products</Link>
          <Link href="/categories" className={pathname.startsWith("/categories") ? "font-bold text-primary underline underline-offset-4" : "hover:underline underline-offset-4"}>Categories</Link>
          <Link href="/gallery" className={pathname.startsWith("/gallery") ? "font-bold text-primary underline underline-offset-4" : "hover:underline underline-offset-4"}>Gallery</Link>
          <Link href="/blog" className={pathname.startsWith("/blog") ? "font-bold text-primary underline underline-offset-4" : "hover:underline underline-offset-4"}>Blog</Link>
          <Link href="/about" className={pathname.startsWith("/about") ? "font-bold text-primary underline underline-offset-4" : "hover:underline underline-offset-4"}>About</Link>
          {user?.role === "admin" && (
            <Link href="/admin" className={pathname.startsWith("/admin") ? "font-bold text-primary underline underline-offset-4" : "hover:underline underline-offset-4 text-primary font-medium"}>Admin</Link>
          )}
        </div>
        {/* Desktop Right Side Actions */}
        <div className="hidden md:flex gap-3 items-center">
          <NotificationDropdown />
          {user && (
            <Button asChild variant="outline" size="sm" className="relative">
              <Link href="/wishlist">
                <Heart className="w-4 h-4" />
                {wishlistCount !== undefined && wishlistCount.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {wishlistCount.length > 99 ? "99+" : wishlistCount.length}
                  </Badge>
                )}
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="relative">
            <Link href="/cart">
              <ShoppingCart className="w-4 h-4" />
              {cartCount !== undefined && cartCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Link>
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="w-8 h-8">
                    {/* No AvatarImage, just show initials */}
                    <AvatarFallback>{(user.name ? user.name[0] : user.email[0])?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b mb-2">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">Orders</Link>
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <div className="my-2 border-t" />
                <DropdownMenuItem asChild>
                  <ThemeToggle />
                </DropdownMenuItem>
                <div className="my-2 border-t" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth" className="hover:underline underline-offset-4">Sign In</Link>
          )}
        </div>
        {/* Mobile Hamburger Menu */}
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pt-12 w-64">
              <SheetTitle className="sr-only">Main Navigation</SheetTitle>
              <nav className="flex flex-col gap-6">
                <Link href="/" className={pathname === "/" ? "text-lg  font-bold text-primary" : "text-lg font-medium"}>Home</Link>
                <Link href="/products" className={pathname.startsWith("/products") ? "text-lg font-bold text-primary" : "text-lg font-medium"}>Products</Link>
                <Link href="/categories" className={pathname.startsWith("/categories") ? "text-lg font-bold text-primary" : "text-lg font-medium"}>Categories</Link>
                <Link href="/gallery" className={pathname.startsWith("/gallery") ? "text-lg font-bold text-primary" : "text-lg font-medium"}>Gallery</Link>
                <Link href="/blog" className={pathname.startsWith("/blog") ? "text-lg font-bold text-primary" : "text-lg font-medium"}>Blog</Link>
                <Link href="/about" className={pathname.startsWith("/about") ? "text-lg font-bold text-primary" : "text-lg font-medium"}>About</Link>
                {user?.role === "admin" && (
                  <Link href="/admin" className={pathname.startsWith("/admin") ? "text-lg font-bold text-primary" : "text-lg font-medium text-primary"}>Admin</Link>
                )}
                <div className="border-t my-2" />
                {user ? (
                  <>
                    <Link href="/profile" className="text-lg">Profile</Link>
                    <Link href="/orders" className="text-lg">Orders</Link>
                    <Button variant="ghost" className="justify-start p-0 text-lg text-red-600" onClick={handleLogout}>Logout</Button>
                  </>
                ) : (
                  <Link href="/auth" className="text-lg">Sign In</Link>
                )}
                <div className="border-t my-2" />
                <ThemeToggle />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
} 
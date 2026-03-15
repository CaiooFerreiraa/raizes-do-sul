"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Painel", icon: LayoutDashboard },
    { href: "/admin/produtos", label: "Produtos", icon: Package },
    { href: "/admin/pedidos", label: "Encomendas", icon: ShoppingBag },
  ];

  return (
    <nav className="space-y-3">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl font-medium transition-all cursor-pointer group",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-primary group-hover:scale-110 transition-transform")} />
            <span className="font-display text-lg">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

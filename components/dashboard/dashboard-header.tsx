"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { tituloDeRuta } from "@/lib/navegacion";

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <h2 className="truncate text-sm font-medium">{tituloDeRuta(pathname)}</h2>
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto"
        nativeButton={false}
        render={<Link href="/" />}
      >
        <Home />
        <span className="hidden sm:inline">Ir al sitio</span>
      </Button>
    </header>
  );
}

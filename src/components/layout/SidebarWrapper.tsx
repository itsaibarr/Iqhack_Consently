"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { ReactNode, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SidebarWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main 
        className={cn(
            "min-h-screen transition-all duration-300",
            isCollapsed ? "pl-20" : "pl-72"
        )}
      >
        {children}
      </main>
    </>
  );
}

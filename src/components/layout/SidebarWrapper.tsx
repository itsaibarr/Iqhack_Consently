"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";

export function SidebarWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="pl-72 min-h-screen">
        {children}
      </main>
    </>
  );
}

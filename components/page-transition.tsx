"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Keying on pathname forces a remount on navigation, replaying the CSS
 * fade-in animation — a simple page-transition without extra dependencies. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in-up">
      {children}
    </div>
  );
}

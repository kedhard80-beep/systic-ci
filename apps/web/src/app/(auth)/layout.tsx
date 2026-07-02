import type { ReactNode } from "react";
import Link from "next/link";
import { SysticLogo } from "@/components/ui/SysticLogo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-grey-light dark:bg-[#0A1630] flex flex-col">
      {/* Top bar */}
      <header className="p-4 flex items-center justify-between container-section">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          {/* Logo clair (mode light) */}
          <span className="block dark:hidden">
            <SysticLogo variant="light" height={28} />
          </span>
          {/* Logo sombre (mode dark) */}
          <span className="hidden dark:block">
            <SysticLogo variant="dark" height={28} />
          </span>
        </Link>
        <div className="text-sm text-grey-text dark:text-white/50">
          Besoin d&apos;aide ?{" "}
          <Link href="/contact" className="text-primary hover:underline font-heading font-semibold">
            Contactez-nous
          </Link>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-grey-text dark:text-white/30">
        © {new Date().getFullYear()} SYSTIC-CI — Tous droits réservés ·{" "}
        <Link href="/faq" className="hover:text-primary">FAQ</Link>
      </footer>
    </div>
  );
}

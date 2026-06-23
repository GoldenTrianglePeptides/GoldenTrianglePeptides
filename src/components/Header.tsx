"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gold/30 bg-navy text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="rounded-lg bg-white p-1">
            <Image src="/logo-mark.svg" alt="Golden Triangle Peptides" width={40} height={40} />
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-lg font-semibold tracking-wide">
              GOLDEN TRIANGLE
            </span>
            <span className="block text-[0.7rem] tracking-[0.3em] text-gold-light">
              PEPTIDES
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/products" className="hover:text-gold-light">
            Shop
          </Link>
          <Link href="/products?category=Healing+%26+Recovery" className="hover:text-gold-light">
            Recovery
          </Link>
          <Link href="/products?category=Metabolic+Research" className="hover:text-gold-light">
            Metabolic
          </Link>
          <Link href="/about" className="hover:text-gold-light">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link href="/account" className="hover:text-gold-light">
                Hi, {user.name.split(" ")[0]}
              </Link>
              {user.isAdmin && (
                <Link href="/admin" className="hover:text-gold-light">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-gold-light hover:underline"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden hover:text-gold-light sm:block">
              Sign in
            </Link>
          )}

          <Link
            href="/cart"
            className="relative rounded-full border border-gold/40 px-3 py-1.5 hover:border-gold-light"
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-xs font-bold text-navy-dark">
                {count}
              </span>
            )}
          </Link>

          <button
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-gold/20 bg-navy-dark px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/products" onClick={() => setMenuOpen(false)}>
              Shop
            </Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            {user ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)}>
                  My Account
                </Link>
                <button onClick={handleLogout} className="text-left text-gold-light">
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

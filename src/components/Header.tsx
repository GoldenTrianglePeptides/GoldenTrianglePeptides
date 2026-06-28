"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";

const NAV = [
  { href: "/products", label: "Products" },
  { href: "/calculator", label: "Dosage Calculator" },
  { href: "/blog", label: "Research" },
  { href: "/certifications", label: "Independent Certifications" },
  { href: "/contact", label: "Contact" },
];

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
    <header className="sticky top-0 z-40 shadow-sm">
      {/* Announcement bar */}
      <div className="bg-navy-dark py-1.5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold-light">
        Free shipping on U.S. orders over $400 · For research use only
      </div>

      {/* Utility row */}
      <div className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/goldentriangle.png"
              alt="Golden Triangle Peptides"
              width={2400}
              height={1960}
              className="h-14 w-auto sm:h-16"
            />
          </Link>

          <div className="flex items-center gap-5">
            <div className="hidden text-right text-xs leading-tight text-navy/70 lg:block">
              <a
                href="mailto:support@goldentrianglepeptide.com"
                className="block font-medium text-navy hover:text-gold"
              >
                support@goldentrianglepeptide.com
              </a>
              <span>Mon–Fri · 9am–5pm CT</span>
            </div>

            <form action="/products" className="hidden sm:block">
              <div className="flex items-center overflow-hidden rounded-full border border-black/15 focus-within:border-gold">
                <input
                  type="search"
                  name="search"
                  placeholder="Search products"
                  aria-label="Search products"
                  className="w-36 px-3 py-1.5 text-sm outline-none md:w-44"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="flex h-8 w-9 items-center justify-center bg-gold text-navy-dark"
                >
                  <SearchIcon />
                </button>
              </div>
            </form>

            <Link
              href="/cart"
              className="relative text-navy hover:text-gold"
              aria-label="Cart"
            >
              <CartIcon />
              {count > 0 && (
                <span className="absolute -right-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-xs font-bold text-gold-light">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Nav row */}
      <div className="border-b border-gold/30 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <nav className="hidden items-center gap-7 py-3 text-sm font-medium text-navy md:flex">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-gold">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 py-3 text-sm md:flex">
            {user ? (
              <>
                <Link href="/account" className="text-navy hover:text-gold">
                  Hi, {user.name.split(" ")[0]}
                </Link>
                {user.isAdmin && (
                  <Link href="/admin" className="text-navy hover:text-gold">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="font-semibold text-gold hover:underline"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 font-semibold uppercase tracking-wide text-navy hover:text-gold"
              >
                <UserIcon /> Login
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="ml-auto py-3 text-2xl text-navy md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-b border-gold/20 bg-white px-4 py-4 md:hidden">
          <form action="/products" className="mb-3">
            <input
              type="search"
              name="search"
              placeholder="Search products"
              aria-label="Search products"
              className="w-full rounded-full border border-black/15 px-4 py-2 text-sm outline-none focus:border-gold"
            />
          </form>
          <div className="flex flex-col gap-2 text-sm font-medium text-navy">
            <Link href="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)}>
                  My Account
                </Link>
                {user.isAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left font-semibold text-gold"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="21" r="1.4" fill="currentColor" />
      <circle cx="18" cy="21" r="1.4" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 20a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

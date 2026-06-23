import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/30 bg-navy-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-serif text-lg font-semibold tracking-wide">
            GOLDEN TRIANGLE
          </p>
          <p className="text-[0.7rem] tracking-[0.3em] text-gold-light">
            PEPTIDES
          </p>
          <p className="mt-3 text-sm text-white/70">
            Precision peptides. Purpose driven. Research-grade compounds with
            third-party verified purity.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gold-light">Shop</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/products" className="hover:text-gold-light">All Products</Link></li>
            <li><Link href="/products?category=Healing+%26+Recovery" className="hover:text-gold-light">Recovery</Link></li>
            <li><Link href="/products?category=Metabolic+Research" className="hover:text-gold-light">Metabolic</Link></li>
            <li><Link href="/products?category=Lab+Supplies" className="hover:text-gold-light">Lab Supplies</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gold-light">Account</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/account" className="hover:text-gold-light">My Account</Link></li>
            <li><Link href="/account" className="hover:text-gold-light">Order History</Link></li>
            <li><Link href="/cart" className="hover:text-gold-light">Cart</Link></li>
            <li><Link href="/register" className="hover:text-gold-light">Create Account</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gold-light">Company</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/about" className="hover:text-gold-light">About Us</Link></li>
            <li><Link href="/about#contact" className="hover:text-gold-light">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5">
        <div className="mx-auto max-w-6xl text-xs text-white/60">
          <p className="mb-2 font-semibold text-white/80">
            Research Use Only — Not for Human Consumption
          </p>
          <p>
            All products sold by Golden Triangle Peptides are intended strictly
            for laboratory research and development purposes. They are not drugs,
            foods, cosmetics, or supplements, and may not be used for diagnostic,
            therapeutic, or any in-vivo use in humans or animals. By purchasing,
            you certify you are a qualified researcher 21 years or older.
          </p>
          <p className="mt-3">
            © {new Date().getFullYear()} Golden Triangle Peptides. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

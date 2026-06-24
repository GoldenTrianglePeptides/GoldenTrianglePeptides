import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/30 bg-navy-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-white p-1">
              <Image
                src="/logo-mark.png"
                alt="Golden Triangle Peptides"
                width={36}
                height={36}
              />
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-base font-semibold tracking-wide">
                GOLDEN TRIANGLE
              </span>
              <span className="block text-[0.65rem] tracking-[0.3em] text-gold-light">
                PEPTIDES
              </span>
            </span>
          </div>
          <p className="mt-4 text-sm text-white/70">
            For research use only. Not for human or veterinary use.
          </p>
          <a
            href="mailto:support@goldentrianglepeptide.com"
            className="mt-4 block text-sm text-white/80 hover:text-gold-light"
          >
            support@goldentrianglepeptide.com
          </a>
          <p className="text-sm text-white/60">Mon–Fri · 9am–5pm CT</p>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
            Storefront
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link href="/" className="hover:text-gold-light">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-gold-light">
                Products
              </Link>
            </li>
            <li>
              <Link href="/certifications" className="hover:text-gold-light">
                Independent Certifications
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gold-light">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
            Policies
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link href="/privacy" className="hover:text-gold-light">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-gold-light">
                Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-gold-light">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-gold-light">
                My Account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
            Company
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link href="/about" className="hover:text-gold-light">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-gold-light">
                Create Account
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-gold-light">
                Cart
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5">
        <div className="mx-auto max-w-6xl text-xs text-white/60">
          <p className="mb-2 font-semibold uppercase tracking-wide text-white/80">
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
            © {new Date().getFullYear()} Golden Triangle Peptides. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import Image from 'next/image';

export function LandingFooter(): JSX.Element {
  return (
    <footer className="border-t border-border bg-slate-900 text-slate-300">
      <div className="mx-auto w-full max-w-[1200px] px-s4 py-s12">
        <div className="grid gap-s8 md:grid-cols-4">
          <div className="space-y-s2">
            <div className="flex items-center gap-s2">
              <span className="grid size-10 place-items-center overflow-hidden rounded-md border border-slate-700 bg-white">
                <Image
                  src="/favicon/favicon.svg"
                  alt="Garixo logo"
                  width={30}
                  height={30}
                  className="size-7"
                />
              </span>
              <p className="text-h3 text-white">Garixo</p>
            </div>
            <p className="text-small text-slate-400">
              Simple garage management software for independent auto repair shop
              owners.
            </p>
          </div>

          <div className="space-y-s2">
            <p className="text-small font-semibold text-white">Product</p>
            <div className="space-y-s1 text-small text-slate-400">
              <p>
                <Link
                  href="/features/work-orders-management"
                  className="hover:text-white"
                >
                  Work Orders
                </Link>
              </p>
              <p>
                <Link
                  href="/features/customers-management"
                  className="hover:text-white"
                >
                  Customers
                </Link>
              </p>
              <p>
                <Link
                  href="/features/inventory-management"
                  className="hover:text-white"
                >
                  Inventory
                </Link>
              </p>
              <p>
                <Link
                  href="/features/staff-management"
                  className="hover:text-white"
                >
                  Staff
                </Link>
              </p>
            </div>
          </div>

          <div className="space-y-s2">
            <p className="text-small font-semibold text-white">Resources</p>
            <div className="space-y-s1 text-small text-slate-400">
              <p>
                <Link href="/blog" className="hover:text-white">
                  Blog
                </Link>
              </p>
              <p>
                <Link href="/case-studies" className="hover:text-white">
                  Case Studies
                </Link>
              </p>
              <p>
                <Link href="/pricing" className="hover:text-white">
                  Pricing
                </Link>
              </p>
              <p>
                <Link href="/features" className="hover:text-white">
                  Feature Guides
                </Link>
              </p>
            </div>
          </div>

          <div className="space-y-s2">
            <p className="text-small font-semibold text-white">Company</p>
            <div className="space-y-s1 text-small text-slate-400">
              <p>
                <Link href="/privacy-policy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </p>
              <p>
                <Link href="/term-of-services" className="hover:text-white">
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-s8 border-t border-slate-800 pt-s6 text-caption text-slate-500">
          <p>© 2026 Garixo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

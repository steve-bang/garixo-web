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
              Garage management software for auto repair shop owners.
            </p>
          </div>

          <div className="space-y-s2">
            <p className="text-small font-semibold text-white">Product</p>
            <div className="space-y-s1 text-small text-slate-400">
              <p>
                <Link
                  href="/features/garage-management"
                  className="hover:text-white"
                >
                  Garage Management
                </Link>
              </p>
              <p>
                <Link
                  href="/features/inventory-management"
                  className="hover:text-white"
                >
                  Inventory Management
                </Link>
              </p>
              <p>
                <Link
                  href="/features/technician-tracking"
                  className="hover:text-white"
                >
                  Technician Tracking
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
            </div>
          </div>

          <div className="space-y-s2">
            <p className="text-small font-semibold text-white">Company</p>
            <div className="space-y-s1 text-small text-slate-400">
              <p>
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </p>
              <p>
                <Link href="/terms" className="hover:text-white">
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

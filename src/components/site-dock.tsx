import { House, Mail, Package } from "lucide-react";
import Link from "next/link";

import { SiteDockMotion } from "./site-dock-motion";
import styles from "./site-dock.module.css";

const destinations = [
  { label: "Home", href: "/", Icon: House },
  { label: "Products", href: "/products", Icon: Package },
  { label: "Contact", href: null, Icon: Mail },
] as const;

export function SiteDock({ current }: { current: "/" | "/products" }) {
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex justify-center px-4 pointer-events-none"
    >
      <SiteDockMotion>
        {destinations.map(({ label, href, Icon }) => (
          <li className={styles.item} key={label}>
            {href ? (
              <Link
                aria-current={current === href ? "page" : undefined}
                aria-label={label}
                className={styles.action}
                href={href}
              >
                <Icon aria-hidden="true" className={styles.icon} size={19} />
              </Link>
            ) : (
              <button aria-label={label} className={styles.action} disabled type="button">
                <Icon aria-hidden="true" className={styles.icon} size={19} />
              </button>
            )}
            <span aria-hidden="true" className={styles.label}>
              {label}
            </span>
          </li>
        ))}
      </SiteDockMotion>
    </nav>
  );
}

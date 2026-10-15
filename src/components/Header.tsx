import Link from "next/link";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <Link href="/" className={styles.logo} aria-label="ZenithFlix home">
        Zenith<span className={styles.logoAccent}>Flix</span>
      </Link>
    </header>
  );
}

import Link from "next/link";
import { getSession } from "@/lib/session";
import { logout } from "@/app/login/actions";
import styles from "./Header.module.css";

export async function Header() {
  const user = await getSession();

  return (
    <header className={styles.header}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <Link href="/" className={styles.logo} aria-label="ZenithFlix home">
        Zenith<span className={styles.logoAccent}>Flix</span>
      </Link>

      {user ? (
        <>
          <button
            type="button"
            className={styles.avatar}
            popoverTarget="user-menu"
            aria-label={`Account menu for ${user.name}`}
          >
            <span aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
          </button>
          <div id="user-menu" popover="auto" className={styles.menu}>
            <p className={styles.menuUser}>
              Signed in as <strong>{user.name}</strong>
              <span className={styles.menuEmail}>{user.email}</span>
            </p>
            <form action={logout}>
              <button type="submit" className={styles.menuButton}>
                Sign out
              </button>
            </form>
          </div>
        </>
      ) : (
        <Link href="/login" className={styles.signIn}>
          Sign in
        </Link>
      )}
    </header>
  );
}

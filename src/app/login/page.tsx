import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Sign in · ZenithFlix" };

export default async function LoginPage() {
  // Already signed in → nothing to do here
  if (await getSession()) redirect("/");

  return (
    <main id="main" className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in</h1>
        <LoginForm />
        <p className={styles.hint}>
          Demo account: <strong>demo@zenithflix.dev</strong> /{" "}
          <strong>zenith-demo</strong>
        </p>
      </div>
    </main>
  );
}

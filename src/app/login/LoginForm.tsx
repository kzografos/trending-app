"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import styles from "./LoginForm.module.css";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.message && (
        <p role="alert" className={styles.formError}>
          {state.message}
        </p>
      )}

      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          aria-invalid={state.errors?.email ? true : undefined}
          aria-describedby={state.errors?.email ? "email-error" : undefined}
        />
        {state.errors?.email && (
          <p id="email-error" className={styles.fieldError}>
            {state.errors.email}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={state.errors?.password ? true : undefined}
          aria-describedby={
            state.errors?.password ? "password-error" : undefined
          }
        />
        {state.errors?.password && (
          <p id="password-error" className={styles.fieldError}>
            {state.errors.password}
          </p>
        )}
      </div>

      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

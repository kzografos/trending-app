"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import { validateLogin, type LoginErrors } from "@/lib/validateLogin";

// Public demo account, shown on the login page. A real app would look the user
// up in a database and compare a hashed password (bcrypt / argon2).
const DEMO_USER = {
  email: "demo@zenithflix.dev",
  password: "zenith-demo",
  name: "Demo",
};

export interface LoginState {
  errors?: LoginErrors;
  message?: string;
  /** Keeps what the user typed after a failed attempt */
  email?: string;
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors = validateLogin({ email, password });
  if (errors.email || errors.password) {
    return { errors, email };
  }

  if (
    email.toLowerCase() !== DEMO_USER.email ||
    password !== DEMO_USER.password
  ) {
    // Same message for both cases: don't reveal whether the email exists
    return { message: "Email or password is incorrect.", email };
  }

  await createSession({ email: DEMO_USER.email, name: DEMO_USER.name });
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/");
}

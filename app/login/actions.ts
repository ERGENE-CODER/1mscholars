"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
} from "@/lib/validation";

export type SignUpState = {
  errors?: {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  message?: string;
  success?: boolean;
};

export type SignInState = {
  errors?: {
    email?: string;
    password?: string;
  };
  message?: string;
};

// Name of the temporary local-only session cookie used while Supabase is
// disconnected. Nothing here is a real credential store — it only lets the
// rest of the app (Get Started, etc.) be built and tested end-to-end.
// TODO: remove this entire local-session shim once Supabase is wired back
// in, and restore real auth.signUp / auth.signInWithPassword calls.
const SESSION_COOKIE = "1ms_session";

async function setLocalSession(payload: Record<string, string>) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function signUp(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const fullName = ((formData.get("fullName") as string) || "").trim();
  const email = ((formData.get("email") as string) || "").trim();
  const password = (formData.get("password") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  const errors: SignUpState["errors"] = {};

  const fullNameError = validateFullName(fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  const confirmError = validateConfirmPassword(password, confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await setLocalSession({ email, fullName });

  redirect("/getstarted");
}

export async function signIn(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = ((formData.get("email") as string) || "").trim();
  const password = (formData.get("password") as string) || "";

  const errors: SignInState["errors"] = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  if (!password) {
    errors.password = "Please enter your password.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // No backend is connected yet, so any well-formed email/password pair is
  // accepted. Real credential checking comes back with Supabase.
  await setLocalSession({ email });

  redirect("/getstarted");
}

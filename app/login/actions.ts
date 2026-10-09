"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { OPPORTUNITIES_PATH } from "@/lib/routes";
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
  /** Echoed back so React 19's automatic form reset doesn't wipe what the user typed. Never includes passwords. */
  values?: { fullName?: string; email?: string };
  message?: string;
  success?: boolean;
  email?: string;
};

export type SignInState = {
  errors?: {
    email?: string;
    password?: string;
  };
  values?: { email?: string };
  message?: string;
  /** True when the account exists but the email link hasn't been clicked yet. */
  needsConfirmation?: boolean;
};

export type ResendState = {
  message?: string;
  sent?: boolean;
};

function isRateLimited(error: AuthError) {
  return (
    error.status === 429 ||
    error.code === "over_request_rate_limit" ||
    error.code === "over_email_send_rate_limit"
  );
}

function isConnectionProblem(error: AuthError) {
  return error.name === "AuthRetryableFetchError" || (error.status ?? 0) >= 500;
}

const ALREADY_EXISTS =
  "An account with this email already exists. Try signing in instead.";

export async function signUp(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const fullName = ((formData.get("fullName") as string) || "").trim();
  const email = ((formData.get("email") as string) || "").trim();
  const password = (formData.get("password") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";
  const values = { fullName, email };

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
    return { errors, values };
  }

  const supabase = await createClient();
  const siteUrl = getSiteUrl(await headers());

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { errors: { email: ALREADY_EXISTS }, values };
    }
    if (error.code === "weak_password") {
      return {
        errors: {
          password:
            "That password is too weak. Try a longer one with letters and numbers.",
        },
        values,
      };
    }
    if (error.code === "email_address_invalid") {
      return {
        errors: { email: "Please enter a valid email address." },
        values,
      };
    }
    if (error.code === "signup_disabled") {
      return {
        message: "Sign-ups are closed right now. Please try again later.",
        values,
      };
    }
    if (isRateLimited(error)) {
      return {
        message: "Too many attempts. Please wait a minute and try again.",
        values,
      };
    }
    if (isConnectionProblem(error)) {
      return {
        message:
          "We couldn't reach the server. Check your connection and try again.",
        values,
      };
    }
    console.error("signUp failed:", error);
    return {
      message: "We couldn't create your account. Please try again.",
      values,
    };
  }

  // Email confirmation is switched off in Supabase: the user is already signed in.
  if (data.session) {
    redirect("/getstarted");
  }

  // With confirmation on, Supabase answers "success" for an email that is
  // already registered but returns a user with no identities. Without this
  // check the person waits for an email that will never come.
  if (data.user && data.user.identities?.length === 0) {
    return { errors: { email: ALREADY_EXISTS }, values };
  }

  return {
    success: true,
    email,
    message: `We sent a confirmation link to ${email}. Open it, then sign in.`,
  };
}

export async function signIn(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = ((formData.get("email") as string) || "").trim();
  const password = (formData.get("password") as string) || "";
  const values = { email };

  const errors: SignInState["errors"] = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  if (!password) {
    errors.password = "Please enter your password.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (
      error.code === "email_not_confirmed" ||
      error.message.toLowerCase().includes("email not confirmed")
    ) {
      return {
        message: "Please confirm your email first. Check your inbox for the link.",
        needsConfirmation: true,
        values,
      };
    }
    if (isRateLimited(error)) {
      return {
        message: "Too many attempts. Please wait a minute and try again.",
        values,
      };
    }
    if (isConnectionProblem(error)) {
      return {
        message:
          "We couldn't reach the server. Check your connection and try again.",
        values,
      };
    }
    if (
      error.code === "invalid_credentials" ||
      error.message.toLowerCase().includes("invalid login credentials")
    ) {
      return { message: "Incorrect email or password.", values };
    }
    console.error("signIn failed:", error);
    return { message: "We couldn't sign you in. Please try again.", values };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", data.user.id)
    .maybeSingle();

  redirect(profile?.onboarding_completed ? OPPORTUNITIES_PATH : "/getstarted");
}

export async function resendConfirmation(
  _prevState: ResendState,
  formData: FormData
): Promise<ResendState> {
  const email = ((formData.get("email") as string) || "").trim();

  const emailError = validateEmail(email);
  if (emailError) return { message: emailError };

  const supabase = await createClient();
  const siteUrl = getSiteUrl(await headers());

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });

  if (error) {
    if (isRateLimited(error)) {
      return { message: "Please wait a minute before requesting another email." };
    }
    console.error("resendConfirmation failed:", error);
    return {
      message: "We couldn't resend the email. Please try again in a moment.",
    };
  }

  return { sent: true, message: `Confirmation email sent to ${email}.` };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?mode=login");
}

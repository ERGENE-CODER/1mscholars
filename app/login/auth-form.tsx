"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  resendConfirmation,
  signUp,
  signIn,
  type ResendState,
  type SignUpState,
  type SignInState,
} from "./actions";
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
} from "@/lib/validation";

type Mode = "signup" | "login";
type SignUpField = "fullName" | "email" | "password" | "confirmPassword";

const initialSignUpState: SignUpState = {};
const initialSignInState: SignInState = {};
const initialResendState: ResendState = {};

const inputClass =
  "h-[48px] w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#102F59] outline-none transition placeholder:text-gray-400 focus:border-[#2166E8] focus:ring-2 focus:ring-[#2166E8]/20 aria-invalid:border-red-500";

const primaryButtonClass =
  "flex h-[50px] w-full items-center justify-center rounded-xl bg-[#2166E8] text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#1554C7] disabled:cursor-not-allowed disabled:opacity-70";

const labelClass = "mb-1.5 block text-[14px] font-semibold text-[#102F59]";

/** Banners shown when /auth/callback sends someone back here (?notice=...). */
const NOTICES: Record<string, { tone: "info" | "error"; text: string }> = {
  "confirm-done": {
    tone: "info",
    text: "If you've confirmed your email, sign in below to continue.",
  },
  "link-expired": {
    tone: "error",
    text: "That confirmation link has expired or was already used. Enter your details below and we'll send a new one.",
  },
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-[13px] font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

function PasswordInput({
  id,
  name,
  autoComplete,
  placeholder,
  error,
  onBlur,
}: {
  id: string;
  name: string;
  autoComplete: string;
  placeholder: string;
  error?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          onBlur={onBlur}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-0 top-0 flex h-[48px] w-[60px] items-center justify-center text-[13px] font-semibold text-gray-500 transition hover:text-[#2166E8]"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

/** Lives outside any <form> (nested forms are invalid HTML). */
function ResendConfirmation({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    resendConfirmation,
    initialResendState
  );

  return (
    <form action={formAction} className="mt-4 text-center">
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={pending || !email}
        className="text-[14px] font-semibold text-[#2166E8] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending..." : "Resend confirmation email"}
      </button>
      {state.message && (
        <p
          role="status"
          className={`mt-2 text-[13px] font-medium ${
            state.sent ? "text-green-600" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

function SignUpForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [state, formAction, pending] = useActionState(
    signUp,
    initialSignUpState
  );

  // Inline (on-blur) messages. They're tied to the server `state` they were
  // written against, so a fresh submit result always takes over.
  const [live, setLive] = useState<{
    ref: SignUpState;
    errors: Partial<Record<SignUpField, string | null>>;
  }>({ ref: state, errors: {} });
  const liveErrors = live.ref === state ? live.errors : {};

  function errorFor(field: SignUpField): string | undefined {
    if (field in liveErrors) return liveErrors[field] ?? undefined;
    return state.errors?.[field];
  }

  function validateField(field: SignUpField, form: HTMLFormElement | null) {
    if (!form) return;
    const data = new FormData(form);
    const get = (n: string) => ((data.get(n) as string) || "").toString();
    const next: Partial<Record<SignUpField, string | null>> = {};

    if (field === "fullName") next.fullName = validateFullName(get("fullName"));
    if (field === "email") next.email = validateEmail(get("email"));
    if (field === "password") {
      next.password = validatePassword(get("password"));
      // Changing the password can make a previously-typed confirmation wrong.
      if (get("confirmPassword")) {
        next.confirmPassword = validateConfirmPassword(
          get("password"),
          get("confirmPassword")
        );
      }
    }
    if (field === "confirmPassword") {
      next.confirmPassword = validateConfirmPassword(
        get("password"),
        get("confirmPassword")
      );
    }

    setLive((prev) => ({
      ref: state,
      errors: { ...(prev.ref === state ? prev.errors : {}), ...next },
    }));
  }

  if (state.success) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF5FF] text-[28px]">
          ✉️
        </div>
        <h2 className="text-[20px] font-bold text-[#12396B]">Almost there</h2>
        <p className="mt-2 text-[14px] leading-[22px] text-gray-500">
          {state.message}
        </p>
        <p className="mt-2 text-[13px] leading-[20px] text-gray-400">
          Can&apos;t find it? Check your spam folder.
        </p>
        <ResendConfirmation email={state.email ?? ""} />
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="mt-6 text-[14px] font-semibold text-[#2166E8] hover:underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          defaultValue={state.values?.fullName}
          aria-invalid={Boolean(errorFor("fullName"))}
          onBlur={(e) => validateField("fullName", e.currentTarget.form)}
          className={inputClass}
        />
        <FieldError message={errorFor("fullName")} />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state.values?.email}
          aria-invalid={Boolean(errorFor("email"))}
          onBlur={(e) => validateField("email", e.currentTarget.form)}
          className={inputClass}
        />
        <FieldError message={errorFor("email")} />
        {errorFor("email")?.includes("already exists") && (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="mt-1 text-[13px] font-semibold text-[#2166E8] hover:underline"
          >
            Go to sign in
          </button>
        )}
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errorFor("password")}
          onBlur={(e) => validateField("password", e.currentTarget.form)}
        />
        <p className="mt-1.5 text-[13px] text-gray-500">
          Use at least 8 characters.
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm Password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errorFor("confirmPassword")}
          onBlur={(e) => validateField("confirmPassword", e.currentTarget.form)}
        />
      </div>

      {state.message && (
        <p className="text-[14px] font-medium text-red-600" role="alert">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center text-[14px] text-gray-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-[#2166E8] hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const [state, formAction, pending] = useActionState(
    signIn,
    initialSignInState
  );

  return (
    <div>
      <form action={formAction} className="space-y-5" noValidate>
        <div>
          <label htmlFor="login-email" className={labelClass}>
            Email Address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(state.errors?.email)}
            className={inputClass}
          />
          <FieldError message={state.errors?.email} />
        </div>

        <div>
          <label htmlFor="login-password" className={labelClass}>
            Password
          </label>
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            error={state.errors?.password}
          />
        </div>

        {state.message && (
          <p className="text-[14px] font-medium text-red-600" role="alert">
            {state.message}
          </p>
        )}

        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {state.needsConfirmation && (
        <ResendConfirmation email={state.values?.email ?? ""} />
      )}

      <p className="mt-5 text-center text-[14px] text-gray-500">
        New to 1M Scholars?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold text-[#2166E8] hover:underline"
        >
          Create an account
        </button>
      </p>
    </div>
  );
}

export default function AuthForm() {
  // The URL is the single source of truth for which tab is showing. A plain
  // useState(initialMode) only reads its initial value once, so when someone
  // on /login?mode=login clicked "Get Started" in the header (same page,
  // new query string) the form stayed on Sign In.
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const mode: Mode = searchParams.get("mode") === "login" ? "login" : "signup";
  const isSignUp = mode === "signup";
  const notice = isSignUp ? null : NOTICES[searchParams.get("notice") ?? ""];

  function setMode(next: Mode) {
    if (next === mode) return;
    // Integrates with Next's router, so useSearchParams updates instantly
    // and refresh / back / shared links keep the chosen tab.
    window.history.replaceState(null, "", `${pathname}?mode=${next}`);
  }

  return (
    <div className="w-full max-w-[440px] rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,45,90,0.08)] sm:p-10">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold leading-[32px] text-[#12396B]">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-[14px] leading-[22px] text-gray-500">
          {isSignUp
            ? "Join 1M Scholars and discover opportunities that can help shape your future."
            : "Sign in to continue exploring opportunities built for your future."}
        </p>
      </div>

      {notice && (
        <p
          role="status"
          className={`mb-6 rounded-xl px-4 py-3 text-[14px] font-medium ${
            notice.tone === "error"
              ? "bg-red-50 text-red-700"
              : "bg-[#EEF5FF] text-[#12396B]"
          }`}
        >
          {notice.text}
        </p>
      )}

      <div
        role="tablist"
        aria-label="Sign in or create an account"
        className="mb-7 flex rounded-xl bg-[#EEF5FF] p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isSignUp}
          onClick={() => setMode("signup")}
          className={`h-[40px] flex-1 rounded-lg text-[14px] font-semibold transition ${
            isSignUp
              ? "bg-white text-[#12396B] shadow-sm"
              : "text-[#2166E8]/70 hover:text-[#2166E8]"
          }`}
        >
          Create Account
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isSignUp}
          onClick={() => setMode("login")}
          className={`h-[40px] flex-1 rounded-lg text-[14px] font-semibold transition ${
            !isSignUp
              ? "bg-white text-[#12396B] shadow-sm"
              : "text-[#2166E8]/70 hover:text-[#2166E8]"
          }`}
        >
          Sign In
        </button>
      </div>

      {isSignUp ? (
        <SignUpForm onSwitchToLogin={() => setMode("login")} />
      ) : (
        <SignInForm onSwitchToSignUp={() => setMode("signup")} />
      )}

      <p className="mt-8 text-center text-[13px] text-gray-400">
        By continuing you agree to 1M Scholars&apos;{" "}
        <Link href="/aboutus" className="underline hover:text-[#2166E8]">
          terms
        </Link>
        .
      </p>
    </div>
  );
}

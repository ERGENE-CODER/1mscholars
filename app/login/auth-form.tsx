"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUp, signIn, type SignUpState, type SignInState } from "./actions";
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
} from "@/lib/validation";

type Mode = "signup" | "login";

const initialSignUpState: SignUpState = {};
const initialSignInState: SignInState = {};

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
}: {
  id: string;
  name: string;
  autoComplete: string;
  placeholder: string;
  error?: string;
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
          className="
            h-[48px]
            w-full
            rounded-xl
            border
            border-[#CBD5E1]
            bg-white
            px-4
            pr-12
            text-[15px]
            text-[#102F59]
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-[#2166E8]
            focus:ring-2
            focus:ring-[#2166E8]/20
          "
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="
            absolute
            right-0
            top-0
            flex
            h-[48px]
            w-[48px]
            items-center
            justify-center
            text-[13px]
            font-semibold
            text-gray-500
            transition
            hover:text-[#2166E8]
          "
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

function SignUpForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [state, formAction, pending] = useActionState(
    signUp,
    initialSignUpState
  );
  const [liveErrors, setLiveErrors] = useState<SignUpState["errors"]>({});

  function handleBlur(field: string, value: string, all: FormData | null) {
    let message: string | null = null;
    if (field === "fullName") message = validateFullName(value);
    if (field === "email") message = validateEmail(value);
    if (field === "password") message = validatePassword(value);
    if (field === "confirmPassword" && all) {
      message = validateConfirmPassword(
        (all.get("password") as string) || "",
        value
      );
    }
    setLiveErrors((prev) => ({ ...prev, [field]: message ?? undefined }));
  }

  if (state.success) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF5FF] text-[28px]">
          ✉️
        </div>
        <h2 className="text-[20px] font-bold text-[#12396B]">
          Almost there
        </h2>
        <p className="mt-2 text-[14px] leading-[22px] text-gray-500">
          {state.message}
        </p>
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
        <label
          htmlFor="fullName"
          className="mb-1.5 block text-[14px] font-semibold text-[#102F59]"
        >
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          aria-invalid={Boolean(state.errors?.fullName || liveErrors?.fullName)}
          onBlur={(e) => handleBlur("fullName", e.target.value, null)}
          className="
            h-[48px]
            w-full
            rounded-xl
            border
            border-[#CBD5E1]
            bg-white
            px-4
            text-[15px]
            text-[#102F59]
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-[#2166E8]
            focus:ring-2
            focus:ring-[#2166E8]/20
          "
        />
        <FieldError message={state.errors?.fullName || liveErrors?.fullName} />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[14px] font-semibold text-[#102F59]"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(state.errors?.email || liveErrors?.email)}
          onBlur={(e) => handleBlur("email", e.target.value, null)}
          className="
            h-[48px]
            w-full
            rounded-xl
            border
            border-[#CBD5E1]
            bg-white
            px-4
            text-[15px]
            text-[#102F59]
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-[#2166E8]
            focus:ring-2
            focus:ring-[#2166E8]/20
          "
        />
        <FieldError message={state.errors?.email || liveErrors?.email} />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[14px] font-semibold text-[#102F59]"
        >
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={state.errors?.password || liveErrors?.password}
        />
        <p className="mt-1.5 text-[13px] text-gray-500">
          Use at least 8 characters.
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-[14px] font-semibold text-[#102F59]"
        >
          Confirm Password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={state.errors?.confirmPassword || liveErrors?.confirmPassword}
        />
      </div>

      {state.message && (
        <p className="text-[14px] font-medium text-red-600" role="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="
          flex
          h-[50px]
          w-full
          items-center
          justify-center
          rounded-xl
          bg-[#2166E8]
          text-[15px]
          font-semibold
          text-white
          shadow-sm
          transition
          hover:bg-[#1554C7]
          disabled:cursor-not-allowed
          disabled:opacity-70
        "
      >
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
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="login-email"
          className="mb-1.5 block text-[14px] font-semibold text-[#102F59]"
        >
          Email Address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(state.errors?.email)}
          className="
            h-[48px]
            w-full
            rounded-xl
            border
            border-[#CBD5E1]
            bg-white
            px-4
            text-[15px]
            text-[#102F59]
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-[#2166E8]
            focus:ring-2
            focus:ring-[#2166E8]/20
          "
        />
        <FieldError message={state.errors?.email} />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-1.5 block text-[14px] font-semibold text-[#102F59]"
        >
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

      <button
        type="submit"
        disabled={pending}
        className="
          flex
          h-[50px]
          w-full
          items-center
          justify-center
          rounded-xl
          bg-[#2166E8]
          text-[15px]
          font-semibold
          text-white
          shadow-sm
          transition
          hover:bg-[#1554C7]
          disabled:cursor-not-allowed
          disabled:opacity-70
        "
      >
        {pending ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-[14px] text-gray-500">
        New to 1M Scholars?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold text-[#2166E8] hover:underline"
        >
          Create an account
        </button>
      </p>
    </form>
  );
}

export default function AuthForm({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);

  const isSignUp = mode === "signup";

  return (
    <div
      className="
        w-full
        max-w-[440px]
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-8
        shadow-[0_20px_60px_rgba(15,45,90,0.08)]
        sm:p-10
      "
    >
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
          className={`
            h-[40px]
            flex-1
            rounded-lg
            text-[14px]
            font-semibold
            transition
            ${
              isSignUp
                ? "bg-white text-[#12396B] shadow-sm"
                : "text-[#2166E8]/70 hover:text-[#2166E8]"
            }
          `}
        >
          Create Account
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isSignUp}
          onClick={() => setMode("login")}
          className={`
            h-[40px]
            flex-1
            rounded-lg
            text-[14px]
            font-semibold
            transition
            ${
              !isSignUp
                ? "bg-white text-[#12396B] shadow-sm"
                : "text-[#2166E8]/70 hover:text-[#2166E8]"
            }
          `}
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

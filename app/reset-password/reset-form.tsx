"use client";

import { useActionState } from "react";
import {
  PasswordInput,
  labelClass,
  primaryButtonClass,
} from "@/app/login/auth-form";
import { updatePassword, type ResetState } from "./actions";

const initialState: ResetState = {};

export default function ResetForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <div className="w-full max-w-[440px] rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,45,90,0.08)] sm:p-10">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold leading-[32px] text-[#12396B]">
          Choose a new password
        </h1>
        <p className="mt-2 text-[14px] leading-[22px] text-gray-500">
          Pick a password you haven&apos;t used before. You&apos;ll be signed in
          right after.
        </p>
      </div>

      <form action={formAction} className="space-y-5" noValidate>
        <div>
          <label htmlFor="new-password" className={labelClass}>
            New Password
          </label>
          <PasswordInput
            id="new-password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={state.errors?.password}
          />
        </div>

        <div>
          <label htmlFor="confirm-new-password" className={labelClass}>
            Confirm New Password
          </label>
          <PasswordInput
            id="confirm-new-password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            error={state.errors?.confirmPassword}
          />
        </div>

        {state.message && (
          <p className="text-[14px] font-medium text-red-600" role="alert">
            {state.message}
          </p>
        )}

        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

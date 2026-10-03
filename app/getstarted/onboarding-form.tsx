"use client";

import { useActionState } from "react";
import Link from "next/link";
import { completeOnboarding, type OnboardingState } from "./actions";
import { EDUCATION_LEVELS, INTEREST_AREAS } from "@/lib/validation";

const initialState: OnboardingState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-[13px] font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

export default function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialState
  );

  if (state.success) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF5FF] text-[32px]">
          🎉
        </div>
        <h2 className="text-[24px] font-bold text-[#12396B]">
          You&apos;re all set!
        </h2>
        <p className="mx-auto mt-3 max-w-[380px] text-[15px] leading-[24px] text-gray-500">
          Your 1M Scholars profile is ready. Start exploring opportunities
          built for your future.
        </p>
        <Link
          href="/opportunity"
          className="
            mt-7
            inline-flex
            h-[50px]
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#2166E8]
            px-8
            text-[15px]
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-[#1554C7]
          "
        >
          Explore Opportunities
          <span className="text-[18px]">→</span>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-7" noValidate>
      <div>
        <label
          htmlFor="phoneNumber"
          className="mb-1.5 block text-[14px] font-semibold text-[#102F59]"
        >
          Phone Number
        </label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+250 7XX XXX XXX"
          aria-invalid={Boolean(state.errors?.phoneNumber)}
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
        <p className="mt-1.5 text-[13px] text-gray-500">
          Include your country code.
        </p>
        <FieldError message={state.errors?.phoneNumber} />
      </div>

      <fieldset>
        <legend className="mb-2 block text-[14px] font-semibold text-[#102F59]">
          Education Level
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {EDUCATION_LEVELS.map((level) => (
            <label key={level} className="relative">
              <input
                type="radio"
                name="educationLevel"
                value={level}
                className="peer sr-only"
              />
              <span
                className="
                  flex
                  h-[44px]
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[#CBD5E1]
                  px-2
                  text-center
                  text-[13px]
                  font-semibold
                  text-[#102F59]
                  transition
                  peer-checked:border-[#2166E8]
                  peer-checked:bg-[#EEF5FF]
                  peer-checked:text-[#2166E8]
                  peer-focus-visible:ring-2
                  peer-focus-visible:ring-[#2166E8]/30
                "
              >
                {level}
              </span>
            </label>
          ))}
        </div>
        <FieldError message={state.errors?.educationLevel} />
      </fieldset>

      <fieldset>
        <legend className="mb-2 block text-[14px] font-semibold text-[#102F59]">
          Areas of Interest
        </legend>
        <div className="flex flex-wrap gap-2">
          {INTEREST_AREAS.map((area) => (
            <label key={area} className="relative">
              <input
                type="checkbox"
                name="interests"
                value={area}
                className="peer sr-only"
              />
              <span
                className="
                  flex
                  h-[40px]
                  cursor-pointer
                  items-center
                  rounded-full
                  border
                  border-[#CBD5E1]
                  px-4
                  text-[13px]
                  font-semibold
                  text-[#102F59]
                  transition
                  peer-checked:border-[#2166E8]
                  peer-checked:bg-[#2166E8]
                  peer-checked:text-white
                  peer-focus-visible:ring-2
                  peer-focus-visible:ring-[#2166E8]/30
                "
              >
                {area}
              </span>
            </label>
          ))}
        </div>
        <FieldError message={state.errors?.interests} />
      </fieldset>

      <div>
        <label
          htmlFor="careerInterest"
          className="mb-1.5 block text-[14px] font-semibold text-[#102F59]"
        >
          Career / Study Interest
        </label>
        <input
          id="careerInterest"
          name="careerInterest"
          type="text"
          placeholder="e.g. Software Engineering, Public Health, Law"
          aria-invalid={Boolean(state.errors?.careerInterest)}
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
        <FieldError message={state.errors?.careerInterest} />
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
        {pending ? "Saving..." : "Complete Setup"}
      </button>
    </form>
  );
}

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  validateCareerInterest,
  validateEducationLevel,
  validateInterests,
  validatePhoneNumber,
} from "@/lib/validation";

export type OnboardingState = {
  errors?: {
    phoneNumber?: string;
    educationLevel?: string;
    interests?: string;
    careerInterest?: string;
  };
  /** Echoed back so React 19's automatic form reset doesn't clear the form on a failed submit. */
  values?: {
    phoneNumber?: string;
    educationLevel?: string;
    interests?: string[];
    careerInterest?: string;
  };
  message?: string;
  success?: boolean;
};

export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const phoneNumber = ((formData.get("phoneNumber") as string) || "").trim();
  const educationLevel = (
    (formData.get("educationLevel") as string) || ""
  ).trim();
  const interests = formData.getAll("interests").map(String);
  const careerInterest = (
    (formData.get("careerInterest") as string) || ""
  ).trim();

  const values = { phoneNumber, educationLevel, interests, careerInterest };
  const errors: OnboardingState["errors"] = {};

  const phoneError = validatePhoneNumber(phoneNumber);
  if (phoneError) errors.phoneNumber = phoneError;

  const educationError = validateEducationLevel(educationLevel);
  if (educationError) errors.educationLevel = educationError;

  const interestsError = validateInterests(interests);
  if (interestsError) errors.interests = interestsError;

  const careerError = validateCareerInterest(careerInterest);
  if (careerError) errors.careerInterest = careerError;

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return {
      message: "Your session has expired. Please sign in again.",
      values,
    };
  }

  const fields = {
    phone_number: phoneNumber,
    education_level: educationLevel,
    interests,
    career_interest: careerInterest,
    onboarding_completed: true,
  };

  const { data: updated, error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", data.claims.sub)
    .select("id");

  if (error) {
    console.error("completeOnboarding update failed:", error);
    return {
      message: "We couldn't save your details. Please try again.",
      values,
    };
  }

  // No row yet (e.g. the account was created before the profile trigger
  // existed): create it rather than leaving the person stuck on this page.
  if (!updated || updated.length === 0) {
    const claims = data.claims as {
      email?: string;
      user_metadata?: { full_name?: string };
    };
    const { error: insertError } = await supabase.from("profiles").insert({
      id: data.claims.sub,
      email: claims.email ?? null,
      full_name: claims.user_metadata?.full_name ?? null,
      ...fields,
    });

    if (insertError) {
      console.error("completeOnboarding insert failed:", insertError);
      return {
        message:
          "We couldn't save your details. Please sign out, sign in again, and retry.",
        values,
      };
    }
  }

  return { success: true };
}

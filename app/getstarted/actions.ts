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
    return { errors };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return {
      message: "Your session has expired. Please sign in again.",
    };
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({
      phone_number: phoneNumber,
      education_level: educationLevel,
      interests,
      career_interest: careerInterest,
      onboarding_completed: true,
    })
    .eq("id", data.claims.sub)
    .select("id");

  if (error || !updated || updated.length === 0) {
    return {
      message:
        "We couldn't save your details. Please sign out, sign in again, and retry.",
    };
  }

  return { success: true };
}
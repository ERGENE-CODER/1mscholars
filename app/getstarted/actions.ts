"use server";

import { cookies } from "next/headers";
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

// TODO: once Supabase is wired back in, verify the session via JWT
// (auth.getClaims()) and persist these details to the `profiles` table,
// as this action did before. For now it only validates the form and
// confirms a local session cookie is present.
const SESSION_COOKIE = "1ms_session";

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

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session) {
    return {
      message: "Your session has expired. Please sign in again.",
    };
  }

  // Nothing is persisted yet — there is no backend connected. This just
  // confirms the form is valid and lets the person continue to the
  // success screen. Real persistence comes back with Supabase.

  return { success: true };
}

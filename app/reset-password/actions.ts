"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OPPORTUNITIES_PATH } from "@/lib/routes";
import { validateConfirmPassword, validatePassword } from "@/lib/validation";

export type ResetState = {
  errors?: { password?: string; confirmPassword?: string };
  message?: string;
};

const EXPIRED = "/login?mode=forgot&notice=reset-expired";

export async function updatePassword(
  _prevState: ResetState,
  formData: FormData
): Promise<ResetState> {
  const password = (formData.get("password") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  const errors: ResetState["errors"] = {};
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  const confirmError = validateConfirmPassword(password, confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;
  if (Object.keys(errors).length > 0) return { errors };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect(EXPIRED);

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    if (error.code === "same_password") {
      return {
        errors: { password: "Choose a password you haven't used before." },
      };
    }
    if (error.code === "weak_password") {
      return {
        errors: {
          password:
            "That password is too weak. Try a longer one with letters and numbers.",
        },
      };
    }
    if (error.code === "session_not_found" || error.status === 401) {
      redirect(EXPIRED);
    }
    if (error.status === 429 || error.code === "over_request_rate_limit") {
      return { message: "Too many attempts. Please wait a minute and try again." };
    }
    console.error("updatePassword failed:", error);
    return { message: "We couldn't update your password. Please try again." };
  }

  // Sign out every other device that was using the old password (best effort).
  await supabase.auth.signOut({ scope: "others" });

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", auth.claims.sub)
    .maybeSingle();

  redirect(profile?.onboarding_completed ? OPPORTUNITIES_PATH : "/getstarted");
}

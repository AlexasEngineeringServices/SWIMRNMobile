import axios from "axios";
import { supabase } from "../lib/supabase";
import { verifyJWT } from "../utils/jwt";

export const deleteEmailVerificationToken = async (token: string) => {
  try {
    const { error } = await supabase.from("email_verification_tokens").delete().eq("token", token);
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

interface SendVerificationEmailParams {
  user_id: string;
  email: string;
}

export const sendVerificationEmail = async ({ user_id, email }: SendVerificationEmailParams) => {
  try {
    const response = await axios.post(
      `${SUPABASE_URL}/functions/v1/send-email-verification`,
      { user_id, email },
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    return { data: response.data, error: null };
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return {
      data: null,
      error: error.response?.data?.error || error.message || "Failed to send verification email",
    };
  }
};

export const validateEmailVerificationToken = async (token: string, email: string) => {
  try {
    // First verify JWT
    const { payload, error: jwtError } = await verifyJWT(token);
    if (jwtError) {
      throw new Error(jwtError);
    }

    // Verify token matches the email
    if (payload?.email !== email) {
      throw new Error("Invalid token: email mismatch");
    }

    const { data, error } = await supabase
      .from("email_verification_tokens")
      .select("user_id, expires_at")
      .eq("token", token)
      .eq("email", email)
      .single();

    if (error) throw error;

    // Double-check database expiration
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      throw new Error("Verification token has expired");
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Error validating email verification token:", error);
    return {
      data: null,
      error: error.message || "Failed to validate verification token",
    };
  }
};

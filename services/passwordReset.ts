import axios from "axios";
import { supabase } from "../lib/supabase";
import { verifyJWT } from "../utils/jwt";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

export const sendPasswordResetEmail = async (email: string) => {
  try {
    const response = await axios.post(
      `${SUPABASE_URL}/functions/v1/send-email-password-reset`,
      {
        email,
      },
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

export const updatePasswordUser = async (userId: string, password: string) => {
  try {
    const response = await axios.put(
      `${SUPABASE_URL}/auth/v1/admin/users/${userId}`,
      { password },
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          apikey: SUPABASE_SERVICE_KEY,
        },
      }
    );

    return { data: response.data, error: null };
  } catch (error: any) {
    console.error("Password update error:", error);
    return {
      data: null,
      error: error.response?.data?.error || error.message || "Failed to update password",
    };
  }
};

export const validatePasswordResetToken = async (token: string, email: string) => {
  try {
    console.log("validatePasswordResetToken called with:", { token, email });
    // First verify JWT
    const { payload, error: jwtError } = await verifyJWT(token);
    if (jwtError) {
      throw new Error(jwtError);
    }

    console.log("JWT Payload:", payload);

    // Verify token contains required claims
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid token payload");
    }

    const { data, error } = await supabase
      .from("password_reset_tokens")
      .select("user_id, expires_at")
      .eq("token", token)
      .eq("email", email)
      .single();

    if (error) throw error;

    if (new Date(data.expires_at) < new Date()) {
      throw new Error("Token expired");
    }

    return { valid: true, userId: data.user_id, error: null };
  } catch (error: any) {
    console.error("Error validating password reset token:", error);
    return { valid: false, userId: null, error: error.message };
  }
};

export const deletePasswordResetToken = async (token: string, email: string) => {
  try {
    const { error } = await supabase.from("password_reset_tokens").delete().match({ token, email });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

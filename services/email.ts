import axios from "axios";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

interface SendVerificationEmailParams {
  user_id: string;
  email: string;
}

export const sendVerificationEmail = async ({ user_id, email }: SendVerificationEmailParams) => {
  try {
    console.log("Sending verification email to:", email);

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

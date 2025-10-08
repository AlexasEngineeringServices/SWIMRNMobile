import { supabase } from "../lib/supabase";
export const updateProfileVerificationStatus = async (userId: string) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: true })
      .eq("id", userId);
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

export const getProfileById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, firstname")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const getProfileVerificationStatus = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_verified")
      .eq("email", email)
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// src/services/auth.ts
import { supabase } from "../lib/supabase";

export async function signInWithEmail({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

interface SignUpData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  device_number: string;
  device_name: string;
}

export const signUpWithEmail = async (data: SignUpData) => {
  try {
    console.log("Starting signup process...");

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw authError;
    }

    const user = authData.user;
    console.log("User data in supabase.auth.signUp:", user);

    if (!user) {
      console.error("No user returned from auth signup");
      throw new Error("User not created");
    }

    // Sign in immediately after signup to get a valid session
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      throw signInError;
    }

    console.log("Auth successful, checking user ID...");

    if (!user.id) {
      throw new Error("User ID is not available");
    }

    console.log("User ID verified, creating device...");

    let deviceData = null;
    let profileData = null;

    // 2. Insert device info
    try {
      const { data: newDeviceData, error: deviceError } = await supabase
        .from("devices")
        .insert([
          {
            user_id: user.id,
            device_number: data.device_number,
            device_name: data.device_name,
          },
        ])
        .select()
        .single();

      if (deviceError) {
        console.error("Device creation error:", deviceError);
        throw deviceError;
      }

      deviceData = newDeviceData;
      console.log("Device created successfully, creating profile...");

      // 3. Insert profile info linked to device
      const { data: newProfileData, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            device_id: deviceData.id,
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw profileError;
      }

      profileData = newProfileData;
      console.log("Profile created successfully");
    } catch (error) {
      if (deviceData?.id) {
        await supabase.from("devices").delete().eq("id", deviceData.id);
      }
      throw error;
    }

    return {
      data: { session: authData.session, user, deviceData, profileData },
      error: null,
    };
  } catch (error: any) {
    console.error("Signup process failed:", error);
    return {
      data: null,
      error: {
        message: error.message || "Registration failed",
        details: error.details || error,
      },
    };
  }
};

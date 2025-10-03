// src/services/auth.ts
import { supabase } from "../lib/supabase";

export async function signInWithEmail({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

interface DeviceInput {
  device_number: string;
  device_name: string;
}

interface SignUpData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  devices: DeviceInput[];
}

export const signUpWithEmail = async (data: SignUpData) => {
  try {
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

    if (!user.id) {
      throw new Error("User ID is not available");
    }

    let deviceData = null;
    let profileData = null;

    // 2. Insert multiple devices info
    try {
      const devicesToInsert = data.devices.map((device) => ({
        user_id: user.id,
        device_number: device.device_number,
        device_name: device.device_name,
      }));

      const { data: newDevicesData, error: deviceError } = await supabase
        .from("devices")
        .insert(devicesToInsert)
        .select();

      if (deviceError) {
        console.error("Device creation error:", deviceError);
        throw deviceError;
      }

      deviceData = newDevicesData;

      // 3. Insert profile info linked to device
      const { data: newProfileData, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw profileError;
      }

      profileData = newProfileData;
    } catch (error) {
      if (deviceData && deviceData.length > 0) {
        const deviceIds = deviceData.map((device) => device.id);
        await supabase.from("devices").delete().in("id", deviceIds);
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

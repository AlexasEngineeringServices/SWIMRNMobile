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
    if (data.devices.length === 0) {
      return {
        data: null,
        error: {
          message: "Invalid device data",
          details: "At least one device must be provided",
        },
      };
    }

    // Validate each device has required properties and non-empty values
    for (const [index, device] of data.devices.entries()) {
      if (!device) {
        return {
          data: null,
          error: {
            message: "Invalid device data",
            details: `Device at position ${index + 1} is undefined`,
          },
        };
      }

      if (typeof device.device_number !== "string" || device.device_number.trim() === "") {
        return {
          data: null,
          error: {
            message: "Invalid device data",
            details: `Device number is required and cannot be empty for device ${index + 1}`,
          },
        };
      }

      if (typeof device.device_name !== "string" || device.device_name.trim() === "") {
        return {
          data: null,
          error: {
            message: "Invalid device data",
            details: `Device name is required and cannot be empty for device ${index + 1}`,
          },
        };
      }
    }

    // Check for duplicate device numbers and names before proceeding
    const deviceNumbers = data.devices.map((device) => device.device_number);
    const deviceNames = data.devices.map((device) => device.device_name);

    // First check for duplicates within the submitted devices
    const uniqueDeviceNumbers = new Set(deviceNumbers);
    const uniqueDeviceNames = new Set(deviceNames);

    // Check for duplicate device numbers
    if (uniqueDeviceNumbers.size !== deviceNumbers.length) {
      return {
        data: null,
        error: {
          message: "Duplicate device numbers found in your submission",
          details: "Each device must have a unique device number",
        },
      };
    }

    // Check for duplicate device names
    if (uniqueDeviceNames.size !== deviceNames.length) {
      return {
        data: null,
        error: {
          message: "Duplicate device names found in your submission",
          details: "Each device must have a unique name",
        },
      };
    }

    // Then check if any device numbers already exist in the database
    const { data: existingDevices, error: deviceCheckError } = await supabase
      .from("devices")
      .select("device_number")
      .in("device_number", deviceNumbers);

    if (deviceCheckError) {
      return {
        data: null,
        error: {
          message: "Error checking device numbers",
          details: deviceCheckError,
        },
      };
    }

    if (existingDevices && existingDevices.length > 0) {
      const existingNumbers = existingDevices.map((d) => d.device_number).join(", ");
      return {
        data: null,
        error: {
          message: "Device numbers already registered",
          details: `The following device numbers are already registered: ${existingNumbers}`,
        },
      };
    }

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

import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  device_name?: string;
  device_number?: string;
  is_verified?: boolean;
  created_at?: string;
}

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<(() => void) | undefined>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  const fetchUserWithDevice = async (userId: string) => {
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, firstname, lastname, email, is_verified, created_at")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    // Fetch device information
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("device_name, device_number")
      .eq("user_id", userId)
      .single();

    if (deviceError && deviceError.code !== "PGRST116") {
      // Only throw if it's not a "not found" error
      throw deviceError;
    }

    // Combine profile and device data
    return {
      ...profile,
      device_name: device?.device_name || null,
      device_number: device?.device_number || null,
    } as UserProfile;
  };

  return {
    session: null,
    user: null,
    loading: true,
    initialized: false,
    setSession: (session) => set({ session }),
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    initialize: async () => {
      try {
        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        set({ session });

        if (session?.user?.id) {
          const userWithDevice = await fetchUserWithDevice(session.user.id);
          set({ user: userWithDevice });
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
          try {
            // Handle various auth events
            switch (event) {
              case "SIGNED_IN":
              case "TOKEN_REFRESHED":
              case "USER_UPDATED":
                set({ session });
                if (session?.user?.id) {
                  const userWithDevice = await fetchUserWithDevice(session.user.id);
                  set({ user: userWithDevice });
                }
                break;
              case "SIGNED_OUT":
                set({ session: null, user: null });
                break;
              default:
                set({ session });
                break;
            }
          } catch (error) {
            console.error("Error in auth state change:", error);
            // Reset state on error
            set({ session: null, user: null });
          }
        });

        set({ initialized: true, loading: false });

        // Cleanup subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        set({ loading: false, initialized: true });
      }
    },
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        set({ session: null, user: null });
      } catch (error) {
        console.error("Error signing out:", error);
      }
    },
  };
});

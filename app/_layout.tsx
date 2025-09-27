import { supabase } from "@/lib/supabase";
import { ThemeProvider } from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { swimTheme } from "../hooks/useCustomTheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <SafeAreaProvider>
          <ThemeProvider value={swimTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              {!session ? (
                <Stack.Screen
                  name="auth"
                  options={{
                    // Prevent going back to auth screen once logged in
                    headerShown: false,
                  }}
                />
              ) : (
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerShown: false,
                  }}
                />
              )}
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { swimTheme } from "../hooks/useCustomTheme";
import { useAuthStore } from "../store/authStore";

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { session, loading, initialized, initialize } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  if (!initialized || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={swimTheme.colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth" />;
  }

  return <>{children}</>;
}

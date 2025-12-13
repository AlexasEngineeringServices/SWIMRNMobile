import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
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

  // Block web access for authenticated routes
  if (Platform.OS === "web") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          backgroundColor: swimTheme.colors.background,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: swimTheme.colors.text,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Web Access Not Available
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: swimTheme.colors.border,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          This page is only accessible through the mobile app.
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: swimTheme.colors.border,
            textAlign: "center",
          }}
        >
          Please download the SWIM App to access this feature.
        </Text>
      </View>
    );
  }

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

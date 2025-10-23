import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import React from "react";
import { Avatar } from "react-native-paper";
import RouteGuard from "../../components/RouteGuard";
import { Colors } from "../../constants/theme";
import { swimTheme } from "../../hooks/useCustomTheme";
import { useAuthStore } from "../../store/authStore";

export default function TabLayout() {
  const user = useAuthStore((state) => state.user);
  const userInitials = user?.firstname
    ? `${user.firstname[0]}${user.lastname?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <RouteGuard>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: Colors.deepSkyBlue,
          tabBarInactiveTintColor: swimTheme.colors.border,
          headerShown: true,
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "500",
            marginBottom: 0,
            textAlign: "center",
          },
          tabBarIconStyle: {
            alignItems: "center",
            justifyContent: "center",
            marginTop: 0,
            marginBottom: 0,
          },
          tabBarItemStyle: {
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 0,
            height: 60,
          },
          tabBarStyle: {
            flexDirection: "row",
            height: 60,
            paddingBottom: 4,
            paddingTop: 4,
            backgroundColor: swimTheme.colors.card,
            borderTopWidth: 1,
            borderTopColor: swimTheme.colors.border,
          },
          tabBarButton: route.name === "usage-history" ? () => null : undefined,
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="home"
                size={28}
                color={color}
                style={{ alignSelf: "center" }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="devices"
          options={{
            title: "Devices",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="cellphone-link"
                size={28}
                color={color}
                style={{ alignSelf: "center" }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Avatar.Text
                size={28}
                label={userInitials}
                style={{ backgroundColor: swimTheme.colors.primary, alignSelf: "center" }}
                color={swimTheme.colors.card}
              />
            ),
          }}
        />
      </Tabs>
    </RouteGuard>
  );
}

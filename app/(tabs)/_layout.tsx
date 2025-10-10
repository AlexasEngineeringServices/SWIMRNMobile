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
        screenOptions={{
          tabBarActiveTintColor: Colors.deepSkyBlue,
          headerShown: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="usage-history"
          options={{
            title: "Usage History",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="water" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="devices"
          options={{
            title: "Devices",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cellphone-link" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Avatar.Text
                size={30}
                label={userInitials}
                style={{ backgroundColor: swimTheme.colors.primary }}
                color={swimTheme.colors.card}
              />
            ),
          }}
        />
      </Tabs>
    </RouteGuard>
  );
}

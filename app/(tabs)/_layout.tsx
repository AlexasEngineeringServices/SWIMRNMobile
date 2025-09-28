import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Avatar } from "react-native-paper";
import { Colors } from "../../constants/theme";
import { swimTheme } from "../../hooks/useCustomTheme";
import { supabase } from "../../lib/supabase";

export default function TabLayout() {
  const [userInitials, setUserInitials] = useState("U");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("firstname, lastname")
        .eq("id", session.user.id)
        .single();

      if (profile?.firstname) {
        const initials = `${profile.firstname[0]}${profile.lastname?.[0] || ""}`.toUpperCase();
        setUserInitials(initials);
      }
    }
  };

  return (
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
  );
}

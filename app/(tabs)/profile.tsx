import { Redirect, router } from "expo-router";

import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Button, Divider, Text } from "react-native-paper";
import { swimTheme } from "../../hooks/useCustomTheme";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    firstname?: string;
    lastname?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("firstname, lastname, email")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!session && !loading) {
    return <Redirect href="/auth" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={
            userProfile
              ? `${userProfile.firstname?.[0] || ""}${userProfile.lastname?.[0] || ""}`
              : "U"
          }
          style={{ backgroundColor: swimTheme.colors.primary }}
          color={swimTheme.colors.card}
        />
        <Text variant="headlineMedium" style={styles.name}>
          {userProfile?.firstname} {userProfile?.lastname}
        </Text>
        <Text variant="bodyLarge" style={styles.email}>
          {userProfile?.email}
        </Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.content}>{/* Add more profile options here if needed */}</View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSignOut}
          style={styles.signOutButton}
          buttonColor={swimTheme.colors.notification}
        >
          Sign Out
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: swimTheme.colors.background,
  },
  header: {
    alignItems: "center",
    padding: 32,
    backgroundColor: swimTheme.colors.card,
  },
  name: {
    color: swimTheme.colors.text,
    ...swimTheme.fonts.bold,
    marginTop: 16,
  },
  email: {
    color: swimTheme.colors.border,
    ...swimTheme.fonts.regular,
    marginTop: 4,
  },
  divider: {
    backgroundColor: swimTheme.colors.border,
    height: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  footer: {
    padding: 20,
    borderTopColor: swimTheme.colors.border,
    borderTopWidth: 1,
  },
  signOutButton: {
    borderRadius: 8,
  },
});

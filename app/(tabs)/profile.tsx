import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
// import removed, handled below
import React from "react";
import { Avatar, Button, Text } from "react-native-paper";
import { ChangePasswordModal } from "../../components/ChangePasswordModal";
import { EditProfileModal } from "../../components/EditProfileModal";
import { swimTheme } from "../../hooks/useCustomTheme";
import { useAuthStore } from "../../store/authStore";

export default function ProfileScreen() {
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = React.useState(false);
  const { user, loading, signOut, setUser } = useAuthStore();
  const openEditModal = () => setEditModalVisible(true);
  const closeEditModal = () => setEditModalVisible(false);
  const openChangePasswordModal = () => setChangePasswordVisible(true);
  const closeChangePasswordModal = () => setChangePasswordVisible(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) return null;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={84}
              label={user ? `${user.firstname?.[0] || ""}${user.lastname?.[0] || ""}` : "U"}
              style={styles.avatar}
              color="#FFF"
            />
          </View>
          <Text variant="headlineSmall" style={styles.name}>
            {user?.firstname} {user?.lastname}
          </Text>
          <Text variant="bodyLarge" style={styles.email}>
            {user?.email}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account Settings
            </Text>
            <View style={styles.optionContainer}>
              <Button
                mode="text"
                icon="account-edit"
                contentStyle={styles.optionButton}
                labelStyle={styles.optionButtonText}
                onPress={openEditModal}
              >
                Edit Profile
              </Button>
              <Button
                mode="text"
                icon="lock-reset"
                contentStyle={styles.optionButton}
                labelStyle={styles.optionButtonText}
                onPress={openChangePasswordModal}
              >
                Change Password
              </Button>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            mode="contained"
            icon="logout"
            onPress={handleSignOut}
            style={styles.signOutButton}
            contentStyle={styles.signOutContent}
            labelStyle={styles.signOutLabel}
          >
            Sign Out
          </Button>
        </View>
      </View>
      <EditProfileModal
        visible={editModalVisible}
        onDismiss={closeEditModal}
        user={user}
        setUser={setUser}
      />
      <ChangePasswordModal
        visible={changePasswordVisible}
        onDismiss={closeChangePasswordModal}
        user={user}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // ...existing code...
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
    color: swimTheme.colors.text,
  },
  error: {
    color: swimTheme.colors.notification,
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  success: {
    color: swimTheme.colors.primary,
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  button: {
    marginTop: 16,
    borderRadius: 32,
    backgroundColor: swimTheme.colors.primary,
    height: 48,
    justifyContent: "center",
  },
  buttonLabel: {
    color: swimTheme.colors.card,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonContent: {
    height: 48,
  },
  modalContainer: {
    backgroundColor: swimTheme.colors.background,
    margin: 24,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  modalInnerWrap: {
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: swimTheme.colors.text,
  },
  modalContent: {
    width: "100%",
    marginTop: 8,
  },
  container: {
    flex: 1,
    backgroundColor: swimTheme.colors.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: swimTheme.colors.primary + "10",
  },
  avatarContainer: {
    padding: 3,
    borderRadius: 45,
    backgroundColor: swimTheme.colors.primary + "20",
  },
  avatar: {
    backgroundColor: swimTheme.colors.primary,
  },
  name: {
    color: swimTheme.colors.text,
    ...swimTheme.fonts.bold,
    marginTop: 16,
  },
  email: {
    color: swimTheme.colors.text + "80",
    ...swimTheme.fonts.regular,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: swimTheme.colors.text,
    ...swimTheme.fonts.medium,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  optionContainer: {
    backgroundColor: swimTheme.colors.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  optionButton: {
    height: 56,
    justifyContent: "flex-start",
    paddingHorizontal: 16,
  },
  optionButtonText: {
    color: swimTheme.colors.text,
    ...swimTheme.fonts.regular,
    fontSize: 16,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
  },
  signOutButton: {
    borderRadius: 8,
    backgroundColor: swimTheme.colors.primary,
  },
  signOutContent: {
    height: 48,
  },
  signOutLabel: {
    color: "#FFF",
    ...swimTheme.fonts.medium,
    fontSize: 16,
  },
});
